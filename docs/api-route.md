# API Routes

This document lists the routes exposed by the Executive Dashboard API controllers. Routes are shown relative to the API server root. In Docker, the API is typically proxied under `/api`, so `/portfolio` is commonly reached as `/api/portfolio`.

## Health

| Method | Route | Controller | Purpose | Primary data |
| --- | --- | --- | --- | --- |
| GET | `/ping` | `PingController` | Health check; returns `true`. | None |

## Applications

| Method | Route | Controller | Purpose | Primary data |
| --- | --- | --- | --- | --- |
| GET | `/applications` | `ApplicationController` | Return application inventory. | `app_details` |

## Authentication

| Method | Route | Controller | Purpose | Primary data |
| --- | --- | --- | --- | --- |
| POST | `/auth/resgisterUser` | `AuthenticationController` | Register or update a user login. The route name contains the existing typo `resgisterUser`. | `authentication`, `usertrack` |
| GET | `/auth/getPortfolioId/{eid}` | `AuthenticationController` | Return a portfolio ID for an executive EID. | `portfolio_response`, `authentication` |
| GET | `/auth/checkisAdmin/{eId}` | `AuthenticationController` | Check admin flag for an EID. | `authentication` |

## Portfolio hierarchy

| Method | Route | Controller | Purpose | Primary data |
| --- | --- | --- | --- | --- |
| GET | `/portfolio` | `PortfolioController` | List portfolios with products and thumbnails. | `portfolio`, `thumbnail` |
| GET | `/portfolio/{name}/{lob}` | `PortfolioController` | Get one portfolio by name and LOB. | `portfolio` |
| GET | `/portfolio/{name}/{lob}/products` | `PortfolioController` | List product summaries for a portfolio. | `portfolio`, `portfolio_metric` |
| GET | `/portfolio/{name}/{lob}/products/{productName}` | `PortfolioController` | Get one product summary for a portfolio. | `portfolio`, `portfolio_metric` |
| GET | `/portfolio/{name}/{lob}/products/{productName}/components` | `PortfolioController` | List component summaries for a product. | `portfolio`, `portfolio_metric` |
| GET | `/portfolio/setFav/{eid}/{favEid}` | `MetricsCustomController` | Set favorite executive IDs for an EID. `favEid` is parsed as a list. | `executives` |
| GET | `/portfolio/removeFav/{eid}` | `MetricsCustomController` | Remove favorites for an EID. | `executives` |
| GET | `/portfolio/getFavsOfEid/{eid}` | `MetricsCustomController` | Return favorite executives for an EID. | `executives`, `portfolio_response` |
| GET | `/portfolio/timePeriods` | `MetricsCustomController` | Return configured time periods. | `vonkinator_date` |

## Legacy metrics by name and LOB

These routes use human-readable `{name}` and `{lob}` values. `{metric}` is converted to `MetricType` by route name, for example `scm-commits`, `unit-test-coverage`, `production-incidents`, `security-violations`, `pipeline-lead-time`, or `open-source`.

| Method | Route | Controller | Purpose | Primary data |
| --- | --- | --- | --- | --- |
| GET | `/metrics/{metric}/lob/{name}/{lob}/summary` | `MetricsController` | Get LOB-level metric summary. | `lob_metric` |
| GET | `/metrics/{metric}/lob/{name}/{lob}/detail` | `MetricsController` | Get LOB-level metric detail including time series. | `lob_metric` |
| GET | `/metrics/{metric}/lob/{name}/{lob}/product` | `MetricsController` | Get LOB product rollups for a metric. | `lob`, `lob_metric` |
| GET | `/metrics/{metric}/portfolio/{name}/{lob}/summary` | `MetricsController` | Get legacy portfolio metric summary. | `portfolio_metric` |
| GET | `/metrics/{metric}/portfolio/{name}/{lob}/detail` | `MetricsController` | Get legacy portfolio metric detail including time series. | `portfolio_metric` |
| GET | `/metrics/{metric}/portfolio/{name}/{lob}/product` | `MetricsController` | Get legacy portfolio product rollups for a metric. | `portfolio`, `portfolio_metric` |
| GET | `/metrics/{metric}/product/{name}/{lob}/{productName}/summary` | `MetricsController` | Get legacy product metric summary. | `portfolio_metric` nested product details |
| GET | `/metrics/{metric}/product/{name}/{lob}/{productName}/detail` | `MetricsController` | Get legacy product metric detail. | `portfolio_metric` nested product details |
| GET | `/metrics/{metric}/product/{name}/{lob}/{productName}/component` | `MetricsController` | Get legacy component rollups for a product metric. | `portfolio_metric` nested component details |

## Modern metrics by ObjectId

These routes use MongoDB ObjectIds. Portfolio routes take `portfolio_response._id`. Product routes take `building_blocks._id` for a product block.

| Method | Route | Controller | Purpose | Primary data |
| --- | --- | --- | --- | --- |
| GET | `/metrics/{metric}/portfolio/{id}/summary` | `MetricsController` | Get portfolio metric summary by portfolio ObjectId. | `portfolio_response`, `metrics_detail` |
| GET | `/metrics/{metric}/portfolio/{id}/detail` | `MetricsController` | Get portfolio metric detail by portfolio ObjectId. | `portfolio_response`, `metrics_detail` |
| GET | `/metrics/{metric}/portfolio/{id}/product` | `MetricsController` | Get product building blocks for a portfolio metric. | `portfolio_response`, `building_blocks` |
| GET | `/metrics/{metric}/product/{id}/summary` | `MetricsController` | Get product metric summary by product building-block ObjectId. | `building_blocks`, `metrics_detail` |
| GET | `/metrics/{metric}/product/{id}/detail` | `MetricsController` | Get product metric detail by product building-block ObjectId. | `building_blocks`, `metrics_detail` |
| GET | `/metrics/{metric}/product/{id}/component` | `MetricsController` | Get component building blocks for a product metric. | `building_blocks` |

## Metric utilities

| Method | Route | Controller | Purpose | Primary data |
| --- | --- | --- | --- | --- |
| GET | `/metrics/product/{appId}` | `MetricsCustomController` | Resolve product ID for an app ID. | `building_blocks`, `app_details` |
| GET | `/metrics/cardsList` | `MetricsCustomController` | Return enabled metric card names. | `cards_list` |
| GET | `/metrics/previewList` | `MetricsCustomController` | Return active card preview names. | `cards_list` |
| GET | `/metrics/previewSelectList` | `MetricsCustomController` | Return selectable active card previews. | `cards_list` |
| POST | `/metrics/criticality/status` | `MetricsCustomController` | Return app criticality status for request body app IDs. | `app_details`, `executives` |
| GET | `/metrics/getCollectorTimeStamps/{metric}` | `MetricsCustomController` | Return collector timestamps for a metric or all metrics. | `collector_updated_details` |
| GET | `/metrics/{metric}/portfolio/{id}/productForDevopscup` | `MetricsCustomController` | Return DevOps Cup scores for portfolio products. | `devopscup_scores`, `portfolio_response`, `app_details` |
| GET | `/metrics/roundForDevopscup` | `MetricsCustomController` | Return current DevOps Cup round details. | `devopscup_round_details` |

## Users and tracking

| Method | Route | Controller | Purpose | Primary data |
| --- | --- | --- | --- | --- |
| GET | `/users/hitsInfo` | `UsersController` | Return historical unique hit counts. | `track_user_views` |
| GET | `/users/hitsInfoForTheDay` | `UsersController` | Return total/unique hits for the current day. | `track_user_views` |
| GET | `/users/executivesList` | `UsersController` | Return executives accessed status list. | `executives`, `track_user_views` |
| GET | `/users/application/{view}/{userId}/{appIds}` | `UsersController` | Track an application view for one or more app IDs. | `track_user_views` |
| GET | `/users/application/{view}/{userId}/{appIds}/{metricName}` | `UsersController` | Track an application metric view. | `track_user_views` |
| GET | `/users/executive/{view}/{userId}/{eids}` | `UsersController` | Track an executive view for one or more EIDs. | `track_user_views` |
| GET | `/users/executive/{view}/{userId}/{eids}/{metricName}` | `UsersController` | Track an executive metric view. | `track_user_views` |
| GET | `/users/tracking/{view}/{userId}` | `UsersController` | Track a generic page view. | `track_user_views` |
| GET | `/users/recentUsers` | `UsersController` | Return frequent/recent users. | `track_user_views`, `authentication` |
| GET | `/users/recentExecutives` | `UsersController` | Return frequent/recent executive IDs. | `track_user_views`, `executives` |
| GET | `/users/recentApplications` | `UsersController` | Return frequent/recent application IDs. | `track_user_views`, `app_details` |
| GET | `/users/recentCards` | `UsersController` | Return frequent/recent metric card names. | `track_user_views`, `cards_list` |

## Digital cockpit

| Method | Route | Controller | Purpose | Primary data |
| --- | --- | --- | --- | --- |
| GET | `/changefailure/TODAY` | `DigitalCockpitController` | Return change-failure cockpit data for today. | `metrics_detail` |
| GET | `/codecommit/TODAY` | `DigitalCockpitController` | Return code-commit cockpit data for today. | `metrics_detail` |
| GET | `/deploymentca/TODAY` | `DigitalCockpitController` | Return deployment cadence cockpit data for today. | `metrics_detail` |
| GET | `/quality/TODAY` | `DigitalCockpitController` | Return quality cockpit data for today. | `metrics_detail` |
| GET | `/velocity/TODAY` | `DigitalCockpitController` | Return velocity cockpit data for today. | `metrics_detail` |

## External monitor

| Method | Route | Controller | Purpose | Primary data |
| --- | --- | --- | --- | --- |
| GET | `/externalmonitor/status` | `ExternalMonitorController` | Return latest external system monitor records. | `externalmonitor` |

## Default Hygieia admin

| Method | Route | Controller | Purpose | Primary data |
| --- | --- | --- | --- | --- |
| GET | `/defaulthygieia/{appId}` | `DefaultHygieiaController` | Get default Hygieia users for an app. | `dashboards` |
| GET | `/defaulthygieia/{appId}/delete/{user}` | `DefaultHygieiaController` | Delete a default Hygieia user from an app. This mutates state despite using GET. | `dashboards` |
| GET | `/defaulthygieia/admin/{appId}` | `DefaultHygieiaController` | Get default Hygieia admin user data for an app. | `dashboards` |
| GET | `/defaulthygieia/{appId}/admin/{user}` | `DefaultHygieiaController` | Promote a user to admin for an app. This mutates state despite using GET. | `dashboards` |

## Instance and patch versions

| Method | Route | Controller | Purpose | Primary data |
| --- | --- | --- | --- | --- |
| GET | `/instance/getPatchVersions/{bunit}` | `HygieiaInstanceController` | Return patch/version status by business unit. | `dashboards`, `instances`, `hygieia_artifactories` |
| GET | `/getBusinessUnits` | `HygieiaInstanceController` | Return known business units. | `dashboards` |
| GET | `/getPatchVersionsByInstance/{instanceIP}/{check}` | `HygieiaInstanceController` | Return patch/version status for one instance IP. | `dashboards`, `instances`, `hygieia_artifactories` |

## VAST and DevOps Cup

| Method | Route | Controller | Purpose | Primary data |
| --- | --- | --- | --- | --- |
| GET | `/vast/devopscup` | `VastController` | Return VAST data for DevOps Cup apps. | `devopscup_scores`, `vast` |

## Vonkinator

| Method | Route | Controller | Purpose | Primary data |
| --- | --- | --- | --- | --- |
| GET | `/vonkinator/getAll` | `VonkinatorController` | Return Vonkinator data for configured app IDs. | `vonkinator_data_set`, `app_details` |
| GET | `/vonkinator/getAllNonIT` | `VonkinatorController` | Return non-IT Vonkinator data. | `vonkinator_data_set` |
| GET | `/vonkinator/getForPortfolio/{portfolio}` | `VonkinatorController` | Return Vonkinator data for a portfolio. | `vonkinator_data_set` |

## Route notes

- All controllers are annotated with `@CrossOrigin`.
- `MetricType` route values are parsed case-insensitively by `MetricType.fromString`; route names are generally the `MetricType.getName()` values.
- Several mutation-like operations use GET, including favorite updates, user tracking, default-Hygieia delete, and admin promotion.
- When deployed behind the UI/API proxy, prepend `/api` to these routes.
