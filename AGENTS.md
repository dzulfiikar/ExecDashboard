# AGENTS.md

## Project

Hygieia Executive Dashboard — multi-module monorepo with a Java/Maven backend (Spring Boot 1.5.9, Java 8) and an Angular 4 frontend. Aggregates software delivery metrics from a Hygieia instance into an executive-level dashboard.

Archived upstream (CapitalOne/Hygieia) since June 2023. Dependencies are severely outdated.

## Modules

| Module | Role | Port |
|--------|------|------|
| `exec-core` | Shared domain models + Spring Data MongoDB repos | — |
| `exec-analysis` | Data collectors/analyzers (16+ collectors, cron-driven) | 8081 |
| `exec-api` | REST API (`/api` context path) | 8080 |
| `exec-ui` | Angular 4 SPA (Angular CLI 1.4.5) | 4200 |
| `exec-db` | MongoDB 4.4 Docker setup scripts | 27000 |

Dependency order: `exec-core` -> `exec-analysis`, `exec-api`. The UI is independent (communicates via HTTP).

## Commands

### Full stack (Docker)
```bash
docker-compose up -d        # Start all services
docker-compose down -v      # Stop + remove volumes
```

### Java backend
```bash
mvn clean install                    # Build all + run tests
mvn clean package -DskipTests       # Build without tests
```
PMD runs during `validate` phase (ruleset: `pmd.xml` at root).

### Frontend (`exec-ui/`)
```bash
npm install --legacy-peer-deps   # REQUIRED — old Angular 4 peer deps conflict without this flag
npm run local                    # Dev server with proxy to localhost:8080
npm run build-prod               # Production build
npm run lint                     # TSLint
```
`npm test` is **stubbed** — prints "Work In Progress" and exits. No working unit test suite.

## Architecture notes

- **Database**: MongoDB. Connection config lives in `config/api/application.properties` and `config/analysis/application.properties`. These files are gitignored by default (`config/.gitignore` excludes `**/*.properties`); checked-in copies are Docker Compose convenience defaults with hardcoded credentials.
- **Routing**: Angular uses hash-based routing (`useHash: true`). URLs: `/#/directory`, `/#/portfolio/:name/:lob`.
- **Proxy**: `exec-ui/proxy.config.json` forwards `/api` to `http://localhost:8080/api` during local dev.
- **Environment configs**: `exec-ui/src/environments/` — prod uses relative `/api` (expects reverse proxy).
- **Collectors** in `exec-analysis` run on cron (`0 */5 * * * *` for portfolio). Each collector has its own service class under `src/main/java/.../collector/`.
- **REST controllers** in `exec-api` under `src/main/java/.../rest/`. Stub JSON data in `src/main/resources/stub-data/`.

## Workflow rules

- **NEVER commit or push without an explicit command from the user.** Do not proactively run `git commit`, `git push`, or any destructive git operation unless the user specifically asks for it.

## Gotchas

1. `--legacy-peer-deps` is mandatory for `npm install` in `exec-ui`.
2. Two Maven dependencies (`human-name-parser`, `sparkts`) are unavailable — they're commented out in `exec-analysis/pom.xml`. A fallback name parser exists in `PortfolioCollector.java`.
3. Config properties contain hardcoded secrets — never commit real credentials there.
4. CI is Travis CI only (`.travis.yml`), no GitHub Actions.
5. The root Maven `defaultBuild` profile includes all modules; a bare `mvn clean install` will attempt to build the UI module too.
