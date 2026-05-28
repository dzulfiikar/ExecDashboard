# Getting Started

This guide takes a new operator or developer from a clean machine to a verified Hygieia Executive Dashboard instance. Use Docker for the fastest local stack, or native setup when you need to change backend or frontend code.

## Before You Start

- The project is archived and legacy. Use Java 8 and Node 8-compatible tooling unless you intentionally modernize dependencies.
- Local Docker defaults use MongoDB database `analyticsdb`, username `analyticsuser`, and password `analyticspass`.
- The checked-in credentials and `auth.secret=hygsecret` are demo values only.
- Do not run production traffic through the local defaults without replacing secrets, locking down network access, and reviewing dependencies.

## Docker Operator Quick Start

Use this path to evaluate or operate the complete local stack.

### 1. Install Prerequisites

Install Docker Engine and Docker Compose. The repository uses a `docker-compose.yml` file with services for MongoDB, database setup, API, analysis, and UI.

### 2. Review Local Configuration

The Docker stack mounts these configuration directories into the Java containers:

- `config/api/application.properties` for `exec-api`.
- `config/analysis/application.properties` for `exec-analysis`.

For local Docker, the host names in these files should remain `exec-db` because the containers communicate on the Compose network. For non-local environments, replace database credentials and JWT secret values first.

### 3. Start The Stack

From the repository root:

```bash
docker-compose up -d
```

Compose starts services in this order:

1. `exec-db` runs MongoDB 4.4 and exposes `localhost:27000`.
2. `exec-db-setup` runs `exec-db/db-setup.sh` and `exec-db/db-setup.js` to create the demo database user.
3. `exec-api` starts the Spring Boot API on `localhost:8080/api`.
4. `exec-analysis` starts the collector process internally on port `8081`.
5. `exec-ui` serves the Angular app through Apache HTTPD on `localhost:4200`.

### 4. Verify The Stack

Run the repository verification script:

```bash
./verify-deployment.sh
```

Expected local access points:

- UI: `http://localhost:4200`
- API: `http://localhost:8080/api`
- MongoDB: `localhost:27000`

A newly started system may have little or no dashboard data until source collections are populated and collectors complete.

### 5. Use The Application

Open `http://localhost:4200`. The Angular application redirects to `/#/directory`. Portfolio dashboards use hash routes such as `/#/portfolio/:portfolio-name/:portfolio-lob`.

### 6. Stop Or Reset

Stop containers without deleting the MongoDB volume:

```bash
docker-compose down
```

Stop containers and delete the local database volume:

```bash
docker-compose down -v
```

Use the reset command only when you intentionally want to remove local MongoDB data.

## Native Developer Quick Start

Use this path when changing Java, collector, API, or Angular code.

### 1. Install Prerequisites

Install versions compatible with the project:

- Java 8 JDK.
- Maven 3.x.
- MongoDB 4.4 or a compatible MongoDB server.
- Node.js 8.17 and npm compatible with Angular CLI 1.4.5.

Modern Node, Java, or Mongo versions may fail because dependencies are pinned to legacy versions.

### 2. Start MongoDB

Start MongoDB locally. The simplest native configuration is:

- Host: `localhost`
- Port: `27017`
- Database: `analyticsdb`
- Username/password: create your own local credentials, or use the demo values only on an isolated machine.

The Docker setup script in `exec-db/db-setup.js` shows the demo database and user creation logic.

### 3. Configure API And Analysis

Copy or edit:

- `config/api/application.properties`
- `config/analysis/application.properties`

For native local services, set MongoDB properties to the host and port where your MongoDB instance runs, for example `dbhost=localhost` and `dbport=27017`. If your analysis service reads from a different Hygieia source database, set the `portfolio.read*` properties separately from the `portfolio.write*` destination properties.

### 4. Build Java Modules

From the repository root, build the Java modules used by API and analysis:

```bash
mvn clean package -DskipTests -pl exec-core,exec-analysis,exec-api
```

The full default Maven profile also includes `exec-ui`; use the module list above when you only need Java artifacts.

### 5. Run The API

Run the Spring Boot API with the API configuration file:

```bash
java -jar exec-api/target/exec-api.jar --spring.config.location=config/api/application.properties
```

The API listens on `http://localhost:8080/api` by default.

### 6. Run The Analysis Service

Run the collector service with the analysis configuration file:

```bash
java -jar exec-analysis/target/exec-analysis-1.0.0-SNAPSHOT.jar --spring.config.location=config/analysis/application.properties
```

The analysis service listens on port `8081` by default and schedules portfolio collection with `portfolio.cron=0 */5 * * * *`.

### 7. Run The UI

From `exec-ui/`:

```bash
npm install --legacy-peer-deps
npm run local
```

The `local` script serves Angular on `0.0.0.0:4200` and uses `exec-ui/proxy.config.json` for `/api` calls. The checked-in local environment points directly to `http://localhost:8080/api`.

### 8. Verify Native Services

Check the API ping endpoint:

```bash
curl http://localhost:8080/api/ping
```

Open the UI at `http://localhost:4200`. Confirm MongoDB has data in collections such as `portfolio`, `portfolio_response`, `building_blocks`, and `metrics_detail` after collectors run.

## Clean-Machine Checklist

- Docker path: Docker installed, Compose stack started, `./verify-deployment.sh` succeeds, UI opens.
- Native path: Java 8, Maven, MongoDB, Node 8 installed; API and analysis properties adjusted; Java modules build; API, analysis, and UI run in that order.
- Security: demo credentials and `auth.secret` replaced before any non-local deployment.
