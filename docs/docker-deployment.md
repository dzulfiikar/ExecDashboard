# Docker Deployment

The repository includes a local Docker Compose topology for MongoDB, API, analysis, and UI. It is appropriate for local evaluation and can be adapted for production only after replacing secrets, reviewing legacy dependencies, and hardening network exposure.

## Prerequisites

- Docker Engine.
- Docker Compose compatible with the `docker-compose.yml` service syntax.
- Network access to build base images if they are not already cached: `mongo:4.4`, `maven:3.8-eclipse-temurin-8`, `eclipse-temurin:8-jre`, `node:8.17`, and `httpd:2.4`.

## Compose Services

| Service | Image/build | Ports | Purpose |
| --- | --- | --- | --- |
| `exec-db` | `mongo:4.4` | `27000:27017` | MongoDB database with persistent volume `execdb-data`. |
| `exec-db-setup` | `exec-db/Dockerfile` | none | One-shot database user setup. |
| `exec-api` | `Dockerfile.api` | `8080:8080` | Spring Boot API with config mounted from `./config/api`. |
| `exec-analysis` | `Dockerfile.analysis` | none published | Collector service with config mounted from `./config/analysis`. |
| `exec-ui` | `exec-ui/Dockerfile` | `4200:80` | Angular production build served by Apache HTTPD. |

All services are attached to the `hygieia_default` bridge network.

## Configuration Files

Before starting, review:

- `config/api/application.properties`
- `config/analysis/application.properties`
- `exec-db/db-setup.js`

The checked-in values are local Docker defaults. Replace at least these before any shared deployment:

- `dbusername`
- `dbpassword`
- `auth.secret`
- `portfolio.readUriUserName`
- `portfolio.readUriPassword`
- `portfolio.writeUri`
- Any host names, ports, CORS settings, and network exposure rules.

## Build And Start

From the repository root:

```bash
docker-compose up -d
```

This builds Java and UI images if needed. The API Dockerfile builds `exec-core`, `exec-analysis`, and `exec-api` with tests skipped. The analysis Dockerfile builds `exec-core` and `exec-analysis` with tests skipped. The UI Dockerfile uses Node 8.17, runs `npm install --legacy-peer-deps`, and runs `npm run-script build-prod`.

## Verify

Run:

```bash
./verify-deployment.sh
```

The script checks:

- `docker-compose ps`
- UI at `http://localhost:4200`
- API portfolio endpoint at `http://localhost:8080/api/portfolio`
- MongoDB access inside the `exec-db` container

Manual checks:

```bash
curl http://localhost:8080/api/ping
curl http://localhost:8080/api/portfolio
```

A `404` or `401` from some API endpoints can indicate routing/auth/data state rather than container failure. Use logs for details.

## Logs And Inspection

Common operational commands:

```bash
docker-compose ps
docker-compose logs exec-api
docker-compose logs exec-analysis
docker-compose logs exec-ui
docker-compose logs exec-db
```

For MongoDB inspection in the local stack:

```bash
docker-compose exec exec-db mongo analyticsdb
```

## Stop And Reset

Stop services but keep MongoDB data:

```bash
docker-compose down
```

Stop services and remove the MongoDB volume:

```bash
docker-compose down -v
```

Use `-v` only when local data loss is acceptable.

## Production-Oriented Docker Guidance

Do not deploy the Compose defaults directly to production. At minimum:

- Build immutable images in CI and deploy tagged images rather than building on production hosts.
- Move secrets out of checked-in property files into a secret manager or orchestrator-managed secret mounts.
- Use a managed MongoDB service or a properly secured MongoDB replica set with authentication, TLS, backups, and monitoring.
- Do not publish MongoDB directly to public interfaces.
- Put the UI and API behind a TLS-terminating reverse proxy.
- Restrict CORS to known origins instead of relying on permissive local settings.
- Run only one analysis instance per destination database unless collection rewrite behavior has been reviewed.
- Set JVM resource limits through `JAVA_OPTS` and container memory constraints.
- Scan images and dependencies; this project uses archived and outdated dependencies.

## Data Persistence

`exec-db` uses the named volume `execdb-data`. Removing the volume deletes local dashboard data, users, and derived metrics. Back up MongoDB before changing deployment topology, credentials, or collector behavior.
