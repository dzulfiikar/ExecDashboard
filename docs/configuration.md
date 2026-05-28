# Configuration

Configuration is split between Java property files for API and analysis, Angular environment files, and Docker/Compose settings. The checked-in property files are local Docker defaults and include demo secrets.

## API Configuration

File: `config/api/application.properties`

| Property | Current local value | Purpose |
| --- | --- | --- |
| `server.contextPath` | `/api` | Base path for all API controllers. |
| `server.port` | `8080` | API HTTP port. |
| `dbhost` | `exec-db` | MongoDB host used by the API container. |
| `dbport` | `27017` | MongoDB container port. |
| `dbname` | `analyticsdb` | MongoDB database. |
| `dbusername` | `analyticsuser` | Demo MongoDB username. |
| `dbpassword` | `analyticspass` | Demo MongoDB password. |
| `dbreplicaset` | `false` | Enables replica set mode when `true`. |
| `logRequest` | `false` | Request logging flag used by API code. |
| `logSplunkRequest` | `false` | Splunk-oriented request logging flag. |
| `corsEnabled` | `true` | CORS behavior flag. |
| `version.number` | `1.0.0-SNAPSHOT` | Reported application version. |
| `auth.expirationTime` | `1200000` | JWT expiration time in milliseconds. |
| `auth.secret` | `hygsecret` | Demo JWT signing secret. |
| `auth.authenticationProviders` | `STANDARD` | Authentication provider selection. |

For native local runs, change `dbhost` to `localhost` if MongoDB is running on the host.

## Analysis Configuration

File: `config/analysis/application.properties`

| Property | Current local value | Purpose |
| --- | --- | --- |
| `dbname` | `analyticsdb` | Destination MongoDB database for Spring repositories. |
| `dbusername` | `analyticsuser` | Demo destination MongoDB username. |
| `dbpassword` | `analyticspass` | Demo destination MongoDB password. |
| `dbhost` | `exec-db` | Destination MongoDB host. |
| `dbport` | `27017` | Destination MongoDB port. |
| `portfolio.cron` | `0 */5 * * * *` | Portfolio collector schedule. |
| `portfolio.readUriUserName` | `analyticsuser` | Source MongoDB username for portfolio collection. |
| `portfolio.readUriPassword` | `analyticspass` | Source MongoDB password for portfolio collection. |
| `portfolio.readUriDatabase` | `exec-db:27017` | Source MongoDB host and port. |
| `portfolio.readUriPrefix` | `mongodb` | Source URI prefix. |
| `portfolio.readDatabase` | `analyticsdb` | Source database name. |
| `portfolio.writeUri` | `mongodb://analyticsuser:analyticspass@exec-db:27017/analyticsdb` | Destination URI for collector writes. |
| `portfolio.writeDatabase` | `analyticsdb` | Destination database name for collector writes. |
| `portfolio.incidentsCollectorFlag` | `true` | Enables incident collector. |
| `portfolio.scmCollectorFlag` | `true` | Enables SCM collector. |
| `portfolio.codeAnalysisCollectorFlag` | `true` | Enables code analysis collector. |
| `server.port` | `8081` | Analysis service port. |

`PortfolioCollector` also contains conditional calls for additional collectors, including unit test coverage, pipeline, traceability, security, performance, and engineering maturity. If those flags are exposed in `PortfolioCollectorSetting`, configure them deliberately and verify generated data.

## MongoDB Replica Set Settings

`HygieiaExecMongoConfig` supports two modes:

- Single host: `dbreplicaset=false`, `dbhost=<host>`, `dbport=<port>`.
- Replica set host list: `dbreplicaset=true`, `dbhostport=host1:27017,host2:27017`.

When credentials are present, the code creates SCRAM-SHA-1 credentials for the configured database.

## UI Configuration

Files:

- `exec-ui/src/environments/environment.local.ts`
- `exec-ui/src/environments/environment.prod.ts`
- `exec-ui/proxy.config.json`

Local environment:

```typescript
apiUrl: 'http://localhost:8080/api'
```

Production environment:

```typescript
apiUrl: '/api'
```

The `npm run local` script uses the proxy config and serves on port `4200`. The production build expects the API to be available at `/api` relative to the UI origin, typically through a reverse proxy.

## Docker Configuration

`docker-compose.yml` mounts:

- `./config/api` to `/var/app/config` in `exec-api`.
- `./config/analysis` to `/var/app/config` in `exec-analysis`.

Both Java Docker images start with `--spring.config.location=/var/app/config/application.properties`.

## Secrets Handling

Never use these demo values outside isolated local development:

- `analyticsuser`
- `analyticspass`
- `hygsecret`

For shared environments:

- Generate unique database users and passwords per environment.
- Generate a high-entropy JWT secret.
- Store secrets in a secret manager or protected runtime configuration, not in source control.
- Restrict file permissions on mounted property files.
- Rotate secrets when moving between test, staging, and production.

## Configuration Validation Checklist

- API and analysis point to the intended MongoDB database.
- Analysis read and write databases are correct and not accidentally pointed at production from a local workstation.
- `server.contextPath=/api` matches UI and proxy assumptions.
- UI `apiUrl` matches the deployment topology.
- Demo credentials and JWT secret are replaced for non-local environments.
- CORS is restricted when the UI and API are not strictly local.
