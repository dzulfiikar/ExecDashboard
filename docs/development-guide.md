# Development Guide

This guide documents the current project workflow, coding standards, test expectations, and legacy dependency gotchas. It describes the repository as it exists today and does not assume unsupported modernization work.

## Project Status

Hygieia Executive Dashboard is archived upstream and should be treated as a legacy system. Changes should be conservative, well-scoped, and validated against Java 8 and Angular 4 constraints.

## Repository Rules

- Do not commit, push, rebase, or run destructive git operations unless explicitly requested.
- Do not commit real credentials or production secrets.
- Keep checked-in property files as examples only; use environment-specific secret handling for real deployments.
- Preserve the module dependency direction: `exec-core` is shared by `exec-api` and `exec-analysis`; the UI communicates through HTTP.
- Prefer narrow changes and avoid broad dependency upgrades unless the task is specifically a modernization effort.

## Backend Workflow

Java modules:

- `exec-core` - models, repositories, Mongo configuration.
- `exec-analysis` - collectors, Spark processing, scheduled analysis.
- `exec-api` - REST controllers and services.

Common Java commands:

```bash
mvn clean package -DskipTests -pl exec-core,exec-analysis,exec-api
mvn clean install
```

A bare `mvn clean install` uses the default Maven profile and includes `exec-ui`. Use `-pl` when you want a Java-only build.

## Backend Coding Standards

- Target Java 8 (`source` and `target` are `1.8`).
- Keep Spring Boot 1.5.9 compatibility unless modernizing the stack intentionally.
- Use Spring Data repository conventions already present under `exec-core/src/main/java/com/capitalone/dashboard/exec/repository`.
- Add or change Mongo collections through model annotations in `exec-core` and document operational impact.
- Keep collector writes idempotent where possible and be careful with delete/rewrite behavior.
- Avoid introducing dependencies unavailable from current configured repositories.

## PMD

PMD runs in the Maven `validate` phase using the root `pmd.xml` ruleset. The ruleset imports internal Java rules and excludes many noisy checks, while retaining selected checks such as empty catch block handling.

If PMD fails, prefer fixing code over suppressing warnings. Use suppressions only when the existing code style and a clear reason justify them.

## Frontend Workflow

From `exec-ui/`:

```bash
npm install --legacy-peer-deps
npm run local
npm run build-prod
npm run lint
```

Important scripts:

- `npm run local` starts Angular on `0.0.0.0:4200` using `proxy.config.json` and `--env=local`.
- `npm run build-prod` creates a production Angular build.
- `npm run lint` runs TSLint.
- `npm test` only prints `Work In Progress on the test cases`; it is not a working unit test suite.

## Frontend Coding Standards

The project uses Angular 4, Angular CLI 1.4.5, TypeScript 2.3, RxJS 5, and TSLint/Codelyzer rules from `exec-ui/tslint.json`.

Follow the existing style:

- Use semicolons and single quotes as enforced by TSLint.
- Keep Angular class suffixes and selector conventions.
- Avoid console logging except where TSLint allows selected console methods.
- Use hash-based routing conventions from `app.routing.ts`.
- Keep API calls aligned with `environment.local.ts`, `environment.prod.ts`, and the `/api` reverse proxy model.

## Testing Expectations

Current test coverage is limited.

For backend changes:

- Run the narrowest Maven test/build command that exercises the changed modules.
- Run PMD through Maven validation when practical.
- Smoke test relevant API endpoints such as `/api/ping`, `/api/portfolio`, or changed controller routes.

For frontend changes:

- Run `npm run lint` when dependencies are installed.
- Run `npm run build-prod` for build-sensitive UI changes.
- Manually smoke test affected routes in the browser.

For documentation-only changes:

- Do not run Maven, npm, Docker, or install commands unless requested.
- Verify referenced paths and commands against the repository.

## Contribution Checklist

Before handing off code changes:

- Changed files are scoped to the requested task.
- No unrelated user changes were reverted.
- No real secrets were added.
- Java changes compile or have a documented reason if not verified.
- Frontend changes lint/build or have a documented reason if not verified.
- Documentation reflects current code and does not claim unsupported features.

## Legacy Gotchas

- `npm install --legacy-peer-deps` is required for the old Angular dependency tree.
- `npm test` is stubbed and should not be cited as meaningful coverage.
- Two Maven dependencies noted in project guidance, `human-name-parser` and `sparkts`, are unavailable or commented out; `PortfolioCollector.java` contains fallback handling for name parsing.
- Travis CI is the only CI configuration noted in project guidance; do not assume GitHub Actions exists.
- Docker Java builds skip tests in `Dockerfile.api` and `Dockerfile.analysis`.
- Checked-in config files contain demo secrets and are not production-ready.
