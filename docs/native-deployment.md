# Native Deployment

Native deployment runs MongoDB, the Spring Boot API, the Spring Boot analysis service, and the Angular UI directly on hosts without Docker. Use this when developing or when an environment requires direct process management.

## Prerequisites

Use legacy-compatible versions:

- Java 8 JDK.
- Maven 3.x.
- MongoDB 4.4 or another version validated with the legacy MongoDB Java driver used by Spring Boot 1.5.9.
- Node.js 8.17 and npm for the Angular 4 UI.
- `curl` or similar HTTP client for verification.

Avoid assuming current Java, Node, npm, Angular CLI, or MongoDB releases will work without dependency upgrades.

## Service Order

Start services in this order:

1. MongoDB.
2. `exec-api`.
3. `exec-analysis`.
4. `exec-ui` or a production web server serving the UI build.

MongoDB must be available before API or analysis start. Analysis should run after its source and destination database settings are correct.

## MongoDB Setup

Create the application database and user. The local Docker setup uses:

```javascript
db = db.getSiblingDB('analyticsdb');
db.createUser({
  user: 'analyticsuser',
  pwd: 'analyticspass',
  roles: [{ role: 'readWrite', db: 'analyticsdb' }]
});
```

Use different credentials outside isolated local development. If you use a replica set, configure `dbreplicaset=true` and `dbhostport=host1:27017,host2:27017,...` in the Java configuration.

## Build Java Artifacts

From the repository root, build Java modules:

```bash
mvn clean package -DskipTests -pl exec-core,exec-analysis,exec-api
```

The default Maven profile includes `exec-ui` as well. Use explicit module selection when you only need Java services.

## API Configuration

Configure `config/api/application.properties`:

```properties
server.contextPath=/api
server.port=8080
dbhost=localhost
dbport=27017
dbname=analyticsdb
dbusername=analyticsuser
dbpassword=analyticspass
dbreplicaset=false
auth.expirationTime=1200000
auth.secret=replace-this-secret
auth.authenticationProviders=STANDARD
```

For production, replace all demo values, restrict CORS, and keep secrets outside the repository.

## Run The API

```bash
java -jar exec-api/target/exec-api.jar --spring.config.location=config/api/application.properties
```

Verify:

```bash
curl http://localhost:8080/api/ping
```

## Analysis Configuration

Configure `config/analysis/application.properties`. Important settings:

```properties
dbname=analyticsdb
dbusername=analyticsuser
dbpassword=analyticspass
dbhost=localhost
dbport=27017
portfolio.cron=0 */5 * * * *
portfolio.readUriPrefix=mongodb
portfolio.readUriDatabase=localhost:27017
portfolio.readDatabase=analyticsdb
portfolio.writeUri=mongodb://analyticsuser:analyticspass@localhost:27017/analyticsdb
portfolio.writeDatabase=analyticsdb
server.port=8081
```

The `portfolio.read*` properties identify the source data database, while `portfolio.write*` properties identify where executive dashboard output is written. They may point to the same database in local setups or different databases in integrated environments.

## Run The Analysis Service

```bash
java -jar exec-analysis/target/exec-analysis-1.0.0-SNAPSHOT.jar --spring.config.location=config/analysis/application.properties
```

Collectors run on the configured cron. A clean database may remain visually empty until source collections exist and collectors complete successfully.

## UI Setup

From `exec-ui/`:

```bash
npm install --legacy-peer-deps
npm run local
```

The local script runs:

```bash
ng serve --host=0.0.0.0 --port=4200 --proxy-config=proxy.config.json --env=local
```

Local environment config points to `http://localhost:8080/api`. Production environment config uses relative `/api`.

## Production UI Build

From `exec-ui/`:

```bash
npm run build-prod
```

Serve the generated `exec-ui/dist` directory from a web server. Configure the web server or reverse proxy so browser requests to `/api` reach the API service.

## Process Management

For long-running native deployments:

- Run API and analysis under a process supervisor such as systemd.
- Set JVM memory and GC options explicitly.
- Capture stdout/stderr to log files or centralized logging.
- Restart on failure with backoff.
- Ensure only one analysis process writes to a given destination database unless coordinated.

## Native Verification

- `curl http://localhost:8080/api/ping` returns a successful response.
- `curl http://localhost:8080/api/portfolio` returns JSON, even if empty.
- `http://localhost:4200` loads the Angular app during development.
- MongoDB contains expected collections after collector runs.
- API and analysis logs show successful MongoDB connection messages.
