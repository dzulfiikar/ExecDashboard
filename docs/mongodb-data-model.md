# MongoDB Data Model

The Executive Dashboard stores both source-like records and derived executive rollups in MongoDB. Spring Data collection names are primarily declared with `@Document` annotations under `exec-core/src/main/java/com/capitalone/dashboard/exec/model` and accessed through repositories under `exec-core/src/main/java/com/capitalone/dashboard/exec/repository`.

## Connection Configuration

`HygieiaExecMongoConfig` reads these properties:

| Property | Purpose | Default behavior |
| --- | --- | --- |
| `dbname` | MongoDB database name. | Defaults to `dashboard` in code; local config sets `analyticsdb`. |
| `dbhost` | Single MongoDB host. | Defaults to `localhost`; Docker config uses `exec-db`. |
| `dbport` | Single MongoDB port. | Defaults to `27017`. |
| `dbreplicaset` | Enables replica set connection mode when `true`. | Local config uses `false`. |
| `dbhostport` | Comma-separated `host:port` list for replica set mode. | Defaults to `localhost:27017`. |
| `dbusername` / `dbpassword` | Optional SCRAM-SHA-1 credentials. | Empty credentials connect without auth; local Docker uses demo credentials. |

Local Docker exposes MongoDB on `localhost:27000`, but containers connect to `exec-db:27017`.

## Core Relationship Model

The most important derived relationship is:

```text
Portfolio -> Product -> ProductComponent
```

`PortfolioCollector` builds this hierarchy from CMDB/dashboard data and stores it in portfolio-related collections. Metric collectors then attach rollups, summaries, and detail records at portfolio, product, and component levels. API services read the hierarchy and metrics to serve directory, dashboard, product, component, and card endpoints.

## Primary Executive Collections

| Collection | Model | Purpose |
| --- | --- | --- |
| `portfolio` | `Portfolio` | Hierarchical portfolio records with products and ownership information. |
| `thumbnail` | `PortfolioThumbnail` | Portfolio thumbnail data derived during CMDB collection. |
| `lob` | `Lob` | Line-of-business grouping with products. |
| `portfolio_response` | `PortfolioResponse` | API-facing portfolio response data, indexed by `eid`. |
| `building_blocks` | `BuildingBlocks` | Metric-level product/component blocks, indexed by `metricLevelId`. |
| `metrics_detail` | `MetricsDetail` | Detailed metric payloads, indexed by `metricLevelId`. |
| `portfolio_metric` | `PortfolioMetricDetail` | Legacy portfolio rollup metric detail. |
| `lob_metric` | `LobMetricDetail` | Legacy LOB rollup metric detail. |
| `component_metric` | `Metric` | Component-level metric records. |
| `cards_list` | `CardsList` | Dashboard card configuration, unique by `cardName`. |
| `authentication` | `Authentication` | User authentication records, unique by `username`. |
| `track_user_views` | `TrackPageViews` | User view tracking, compound-indexed by `userId` and `timeStamp`. |

## Collector And Status Collections

| Collection | Model | Purpose |
| --- | --- | --- |
| `collectors` | `Collector` | Collector definitions by name and type. |
| `collector_items` | `CollectorItem` | Collector item metadata. |
| `collector_status` | `CollectorStatus` | Current status by collector type. |
| `collector_updated_details` | `CollectorUpdatedDetails` | Last-updated metadata by collection and collector type. |
| `externalmonitor` | `ExternalSystemMonitor` | External system monitoring status. |

## Metric And Source Collections

The codebase contains many metric-specific models. Frequently referenced collections include:

| Area | Collections |
| --- | --- |
| Build/deploy | `builds`, `deployments`, `jenkins_pipeline_metrics`, `jenkins_unlimited`, `product_view_data` |
| Source control | `commits`, `pull_request`, `stash_dashboard_details`, `stash_details_final`, `stash_details_excel`, `stash_unlimited_info` |
| Agile/Jira | `feature_userstory`, `sprint_metrics`, `jira_final_list` |
| Incidents/change | `service_now_issues`, `service_now_new`, `mttr` |
| Security/cloud | `security_formulated_data`, `cloudCost`, `ami`, `ebs`, `ebs_unused`, `elb`, `elb_unused`, `eni_unused`, `rds_all`, `s3` |
| Executive metrics | `executives`, `executives_hierarchy`, `executives_metrics`, `building_block_executive`, `building_block_metrics`, `building_block_components` |
| Time series/detail | `date_wise_metrics`, `app_metrics_details`, `portfolio_metrics_details`, `testmetrics` |
| Other integrations | `hygieia_artifactories`, `instances`, `configuration_metrics`, `vast`, `vonkinator_data_set`, `vonkinator_date`, `devopscup_scores`, `devopscup_round_details` |

## Indexes Declared In Models

Representative indexes discovered in model annotations include:

| Model | Collection | Indexes |
| --- | --- | --- |
| `Authentication` | `authentication` | Unique `username`. |
| `CardsList` | `cards_list` | Unique `cardName`. |
| `PortfolioResponse` | `portfolio_response` | `eid`. |
| `BuildingBlocks` | `building_blocks` | `metricLevelId`. |
| `MetricsDetail` | `metrics_detail` | `metricLevelId`. |
| `TrackPageViews` | `track_user_views` | Compound `userId,timeStamp`; `view`. |
| `Commit` | `commits` | Compound `scmUrl,appId,scmCommitTimestamp`; `appId`. |
| `BitbucketPullRequest` | `pull_request` | Compound `appId,timestamp`; `appId`. |
| `DeployMetrics` | `deployments` | Unique compound `endTime,appId,environmentName,buildUrl`. |
| `ServiceNowIssues` | `service_now_issues` | Unique `aysNumber`; compound `appId,aysCreatedTimeStamp`; `appId`. |
| `MetricDetailResponse` | `app_metrics_details` | Compound `appId,metricsName`; `appId`. |
| `MetricPortfolioDetailResponse` | `portfolio_metrics_details` | Compound `eid,metricsName`; `eid`; `metricsName`. |
| `VonkinatorDataSet` | `vonkinator_data_set` | Compound `appId,period`; `appId`. |
| `ExecutiveComponents` | `executives_metrics` | Compound `appId,metrics.metricsName`; `appId`. |
| Cloud custodian models | `ami`, `ebs`, `ebs_unused`, `elb_unused`, `eni_unused`, `rds_all`, `s3` | App/vast acronym and `environment` indexes vary by collection. |

Indexes are application annotations, not a complete operational index strategy. Review production query patterns and add database-level indexes as needed.

## Repository Access Patterns

Repositories use Spring Data `CrudRepository`, `PagingAndSortingRepository`, `MongoRepository`, and `QueryDslPredicateExecutor`. Important examples:

- `PortfolioRepository` and `LobRepository` read hierarchy data with selected fields.
- `PortfolioResponseRepository` reads API-facing portfolio responses by `eid` and other keys.
- `MetricsDetailRepository`, `MetricPortfolioDetailRepository`, and `MetricDetailResponseRepository` serve metric detail APIs.
- `BuildingBlocksRepository` serves product and component building block data.
- `CollectorStatusRepository` and `CollectorUpdatedDetailsRepository` serve collector state and timestamps.

## Local Database Setup

`exec-db/db-setup.js` creates:

- Database: `analyticsdb`
- User: `analyticsuser`
- Password: `analyticspass`
- Role: `readWrite` on `analyticsdb`

These are demo defaults. For non-local environments, create unique users with least privilege and do not reuse the checked-in password.

## Data Lifecycle Notes

- `PortfolioCollector.collectCMDB` deletes and rewrites portfolio and thumbnail data before saving regenerated records.
- Metric collectors populate derived collections after portfolio data exists.
- A clean database can start successfully but show empty dashboards until source data and collector runs are available.
- Back up MongoDB before changing collector flags, schemas, or data migration logic.
