# Architecture

Hygieia Executive Dashboard is a multi-module legacy application that reads software delivery data, computes executive rollups, exposes them through a REST API, and renders them in an Angular single-page application.

## Module Responsibilities

| Module | Responsibility | Runtime role |
| --- | --- | --- |
| `exec-core` | Shared domain models, Spring Data MongoDB repositories, converters, and `HygieiaExecMongoConfig`. | Library used by API and analysis. |
| `exec-analysis` | Scheduled collectors and Spark-based data processing. | Long-running service that writes rollups and metric details to MongoDB. |
| `exec-api` | Spring Boot REST API with controllers under `com.capitalone.dashboard.executive.rest`. | HTTP API served under `/api` on port `8080`. |
| `exec-ui` | Angular 4 SPA with hash routing and `/api` integration. | Browser UI served on port `4200` locally or behind a web server in production. |
| `exec-db` | MongoDB setup container and initialization scripts. | Creates the local `analyticsdb` user used by Docker Compose. |

The dependency direction is `exec-core` to `exec-analysis` and `exec-api`. The UI is independent at build time and communicates with the API over HTTP.

## Runtime Topology

The local Docker topology in `docker-compose.yml` runs:

- `exec-db`: MongoDB 4.4, container port `27017`, host port `27000`.
- `exec-db-setup`: one-shot setup container that creates the `analyticsuser` demo user in `analyticsdb`.
- `exec-api`: Spring Boot API, container and host port `8080`, context path `/api`.
- `exec-analysis`: collector service, configured for port `8081`, no host port published by Compose.
- `exec-ui`: Angular build served by Apache HTTPD, container port `80`, host port `4200`.

All services share the `hygieia_default` bridge network and the Java services connect to MongoDB using the Compose host name `exec-db`.

## Startup Classes

- API startup: `exec-api/src/main/java/com/capitalone/dashboard/executive/App.java` uses `@SpringBootApplication` and scans `com.capitalone.dashboard`.
- Analysis startup: `exec-analysis/src/main/java/com/capitalone/dashboard/exec/App.java` uses `@SpringBootApplication` and `@EnableAutoConfiguration`.
- Mongo config: `exec-core/src/main/java/com/capitalone/dashboard/exec/config/HygieiaExecMongoConfig.java` enables repositories in `com.capitalone.dashboard.exec.repository` and maps models from the `exec.model` package.

## Data Flow

1. Source data exists in MongoDB collections that follow Hygieia and executive dashboard conventions.
2. `exec-analysis` schedules `PortfolioCollector` with `portfolio.cron`.
3. `PortfolioCollector` loads CMDB and dashboard data through Spark queries, builds the Portfolio -> Product -> ProductComponent hierarchy, and stores portfolio data in MongoDB.
4. Metric collectors run according to flags in `PortfolioCollectorSetting`, including SCM, static code analysis, incidents, unit test coverage, traceability, security, performance, pipeline, and engineering maturity.
5. Collectors write rollups and details to collections such as `portfolio`, `portfolio_response`, `building_blocks`, metric-specific source collections, and `metrics_detail`.
6. `exec-api` reads those collections through Spring Data repositories and service classes.
7. `exec-ui` calls `/api` endpoints and renders directory and portfolio dashboard routes.

## API Surface

The API is rooted at `/api` because `server.contextPath=/api` is configured in `config/api/application.properties`.

Important controller groups include:

- `/portfolio` - portfolio directory, portfolio detail, products, and components.
- `/metrics/...` - metric summaries, details, products, and components by LOB, portfolio, product name, or object id.
- `/metrics/cardsList`, `/metrics/previewList`, `/metrics/getCollectorTimeStamps/{metric}` - card metadata and collector timestamps.
- `/auth/...` - user registration, portfolio id lookup, and admin checks.
- `/users/...` - usage tracking and recent user/application/card views.
- `/applications` - application details.
- `/externalmonitor/status` - external system monitor status.
- `/ping` - simple API liveness endpoint returning a boolean response.

Metric routes use `MetricType.fromString(...)` through a controller binder, so accepted values are defined by `exec-core/src/main/java/com/capitalone/dashboard/exec/model/MetricType.java`.

## UI Routing

`exec-ui/src/app/app.routing.ts` defines hash-based routes:

- `/#/directory` loads the directory module.
- `/#/portfolio/:portfolio-name/:portfolio-lob` loads the dashboard module.
- Empty route redirects to `directory`.

Local development uses `exec-ui/proxy.config.json` to route `/api` calls to `http://localhost:8080/api`. Production environment configuration uses relative `/api`, so a reverse proxy or same-origin deployment should expose the API at that path.

## Collector Behavior

`PortfolioCollector` is the central analysis entry point. It:

- Runs as a Spring component and implements `Runnable`.
- Is scheduled through a `TaskScheduler` and cron trigger.
- Loads CMDB and dashboard datasets with Spark.
- Deletes and rewrites portfolio records during CMDB collection.
- Invokes metric collectors according to enabled flags.
- Writes executive hierarchy and metric data consumed by API services.

Because collectors rewrite important derived data, run only one active analysis instance against the same destination database unless duplicate writes and collection resets have been reviewed.

## Legacy Constraints

- Java target is `1.8`.
- Spring Boot parent is `1.5.9.RELEASE`.
- Spark version is configured as `2.3.3`.
- Angular uses Angular 4 and Angular CLI `1.4.5`.
- Node Docker build uses `node:8.17`.
- The upstream project is archived and dependencies are outdated.
