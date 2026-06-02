# Data Model Relations

This document maps the MongoDB collections used by the Executive Dashboard, their purpose, important keys, and how records relate to each other. Collection names come from Spring Data `@Document` annotations and repository/service access patterns.

## Core hierarchy

| Collection | Model | Purpose | Key fields | Relations |
| --- | --- | --- | --- | --- |
| `portfolio` | `Portfolio` | Canonical portfolio hierarchy used by `/portfolio` name/lob endpoints and legacy metric rollups. | `_id`, `name`, `lob`, `owners`, `products[]` | `name` + `lob` joins to `portfolio_metric`; `products[].name` joins nested product metric records; `owners[].relatedTo.userId` maps to executive/user EIDs. |
| `thumbnail` | `PortfolioThumbnail` | Portfolio thumbnail metadata merged into `/portfolio` list responses. | `name`, `lob`, `thumbnail` | Joined to `portfolio` by `name`; service copies `thumbnail` onto matching portfolio. |
| `portfolio_response` | `PortfolioResponse` | API-facing executive portfolio lookup. Used heavily by metric-by-id endpoints. | `_id`, `eid`, `name`, `lob`, `order`, `executive` | `_id` is the route `{id}` for modern `/metrics/{metric}/portfolio/{id}/...`; `eid` joins to `executives`, `executives_hierarchy`, `metrics_detail.metricLevelId`, and `portfolio_metrics_details.eid`. |
| `lob` | `Lob` | Line-of-business hierarchy and product grouping. | `_id`, `name`, `lob`, `products[]`, `metricsId` | `name` + `lob` joins to `lob_metric`; products mirror `portfolio.products`. |
| `people` | `Owner` | Person/owner records. | `username`, `userId`, `firstName`, `lastName`, `role` | Embedded in `portfolio.owners`, `thumbnail.owners`, and `lob.owners` as relationship targets. |
| `app_details` | `ApplicationDetails` | Application inventory returned by `/applications` and used by app criticality/utilities. | `appId`, `appName`, `lob`, `criticality`, `lastUpdated` | `appId` joins to `executives_metrics.appId`, `app_metrics_details.appId`, `devopscup_scores.appId`, `vast.vastApplID`, and product `appId` references. |

## Executive metadata

| Collection | Model | Purpose | Key fields | Relations |
| --- | --- | --- | --- | --- |
| `executives` | `ExecutiveSummaryList` | Executive summary, configured apps, favorites, and reporting percentages. | `eid`, `firstName`, `lastName`, `appId[]`, `configuredAppId[]`, `favourite[]`, `businessUnits[]` | `eid` joins to `portfolio_response.eid`, `executives_hierarchy.eid`, `authentication.eid`, `usertrack.userEid`, and `track_user_views.userId`; `appId[]` joins to `app_details.appId`. |
| `executives_hierarchy` | `ExecutiveHierarchy` | Executive relationship graph and reportee/favorite lookups. | `eid`, `role`, `designation`, `reportees`, `directReportees`, `linkedReportees` | `eid` joins to `executives.eid` and `portfolio_response.eid`; reportee arrays contain other executive EIDs. |
| `executives_metrics` | `ExecutiveComponents` | App-to-executive metric mapping used by utility/detail flows. | `appId`, `appName`, `teamBoardLink`, `metrics[].metricsName` | `appId` joins to `app_details.appId`; `metrics[].metricsName` maps to card names and `MetricType` route names. |
| `authentication` | `Authentication` | Login/admin state. | `username`, `eid`, `email`, `lastLoggedin`, `isAdmin` | `eid` joins to `executives.eid` and `portfolio_response.eid`; `username` is unique. |
| `usertrack` | `UserTrack` | Login history per user. | `userEid`, `userEmail`, `userName`, `logginTime[]` | `userEid` joins to `authentication.eid` and `executives.eid`. |
| `track_user_views` | `TrackPageViews` | Page/view tracking for recent users, applications, executives, and cards. | `view`, `userId`, `executiveViewId[]`, `applicationViewId[]`, `metricsName`, `timeStamp` | `userId` joins to `authentication.eid`; `executiveViewId[]` joins to `executives.eid`; `applicationViewId[]` joins to `app_details.appId`; `metricsName` joins to `cards_list.cardName`. |

## Current metric rollups

| Collection | Model | Purpose | Key fields | Relations |
| --- | --- | --- | --- | --- |
| `building_blocks` | `BuildingBlocks` | Modern rollup blocks for portfolio/product/component summaries. | `_id`, `metricLevelId`, `metricLevel`, `type`, `metrics[]`, `totalComponents`, `reportingComponents` | For portfolio records, `metricLevelId` is `portfolio_response.eid`; for product/component records, `metricLevelId` is app/product ID. `_id` is used as `{productId}` in modern product metric routes. |
| `metrics_detail` | `MetricsDetail` | Modern metric detail payload keyed by metric level and type. | `metricLevelId`, `level`, `type`, `summary`, `timeSeries` | Portfolio detail uses `portfolio_response._id -> eid -> metrics_detail.metricLevelId`; product detail uses `building_blocks._id -> metricLevelId -> metrics_detail.metricLevelId`. |
| `cards_list` | `CardsList` | Enabled dashboard card configuration. | `cardName`, `enabled`, `previewName`, `defaultMetrics` | `cardName` maps to route metric names, `MetricType.getName()`, and `track_user_views.metricsName`. |
| `collector_updated_details` | `CollectorUpdatedDetails` | Per-collector timestamp/status input for `/metrics/getCollectorTimeStamps/{metric}`. | `collectionName`, `type`, `collectorUpdateTime`, `collectionUpdatedTime`, `collectorStartTime`, `isRunning` | `collectionName` usually maps to metric/card names; `type` is typically `MetricsProcessor`. |
| `collector_status` | `CollectorStatus` | Collector status summary. | `collectorName`, `collectorType`, `online`, `lastExecuted`, `lastUpdated` | `collectorName` maps to card/source names. |
| `collectors` | `Collector` | Registered collector definitions. | `_id`, `name`, `collectorType`, `enabled`, `online`, `lastExecuted` | `_id` joins to `collector_items.collectorId`. |
| `collector_items` | `CollectorItem` | External tool item/config entries owned by collectors. | `_id`, `collectorId`, `description`, `niceName`, `enabled`, `options` | `collectorId` joins to `collectors._id`; `options` contains collector-specific source keys such as app, repo, job, or metric name. |

## Legacy metric rollups

| Collection | Model | Purpose | Key fields | Relations |
| --- | --- | --- | --- | --- |
| `portfolio_metric` | `PortfolioMetricDetail` | Legacy portfolio metric summary/detail for routes using `{name}/{lob}`. | `name`, `lob`, `level`, `type`, `summary`, `timeSeries`, `productMetricDetailList[]` | `name` + `lob` joins to `portfolio.name` + `portfolio.lob`; nested product names join to `portfolio.products[].name`. |
| `lob_metric` | `LobMetricDetail` | Legacy LOB metric summary/detail and LOB product rollups. | `name`, `lob`, `level`, `type`, `summary`, `timeSeries`, `productMetricDetailList[]` | `name` + `lob` joins to `lob.name` + `lob.lob`; nested products join to `lob.products[]`. |
| `component_metric` | `Metric` | Component-level time-series metric records. | `_id`, `name`, `componentDashboardId`, `series[]`, `lastScanned`, `lastUpdated` | `componentDashboardId` joins to `ProductComponent.productComponentDashboardId` embedded under products. |
| `app_metrics_details` | `MetricDetailResponse` | App-level metric detail response cache. | `appId`, `metricsName`, `summary`, `timeSeries` | `appId` joins to `app_details.appId`; `metricsName` joins to `cards_list.cardName`. |
| `portfolio_metrics_details` | `MetricPortfolioDetailResponse` | Portfolio/executive metric detail response cache. | `eid`, `metricsName`, `executiveObjectId`, `summary`, `timeSeries` | `eid` joins to `portfolio_response.eid`; `executiveObjectId` joins to `portfolio_response._id`; `metricsName` joins to cards/metric routes. |
| `date_wise_metrics` | `DateWiseMetricsSeries` | Date-bucketed metric series. | metric/date fields, app/executive identifiers | Supports historic/time-period views; relates by app ID or executive ID depending on metric. |

## Source and integration data

| Collection | Model | Purpose | Key fields | Relations |
| --- | --- | --- | --- | --- |
| `commits` | `Commit` | SCM commit records. | `appId`, `scmUrl`, `scmCommitTimestamp`, commit metadata | `appId` joins to `app_details.appId`; rolls up into SCM cards/metrics. |
| `pull_request` | `BitbucketPullRequest` | Bitbucket pull request records. | `appId`, `timestamp`, PR metadata | `appId` joins to applications and SCM quality metrics. |
| `builds` | `Build` | Build/job records. | `appId`, `collectorItemId`, `timestamp`, status fields | `collectorItemId` joins to `collector_items._id`; `appId` joins to apps. |
| `deployments` | `DeployMetrics` | Deployment events and deployment metric source data. | `appId`, `endTime`, `environmentName`, `buildUrl` | Unique compound key includes deployment attributes; `appId` joins to apps. |
| `jenkins_pipeline_metrics` | `JenkinsPipelineMetrics` | Jenkins pipeline metric aggregates. | app/job/pipeline fields | Joins to apps by `appId` or job configuration. |
| `jenkins_unlimited` | `JenkinsUnlimitedData` | Jenkins unlimited/source extract data. | app/job fields | Feeds build/pipeline rollups. |
| `product_view_data` | `ProductPipelineData` | Product pipeline view/cache data. | product/app identifiers | Supports product pipeline visualizations. |
| `feature_userstory` | `FeatureUserStory` | Agile feature/user story source data. | app/team/sprint fields | Feeds sprint/velocity metrics. |
| `sprint_metrics` | `SprintMetrics` | Sprint-level agile metrics. | app/team/sprint identifiers | Joins to app/team metadata. |
| `jira_final_list` | `JiraDetailsFinal` | Processed Jira detail data. | app/team/issue fields | Feeds agile and issue metrics. |
| `service_now_issues` | `ServiceNowIssues` | ServiceNow incident/change source records. | app/service/ticket identifiers | Feeds incident/change-failure metrics. |
| `service_now_new` | `ServiceNowTicket` | Alternate ServiceNow ticket source. | ticket/app fields | Feeds operational metrics. |
| `mttr` | `MTTR` | Mean-time-to-recovery records. | app/service/time fields | Feeds MTTR operational metrics. |

## Security, cloud, and governance data

| Collection | Model | Purpose | Key fields | Relations |
| --- | --- | --- | --- | --- |
| `security_formulated_data` | `ExecutiveSecurityData` | Processed executive security posture data. | app/executive/security metric fields | Joins to app/executive identifiers. |
| `cloudCost` | `CloudCost` | Cloud cost data. | `appId`, account/cost/time fields | `appId` joins to application inventory. |
| `ami` | `CloudCustodianAMI` | AMI governance findings. | AMI/account/environment fields | Related to app/vast acronym where present. |
| `ebs` | `CloudCustodianEBS` | EBS governance findings. | volume/account/environment fields | Related to app/vast acronym where present. |
| `ebs_unused` | `CloudCustodianEbsUnused` | Unused EBS findings. | account/environment fields | Cloud waste/security reporting. |
| `elb` | `ELB` | ELB inventory/findings. | load balancer/account fields | Cloud governance reporting. |
| `elb_unused` | `CloudCustodianElbUnused` | Unused ELB findings. | account/environment fields | Cloud waste/security reporting. |
| `eni_unused` | `CloudCustodianEniUnused` | Unused ENI findings. | account/environment fields | Cloud waste/security reporting. |
| `rds_all` | `CloudCustodianRdsAll` | RDS inventory/findings. | RDS/account/environment fields | Cloud governance reporting. |
| `s3` | `CloudCustodianS3` | S3 governance findings. | bucket/account/environment fields | Cloud governance reporting. |

## DevOps Cup, VAST, Vonkinator, and admin data

| Collection | Model | Purpose | Key fields | Relations |
| --- | --- | --- | --- | --- |
| `devopscup_scores` | `DevOpsCupScores` | DevOps Cup score data. | `appId`, score fields, round fields | `appId` joins to `app_details.appId` and `vast.vastApplID`. |
| `devopscup_round_details` | `DevopscupRoundDetails` | Current DevOps Cup round metadata. | round/period/status fields | Used with `devopscup_scores`. |
| `vast` | `Vast` | VAST application reference data. | `vastApplID`, portfolio/application metadata | Joins to `devopscup_scores.appId` and app inventory. |
| `vonkinator_data_set` | `VonkinatorDataSet` | Vonkinator datasets by portfolio/app. | portfolio, app IDs, `isIT`, period fields | Portfolio names join to portfolio/LOB views; app IDs join to `app_details`. |
| `vonkinator_date` | `VonkinatorPeriod` | Vonkinator time periods. | period ID/name/date fields | Referenced by time-period utility endpoint. |
| `dashboards` | `Dashboard` | Hygieia dashboard documents for app/admin/default-Hygieia endpoints. | `appId`, `title`, `owners`, `instance` | `appId` joins to app inventory; `instance` joins to `instances.privateIp`. |
| `instances` | `Instance` | Hygieia instance/collector instance state. | private IP, version, active flag | Joins to `dashboards.instance` for patch/version checks. |
| `hygieia_artifactories` | `HygieiaArtifactDetails` | Hygieia artifact/version details. | artifact collector/version fields | Used by instance patch/version responses. |
| `apps_job_details` | `AppsJobDetails` | App/job association details. | `appId`, job fields | Joins to application inventory and CI data. |
| `configuration_metrics` | `ConfigurationMetrics` | Configuration metric data. | app/config identifiers | Feeds configuration/completeness metrics. |
| `components` | `ComponentClass` | Component registry. | component/app identifiers | Joins to product components and component metrics. |
| `unmapped_request` | `UnmappedRoutingRequest` | Requests that could not be mapped to known apps/routes. | request/app fields | Operational support data. |

## Derived building-block response caches

| Collection | Model | Purpose | Key fields | Relations |
| --- | --- | --- | --- | --- |
| `building_block_executive` | `BuildingBlockExecutiveSummaryResponse` | Cached executive building-block summaries. | executive name/EID fields, metrics | Derived from `executives`, `building_blocks`, and metric collections. |
| `building_block_metrics` | `BuildingBlockMetricSummaryResponse` | Cached app/metric building-block summaries. | app/metric fields | Derived from `building_blocks` and app metric details. |
| `building_block_components` | `BuildingBlockComponentSummaryResponse` | Cached component building-block summaries. | `appId`, component fields | Derived from product components and component metric data. |

## Relationship summary

- Executive identity key: `eid` links `portfolio_response`, `executives`, `executives_hierarchy`, `authentication`, `usertrack`, `track_user_views`, `metrics_detail`, and `portfolio_metrics_details`.
- Application identity key: `appId` links `app_details`, `executives.appId[]`, `executives_metrics`, `app_metrics_details`, DevOps Cup, VAST, CI/CD, Jira, cloud, and security data.
- Portfolio legacy key: `name` + `lob` links `portfolio` to `portfolio_metric` and legacy `/metrics/.../portfolio/{name}/{lob}` routes.
- LOB legacy key: `name` + `lob` links `lob` to `lob_metric` and legacy LOB metric routes.
- Modern metric route key: `portfolio_response._id` routes to `portfolio_response.eid`, which then looks up `metrics_detail.metricLevelId` and `building_blocks.metricLevelId`.
- Card/metric key: `cards_list.cardName`, route `{metric}`, `MetricType.getName()`, `metrics_detail.type`, and `track_user_views.metricsName` should remain consistent.
- Collector key: `collectors._id` links to `collector_items.collectorId`; collector status and update collections use collector/card names rather than ObjectIds.
