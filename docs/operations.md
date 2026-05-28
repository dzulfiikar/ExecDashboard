# Operations

This guide covers routine checks, troubleshooting, backups, upgrades, and operational risks for Hygieia Executive Dashboard.

## Health Checks

### Docker Stack

Run:

```bash
./verify-deployment.sh
```

The script verifies Docker Compose availability, container status, UI access, API access, and MongoDB access. It reports local access points when all checks pass.

### API

Useful endpoints:

```bash
curl http://localhost:8080/api/ping
curl http://localhost:8080/api/portfolio
curl http://localhost:8080/api/externalmonitor/status
```

The portfolio endpoint can return empty data on a clean database. Empty data is not necessarily an outage.

### UI

Open:

```text
http://localhost:4200
```

The application should redirect to `/#/directory`.

### MongoDB

For Docker:

```bash
docker-compose exec exec-db mongo --quiet --eval "db.version()"
```

For native deployments, connect with your MongoDB client using the configured host, port, database, and credentials.

## Log Locations

Docker logs:

```bash
docker-compose logs exec-api
docker-compose logs exec-analysis
docker-compose logs exec-ui
docker-compose logs exec-db
```

Native deployments should capture API and analysis process output through the chosen process manager, such as systemd or a centralized logging agent.

## Common Troubleshooting

| Symptom | Likely causes | Checks |
| --- | --- | --- |
| UI does not load on `localhost:4200` | `exec-ui` container stopped, HTTPD failed, frontend build failed. | `docker-compose ps`, `docker-compose logs exec-ui`. |
| UI loads but API calls fail | API down, wrong `/api` routing, CORS issue, proxy mismatch. | `curl /api/ping`, browser network tab, API logs. |
| API cannot connect to MongoDB | Wrong `dbhost`, `dbport`, credentials, database user missing, Mongo not healthy. | API logs, Mongo shell connection, `exec-db-setup` logs. |
| Dashboards are empty | Clean database, collectors have not run, source collections missing, collector flags disabled. | Analysis logs, `portfolio`, `portfolio_response`, `building_blocks`, `metrics_detail` collections. |
| Analysis repeatedly fails | Bad read/write URI, Spark query source collections missing, credentials invalid. | `config/analysis/application.properties`, analysis logs. |
| Build fails on frontend | Modern Node/npm incompatibility or peer dependency conflicts. | Use Node 8.17 and `npm install --legacy-peer-deps`. |
| Maven build unexpectedly includes UI | Default Maven profile includes `exec-ui`. | Use `-pl exec-core,exec-analysis,exec-api` for Java-only builds. |

## Backup And Restore

Back up MongoDB before upgrades, collector changes, schema changes, or destructive resets.

Docker local example:

```bash
docker-compose exec exec-db mongodump --db analyticsdb --out /tmp/exec-backup
```

For production, use your MongoDB platform's supported backup mechanism, with encryption and restore testing. Include both source-like collections and derived executive collections unless you intentionally plan to regenerate derived data.

## Data Reset

For local Docker only:

```bash
docker-compose down -v
```

This deletes the `execdb-data` volume and all local data. Do not use this pattern on production data.

## Collector Operations

- `portfolio.cron=0 */5 * * * *` schedules portfolio collection every five minutes by default.
- `PortfolioCollector` rewrites portfolio and thumbnail data during CMDB collection.
- Metric collectors run after portfolio data is available and are controlled by collector flags.
- Avoid running multiple analysis instances against the same destination database without reviewing duplicate write and delete/rewrite behavior.

## Upgrade Guidance

This project is archived and uses outdated dependencies. Treat upgrades as engineering projects, not routine package bumps.

Recommended approach:

1. Back up MongoDB.
2. Inventory Java, Maven, Spring Boot, Spark, Angular, Node, and Docker image versions.
3. Upgrade one layer at a time in a branch.
4. Run Java tests, PMD, frontend lint, and manual API/UI smoke tests.
5. Validate collector output on a copy of production data.
6. Roll out with a rollback plan.

## Known Legacy Risks

- Spring Boot 1.5.9 and Angular 4 are no longer maintained.
- Node 8.17 is end-of-life.
- Demo credentials and JWT secret are checked in for local Docker convenience.
- `npm test` is a stub and does not provide frontend unit coverage.
- Some dependencies noted by project guidance are unavailable and have code fallbacks or commented declarations.
- The upstream project has been archived since June 2023.

## Operational Readiness Checklist

- Secrets replaced and managed outside source control.
- MongoDB authentication, backups, monitoring, and network restrictions configured.
- API and UI are behind TLS for shared environments.
- CORS is restricted to known origins.
- Analysis service is single-writer for each destination database.
- Verification script or equivalent health checks are run after deployment.
- Restore procedures are tested before production use.
