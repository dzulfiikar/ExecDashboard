const dbName = 'analyticsdb';
const seedVersion = 'proper-demo-v1';
const now = new Date();
const nowMs = now.getTime();
const dayMs = 24 * 60 * 60 * 1000;

let generatedOidCounter = 1;

const targetDb = db.getSiblingDB(dbName);

function oid(hex) {
  return ObjectId(hex);
}

function generatedOid() {
  const suffix = generatedOidCounter.toString(16).padStart(18, '0');
  generatedOidCounter += 1;
  return ObjectId('65f000' + suffix);
}

function metricCount(type, value) {
  return { label: { type: type }, value: value };
}

function metricSummary(name, counts, totalComponents, trendSlope) {
  return {
    name: name,
    counts: counts,
    lastScanned: now,
    lastUpdated: now,
    trendSlope: trendSlope,
    totalComponents: totalComponents,
    reportingComponents: totalComponents,
    dataAvailable: true
  };
}

function timeSeries(type, values) {
  return values.map(function(value, index) {
    return {
      daysAgo: values.length - index - 1,
      timestamp: nowMs - ((values.length - index - 1) * dayMs),
      counts: [metricCount(type, value)]
    };
  });
}


function responseCount(type, value) {
  return { label: { type: type }, value: value };
}

function metricSummaryResponse(name, counts, totalComponents, trendSlope, appCriticality) {
  return {
    counts: counts,
    lastScanned: now,
    lastUpdated: now,
    trendSlope: trendSlope,
    totalComponents: totalComponents,
    reportingComponents: totalComponents,
    name: name,
    dataAvailable: true,
    appCriticality: appCriticality || null
  };
}

function responseTimeSeries(type, values) {
  return values.map(function(value, index) {
    return {
      daysAgo: values.length - index - 1,
      counts: [responseCount(type, value)]
    };
  });
}

function rollupMetricDetail(name, lob, level, type, summary, detailList) {
  const doc = {
    seedVersion: seedVersion,
    name: name,
    lob: lob,
    level: level,
    type: type.enumName,
    summary: summary,
    timeSeries: timeSeries(type.label, summary.counts.map(function(count) { return count.value; })),
    totalComponents: summary.totalComponents,
    reportingComponents: summary.reportingComponents,
    processed: true
  };
  if (detailList) {
    doc.productMetricDetailList = detailList;
  }
  return doc;
}

function upsertMany(collectionName, documents, keyFields) {
  const collection = targetDb.getCollection(collectionName);
  documents.forEach(function(doc) {
    const query = {};
    keyFields.forEach(function(field) {
      query[field] = doc[field];
    });
    collection.updateOne(query, { $set: doc }, { upsert: true });
  });
  print(collectionName + ': upserted ' + documents.length + ' document(s)');
}

function resetSeededCollections() {
  const collections = [
    'portfolio',
    'thumbnail',
    'portfolio_response',
    'executives',
    'executives_hierarchy',
    'building_blocks',
    'metrics_detail',
    'cards_list',
    'collector_updated_details',
    'collector_status',
    'authentication',
    'externalmonitor',
    'app_details',
    'portfolio_metric',
    'lob',
    'lob_metric',
    'component_metric',
    'track_user_views',
    'usertrack',
    'collectors',
    'collector_items',
    'executives_metrics',
    'app_metrics_details',
    'portfolio_metrics_details',
    'commits',
    'builds',
    'deployments',
    'service_now_issues',
    'library_policy_violations',
    'testmetrics'
  ];

  collections.forEach(function(collectionName) {
    targetDb.getCollection(collectionName).deleteMany({ seedVersion: seedVersion });
  });
}

const executives = [
  {
    eid: 'e1001',
    firstName: 'Avery',
    lastName: 'Stone',
    role: 'Chief Technology Officer',
    lob: 'Enterprise Platforms',
    order: 1,
    apps: [
      { id: 'APP-PLAT-001', name: 'Platform API', commonName: 'platform-api', bunit: 'Enterprise Platforms', criticality: 'High' },
      { id: 'APP-PLAT-002', name: 'Developer Portal', commonName: 'developer-portal', bunit: 'Enterprise Platforms', criticality: 'Medium' }
    ],
    favourites: ['e1002']
  },
  {
    eid: 'e1002',
    firstName: 'Jordan',
    lastName: 'Reed',
    role: 'VP Digital Banking',
    lob: 'Digital Banking',
    order: 2,
    apps: [
      { id: 'APP-DIG-001', name: 'Mobile Banking', commonName: 'mobile-banking', bunit: 'Digital Banking', criticality: 'Critical' },
      { id: 'APP-DIG-002', name: 'Payments Gateway', commonName: 'payments-gateway', bunit: 'Digital Banking', criticality: 'High' }
    ],
    favourites: ['e1001']
  },
  {
    eid: 'e1003',
    firstName: 'Morgan',
    lastName: 'Chen',
    role: 'VP Operations',
    lob: 'Operations',
    order: 3,
    apps: [
      { id: 'APP-OPS-001', name: 'Case Management', commonName: 'case-management', bunit: 'Operations', criticality: 'High' },
      { id: 'APP-OPS-002', name: 'Workflow Automation', commonName: 'workflow-automation', bunit: 'Operations', criticality: 'Medium' }
    ],
    favourites: ['e1001', 'e1002']
  }
];

const metricTypes = [
  { enumName: 'SCM_COMMITS', routeName: 'scm-commits', label: 'commits', base: 42, trend: 0.24 },
  { enumName: 'UNIT_TEST_COVERAGE', routeName: 'unit-test-coverage', label: 'coverage', base: 83, trend: 0.18 },
  { enumName: 'PRODUCTION_INCIDENTS', routeName: 'production-incidents', label: 'incidents', base: 2, trend: -0.12 },
  { enumName: 'SECURITY_VIOLATIONS', routeName: 'security-violations', label: 'violations', base: 5, trend: -0.2 },
  { enumName: 'PIPELINE_LEAD_TIME', routeName: 'pipeline-lead-time', label: 'hours', base: 7, trend: -0.08 },
  { enumName: 'OPEN_SOURCE_VIOLATIONS', routeName: 'open-source', label: 'violations', base: 3, trend: -0.1 },
  { enumName: 'TEST_AUTOMATION', routeName: 'test-automation', label: 'automated', base: 76, trend: 0.16 },
  { enumName: 'STATIC_CODE_ANALYSIS', routeName: 'static-code-analysis', label: 'issues', base: 12, trend: -0.14 },
  { enumName: 'PRODUCTION_RELEASES', routeName: 'production-releases', label: 'releases', base: 8, trend: 0.1 },
  { enumName: 'TRACEABILITY', routeName: 'traceability', label: 'traceability', base: 71, trend: 0.12 },
  { enumName: 'PERFORMANCE_TEST', routeName: 'performance-test', label: 'passing', base: 88, trend: 0.09 },
  { enumName: 'QUALITY', routeName: 'quality', label: 'score', base: 91, trend: 0.08 },
  { enumName: 'VELOCITY', routeName: 'open-source-violations', label: 'velocity', base: 24, trend: 0.07 },
  { enumName: 'WORK_IN_PROGRESS', routeName: 'work-in-progress', label: 'items', base: 14, trend: -0.05 },
  { enumName: 'STASH', routeName: 'stash', label: 'repos', base: 18, trend: 0.04 },
  { enumName: 'TOTAL_VALUE', routeName: 'total-value', label: 'value', base: 120, trend: 0.11 },
  { enumName: 'DEVOPSCUP', routeName: 'devopscup', label: 'score', base: 74, trend: 0.13 },
  { enumName: 'SAY_DO_RATIO', routeName: 'saydoratio', label: 'ratio', base: 82, trend: 0.06 },
  { enumName: 'TEST', routeName: 'test', label: 'tests', base: 140, trend: 0.05 },
  { enumName: 'CLOUD', routeName: 'cloud', label: 'cost', base: 65, trend: -0.03 },
  { enumName: 'DEPLOY', routeName: 'deploy', label: 'deployments', base: 11, trend: 0.1 },
  { enumName: 'BUILD', routeName: 'build', label: 'builds', base: 34, trend: 0.09 },
  { enumName: 'ENGINEERING_MATURITY', routeName: 'engineering-maturity', label: 'maturity', base: 79, trend: 0.15 }
];

function productComponents(app) {
  return [
    {
      name: app.name + ' Service',
      commonName: app.commonName + '-service',
      lob: app.bunit,
      dashboardDisplayName: app.name + ' Service',
      metricLevel: 'COMPONENT',
      url: 'https://github.com/example/' + app.commonName + '-service',
      reporting: true,
      productComponentDashboardId: generatedOid()
    },
    {
      name: app.name + ' Pipeline',
      commonName: app.commonName + '-pipeline',
      lob: app.bunit,
      dashboardDisplayName: app.name + ' Pipeline',
      metricLevel: 'COMPONENT',
      url: 'https://ci.example.com/job/' + app.commonName,
      reporting: true,
      productComponentDashboardId: generatedOid()
    }
  ];
}

function productDoc(app) {
  return {
    name: app.name,
    commonName: app.commonName,
    lob: app.bunit,
    dashboardDisplayName: app.name,
    metricLevel: 'PRODUCT',
    reporting: true,
    productDashboardId: generatedOid(),
    productComponentList: productComponents(app)
  };
}

function portfolioId(index) {
  return oid('655f0000000000000000000' + (index + 1));
}

function productBlockId() {
  return generatedOid();
}

function componentBlockId() {
  return generatedOid();
}

function metricDocsForLevel(metricLevelId, name, lob, level, totalComponents, appOffset) {
  return metricTypes.map(function(metric, metricIndex) {
    const value = metric.base + appOffset + metricIndex;
    return {
      seedVersion: seedVersion,
      metricLevelId: metricLevelId,
      name: name,
      lob: lob,
      level: level,
      type: metric.enumName,
      summary: metricSummary(metric.routeName, [metricCount(metric.label, value)], totalComponents, metric.trend),
      timeSeries: timeSeries(metric.label, [value - 3, value - 2, value - 1, value]),
      totalComponents: totalComponents,
      reportingComponents: totalComponents,
      processed: true
    };
  });
}

resetSeededCollections();

targetDb.portfolio_response.createIndex({ eid: 1 });
targetDb.executives.createIndex({ eid: 1 });
function ownerForExecutive(executive) {
  return {
    relatedTo: {
      username: executive.eid,
      firstName: executive.firstName,
      lastName: executive.lastName,
      userId: executive.eid,
      jobTitle: executive.role,
      role: executive.role
    },
    relation: 'BusinessOwner'
  };
}

targetDb.executives_hierarchy.createIndex({ eid: 1 });
targetDb.building_blocks.createIndex({ metricLevelId: 1 });
targetDb.metrics_detail.createIndex({ metricLevelId: 1 });
targetDb.cards_list.createIndex({ cardName: 1 }, { unique: true });
targetDb.authentication.createIndex({ username: 1 }, { unique: true });
targetDb.portfolio_metric.createIndex({ name: 1, lob: 1, type: 1 });
targetDb.lob_metric.createIndex({ name: 1, lob: 1, type: 1 });
targetDb.collectors.createIndex({ name: 1 });
targetDb.collector_items.createIndex({ collectorId: 1 });
targetDb.executives_metrics.createIndex({ appId: 1 });
targetDb.app_metrics_details.createIndex({ appId: 1, metricsName: 1 });
targetDb.portfolio_metrics_details.createIndex({ eid: 1, metricsName: 1 });
targetDb.track_user_views.createIndex({ userId: 1, timeStamp: 1 });
targetDb.usertrack.createIndex({ userEid: 1 });


const portfolioResponses = [];
const portfolios = [];
const thumbnails = [];
const executiveSummaries = [];
const executiveHierarchies = [];
const buildingBlocks = [];
let metricsDetails = [];
const appDetails = [];
const portfolioMetricDetails = [];
const lobDocs = [];
const lobMetricDetails = [];
const componentMetrics = [];
const trackUserViews = [];
const userTracks = [];
const collectors = [];
const collectorItems = [];
const executiveComponents = [];
const appMetricDetails = [];
const portfolioMetricDetailResponses = [];
metricTypes.forEach(function(metric, metricIndex) {
  const collectorId = generatedOid();
  collectors.push({
    _id: collectorId,
    seedVersion: seedVersion,
    name: metric.routeName + '-collector',
    collectorType: 'MetricsProcessor',
    enabled: true,
    online: true,
    lastExecuted: nowMs
  });
  collectorItems.push({
    _id: generatedOid(),
    seedVersion: seedVersion,
    description: metric.routeName + ' seeded collector item',
    niceName: metric.routeName,
    enabled: true,
    pushed: true,
    collectorId: collectorId,
    lastUpdated: nowMs,
    userConfigured: 'seed',
    options: { metric: metric.routeName, source: 'proper-demo' }
  });
});


executives.forEach(function(executive, execIndex) {
  const pId = portfolioId(execIndex);
  const products = executive.apps.map(productDoc);

  portfolios.push({
    _id: pId,
    seedVersion: seedVersion,
    name: executive.firstName + ' ' + executive.lastName,
    commonName: executive.eid,
    lob: executive.lob,
    dashboardDisplayName: executive.firstName + ' ' + executive.lastName,
    metricLevel: 'PORTFOLIO',
    thumbnail: 'assets/images/default-thumbnail.png',
    owners: [ownerForExecutive(executive)],
    products: products
  });

  thumbnails.push({
    _id: generatedOid(),
    seedVersion: seedVersion,
    name: executive.firstName + ' ' + executive.lastName,
    commonName: executive.eid,
    lob: executive.lob,
    dashboardDisplayName: executive.firstName + ' ' + executive.lastName,
    metricLevel: 'PORTFOLIO',
    thumbnail: 'assets/images/default-thumbnail.png',
    owners: [ownerForExecutive(executive)]
  });

  portfolioResponses.push({
    _id: pId,
    seedVersion: seedVersion,
    eid: executive.eid,
    lob: executive.lob,
    name: executive.firstName + ' ' + executive.lastName,
    order: executive.order,
    executive: {
      firstName: executive.firstName,
      lastName: executive.lastName,
      role: executive.role
    },
    lastUpdated: nowMs
  });

  executiveSummaries.push({
    seedVersion: seedVersion,
    eid: executive.eid,
    firstName: executive.firstName,
    lastName: executive.lastName,
    role: executive.role,
    appId: executive.apps.map(function(app) { return app.id; }),
    businessUnits: [executive.lob],
    configuredAppId: executive.apps.map(function(app) { return app.id; }),
    appDetails: executive.apps.reduce(function(result, app) {
      result[app.id] = app.name;
      return result;
    }, {}),
    appDetailsWithBunit: executive.apps.reduce(function(result, app) {
      result[app.id] = { appName: app.name, businessUnit: app.bunit, criticality: app.criticality };
      return result;
    }, {}),
    configuredApps: executive.apps.length,
    totalApps: executive.apps.length,
    reportingPercentage: 100,
    seniorExecutive: true,
    favourite: executive.favourites,
    lastUpdated: nowMs
  });

  executiveHierarchies.push({
    seedVersion: seedVersion,
    eid: executive.eid,
    designation: executive.role,
    role: executive.role,
    reportees: { direct: executive.favourites },
    directReportees: executive.favourites,
    linkedReportees: executive.favourites,
    lastUpdated: nowMs
  });

  const portfolioMetrics = metricTypes.map(function(metric, metricIndex) {
    const value = metric.base + execIndex + metricIndex;
    return metricSummary(metric.routeName, [metricCount(metric.label, value)], executive.apps.length, metric.trend);
  });

  buildingBlocks.push({
    _id: oid('655c0000000000000000000' + (execIndex + 1)),
    seedVersion: seedVersion,
    metricLevelId: executive.eid,
    name: executive.firstName + ' ' + executive.lastName,
    commonName: executive.eid,
    completeness: 96 - execIndex,
    dashboardDisplayName: executive.firstName + ' ' + executive.lastName,
    lob: executive.lob,
    poc: executive.firstName + '.' + executive.lastName + '@example.com',
    metricLevel: 'PORTFOLIO',
    totalExpectedMetrics: metricTypes.length,
    totalComponents: executive.apps.length,
    reportingComponents: executive.apps.length,
    metrics: portfolioMetrics,
    appCriticality: 'Portfolio',
    customField: 'seeded'
  });

  metricsDetails = metricsDetails.concat(metricDocsForLevel(executive.eid, executive.firstName + ' ' + executive.lastName, executive.lob, 'PORTFOLIO', executive.apps.length, execIndex));

  const productMetricDetailsByMetric = metricTypes.map(function(metric, metricIndex) {
    return executive.apps.map(function(app, appIndex) {
      const productValue = metric.base + execIndex + appIndex + metricIndex;
      const components = productComponents(app).map(function(component, compIndex) {
        const componentValue = productValue + compIndex;
        return rollupMetricDetail(
          component.name,
          executive.lob,
          'COMPONENT',
          metric,
          metricSummary(metric.routeName, [metricCount(metric.label, componentValue)], 1, metric.trend),
          null
        );
      });
      return rollupMetricDetail(
        app.name,
        executive.lob,
        'PRODUCT',
        metric,
        metricSummary(metric.routeName, [metricCount(metric.label, productValue)], 2, metric.trend),
        components
      );
    });
  });

  metricTypes.forEach(function(metric, metricIndex) {
    const portfolioValue = metric.base + execIndex + metricIndex;
    portfolioMetricDetails.push(rollupMetricDetail(
      executive.firstName + ' ' + executive.lastName,
      executive.lob,
      'PORTFOLIO',
      metric,
      metricSummary(metric.routeName, [metricCount(metric.label, portfolioValue)], executive.apps.length, metric.trend),
      productMetricDetailsByMetric[metricIndex]
    ));

    lobMetricDetails.push(rollupMetricDetail(
      executive.lob,
      executive.lob,
      'LOB',
      metric,
      metricSummary(metric.routeName, [metricCount(metric.label, portfolioValue)], executive.apps.length, metric.trend),
      productMetricDetailsByMetric[metricIndex]
    ));

    portfolioMetricDetailResponses.push({
      seedVersion: seedVersion,
      eid: executive.eid,
      executiveObjectId: pId,
      metricsName: metric.routeName,
      summary: metricSummaryResponse(metric.routeName, [responseCount(metric.label, portfolioValue)], executive.apps.length, metric.trend, 'Portfolio'),
      timeSeries: responseTimeSeries(metric.label, [portfolioValue - 3, portfolioValue - 2, portfolioValue - 1, portfolioValue])
    });
  });

  lobDocs.push({
    _id: generatedOid(),
    seedVersion: seedVersion,
    name: executive.lob,
    commonName: executive.lob,
    lob: executive.lob,
    dashboardDisplayName: executive.lob,
    owners: [ownerForExecutive(executive)],
    metricLevel: 'LOB',
    products: products,
    metricsId: generatedOid()
  });

  trackUserViews.push({
    seedVersion: seedVersion,
    view: 'executive',
    userId: executive.eid,
    executiveViewId: [executive.eid],
    applicationViewId: [],
    metricsName: 'scm-commits',
    timeStamp: nowMs - (execIndex * 3600000)
  });

  userTracks.push({
    seedVersion: seedVersion,
    userEid: executive.eid,
    userEmail: executive.firstName + '.' + executive.lastName + '@example.com',
    userName: executive.firstName + ' ' + executive.lastName,
    logginTime: [nowMs - (execIndex * 3600000), nowMs]
  });

  executive.apps.forEach(function(app, appIndex) {
    const productMetrics = metricTypes.map(function(metric, metricIndex) {
      const value = metric.base + execIndex + appIndex + metricIndex;
      return metricSummary(metric.routeName, [metricCount(metric.label, value)], 2, metric.trend);
    });

    buildingBlocks.push({
      _id: productBlockId(execIndex, appIndex),
      seedVersion: seedVersion,
      metricLevelId: app.id,
      name: app.name,
      commonName: app.commonName,
      completeness: 91 - appIndex,
      dashboardDisplayName: app.name,
      lob: executive.lob,
      poc: 'team-' + app.commonName + '@example.com',
      url: 'https://example.com/apps/' + app.commonName,
      metricLevel: 'PRODUCT',
      totalExpectedMetrics: metricTypes.length,
      totalComponents: 2,
      reportingComponents: 2,
      metrics: productMetrics,
      appCriticality: app.criticality,
      customField: executive.eid
    });

    metricsDetails = metricsDetails.concat(metricDocsForLevel(app.id, app.name, executive.lob, 'PRODUCT', 2, execIndex + appIndex));

    appDetails.push({
      seedVersion: seedVersion,
      appId: app.id,
      appName: app.name,
      businessUnit: executive.lob,
      criticality: app.criticality,
      lastUpdated: nowMs
    });

    executiveComponents.push({
      seedVersion: seedVersion,
      appId: app.id,
      appName: app.name,
      teamBoardLink: 'https://example.com/apps/' + app.commonName,
      metrics: metricTypes.map(function(metric, metricIndex) {
        return {
          metricsName: metric.routeName,
          lastScanned: now,
          lastUpdated: now,
          counts: [responseCount(metric.label, metric.base + execIndex + appIndex + metricIndex)],
          reportingComponents: 2,
          totalComponents: 2
        };
      })
    });

    metricTypes.forEach(function(metric, metricIndex) {
      const appValue = metric.base + execIndex + appIndex + metricIndex;
      appMetricDetails.push({
        seedVersion: seedVersion,
        appId: app.id,
        metricsName: metric.routeName,
        summary: metricSummaryResponse(metric.routeName, [responseCount(metric.label, appValue)], 2, metric.trend, app.criticality),
        timeSeries: responseTimeSeries(metric.label, [appValue - 3, appValue - 2, appValue - 1, appValue])
      });
    });

    productComponents(app).forEach(function(component, compIndex) {
      buildingBlocks.push({
        _id: componentBlockId(execIndex, appIndex, compIndex),
        seedVersion: seedVersion,
        metricLevelId: app.id,
        name: component.name,
        commonName: component.commonName,
        completeness: 88 + compIndex,
        dashboardDisplayName: component.dashboardDisplayName,
        lob: executive.lob,
        poc: 'owner-' + component.commonName + '@example.com',
        url: component.url,
        metricLevel: 'COMPONENT',
        totalExpectedMetrics: metricTypes.length,
        totalComponents: 1,
        reportingComponents: 1,
        metricType: metricTypes[compIndex].enumName,
        metrics: [metricSummary(metricTypes[compIndex].routeName, [metricCount(metricTypes[compIndex].label, metricTypes[compIndex].base + compIndex)], 1, metricTypes[compIndex].trend)],
        appCriticality: app.criticality,
        customField: app.id
      });
      componentMetrics.push({
        _id: generatedOid(),
        seedVersion: seedVersion,
        name: metricTypes[compIndex].routeName,
        reporting: true,
        lastScanned: now,
        lastUpdated: now,
        trendSlope: metricTypes[compIndex].trend,
        secondaryTime: nowMs,
        componentDashboardId: component.productComponentDashboardId,
        series: timeSeries(metricTypes[compIndex].label, [metricTypes[compIndex].base - 1, metricTypes[compIndex].base, metricTypes[compIndex].base + 1])
      });
    });
  });
});

upsertMany('portfolio', portfolios, ['_id']);
upsertMany('thumbnail', thumbnails, ['name', 'lob']);
upsertMany('portfolio_response', portfolioResponses, ['eid']);
upsertMany('executives', executiveSummaries, ['eid']);
upsertMany('executives_hierarchy', executiveHierarchies, ['eid']);
upsertMany('building_blocks', buildingBlocks, ['_id']);
upsertMany('metrics_detail', metricsDetails, ['metricLevelId', 'level', 'type']);
upsertMany('app_details', appDetails, ['appId']);
upsertMany('portfolio_metric', portfolioMetricDetails, ['name', 'lob', 'type']);
upsertMany('lob', lobDocs, ['name', 'lob']);
upsertMany('lob_metric', lobMetricDetails, ['name', 'lob', 'type']);
upsertMany('component_metric', componentMetrics, ['componentDashboardId', 'name']);
upsertMany('track_user_views', trackUserViews, ['userId', 'timeStamp', 'view']);
upsertMany('usertrack', userTracks, ['userEid']);
upsertMany('collectors', collectors, ['name']);
upsertMany('collector_items', collectorItems, ['collectorId', 'description']);
upsertMany('executives_metrics', executiveComponents, ['appId']);
upsertMany('app_metrics_details', appMetricDetails, ['appId', 'metricsName']);
upsertMany('portfolio_metrics_details', portfolioMetricDetailResponses, ['eid', 'metricsName']);

upsertMany('cards_list', metricTypes.map(function(metric) {
  return {
    seedVersion: seedVersion,
    cardName: metric.routeName,
    enabled: true,
    previewName: metric.routeName,
    defaultMetrics: true
  };
}), ['cardName']);

upsertMany('collector_updated_details', metricTypes.map(function(metric) {
  return {
    seedVersion: seedVersion,
    type: 'MetricsProcessor',
    collectorUpdateTime: nowMs,
    collectionName: metric.routeName,
    collectionUpdatedTime: nowMs,
    updatedTimeField: 'lastUpdated',
    appIdFieldName: 'appId',
    appCount: 6,
    collectorStartTime: nowMs - 120000,
    totalExecutionTime: 120000,
    isRunning: false
  };
}), ['collectionName', 'type']);

upsertMany('collector_status', metricTypes.map(function(metric) {
  return {
    seedVersion: seedVersion,
    collectorName: metric.routeName,
    collectorType: 'MetricsProcessor',
    online: true,
    lastExecuted: nowMs,
    lastUpdated: nowMs
  };
}), ['collectorName']);

upsertMany('authentication', executives.map(function(executive, index) {
  return {
    seedVersion: seedVersion,
    username: executive.eid,
    firstname: executive.firstName,
    lastname: executive.lastName,
    eid: executive.eid,
    email: executive.firstName + '.' + executive.lastName + '@example.com',
    lastLoggedin: nowMs,
    isAdmin: index === 0
  };
}), ['username']);

upsertMany('externalmonitor', [{
  seedVersion: seedVersion,
  sourceSystemName: 'MetricsProcessor',
  sourceSystemType: 'Internal',
  overallStatus: true,
  lastConnectedTime: nowMs,
  metrics: [],
  connectionCredentials: {}
}], ['sourceSystemName']);

print('Seed complete for ' + dbName + ' using ' + seedVersion);
print('Portfolios: ' + targetDb.portfolio_response.countDocuments({ seedVersion: seedVersion }));
print('Building blocks: ' + targetDb.building_blocks.countDocuments({ seedVersion: seedVersion }));
print('Metric details: ' + targetDb.metrics_detail.countDocuments({ seedVersion: seedVersion }));
print('Portfolio metric details: ' + targetDb.portfolio_metric.countDocuments({ seedVersion: seedVersion }));
print('LOB metric details: ' + targetDb.lob_metric.countDocuments({ seedVersion: seedVersion }));
print('App metric details: ' + targetDb.app_metrics_details.countDocuments({ seedVersion: seedVersion }));
