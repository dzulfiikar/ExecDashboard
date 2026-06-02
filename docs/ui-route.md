# UI Routes

The Executive Dashboard UI is an Angular app using hash routing. Local Docker exposes it at `http://localhost:4200`, so UI routes use this format:

```text
http://localhost:4200/#/<route>
```

Routes below are defined under `exec-ui/src/app/**/*.routing*.ts`.

## Root and directory

| Route | Component/module | Purpose |
| --- | --- | --- |
| `/#/` | App redirect | Redirects to `/#/directory`. |
| `/#/directory` | `DirectoryModule` / `DirectoryComponent` | Portfolio/executive directory landing page. |

## Portfolio dashboard

| Route | Component/module | Purpose |
| --- | --- | --- |
| `/#/portfolio/:portfolio-name/:portfolio-lob` | `DashboardModule` / `DashboardComponent` | Main portfolio dashboard for a portfolio name and line of business. |
| `/#/portfolio/:portfolio-name/:portfolio-lob/products` | `ProductsModule` / `ProductListComponent` | Product list for a portfolio. |
| `/#/portfolio/:portfolio-name/:portfolio-lob/product/:product-id` | `DashboardModule` / `DashboardComponent` | Product dashboard reached from a portfolio building block. |

## Metric dashboard routes

These routes show metric detail/preview pages at portfolio level.

| Route | Module | Purpose |
| --- | --- | --- |
| `/#/portfolio/:portfolio-name/:portfolio-lob/scm-commits` | `ScmCommitsModule` | SCM commits metric view. |
| `/#/portfolio/:portfolio-name/:portfolio-lob/unit-test-coverage` | `UnitTestCoverageModule` | Unit test coverage metric view. |
| `/#/portfolio/:portfolio-name/:portfolio-lob/pipeline-lead-time` | `PipelineLeadTimeModule` | Pipeline lead time metric view. |
| `/#/portfolio/:portfolio-name/:portfolio-lob/production-incidents` | `ProductionIncidentsModule` | Production incidents metric view. |
| `/#/portfolio/:portfolio-name/:portfolio-lob/production-releases` | `ProductionReleasesModule` | Production releases metric view. |
| `/#/portfolio/:portfolio-name/:portfolio-lob/security-violations` | `SecurityViolationsModule` | Security violations metric view. |
| `/#/portfolio/:portfolio-name/:portfolio-lob/open-source-violations` | `OpenSourceViolationsModule` | Open source violations metric view. |
| `/#/portfolio/:portfolio-name/:portfolio-lob/performance-test` | `PerformanceTestModule` | Performance test metric view. |
| `/#/portfolio/:portfolio-name/:portfolio-lob/static-code-analysis` | `StaticCodeAnalysisModule` | Static code analysis metric view. |
| `/#/portfolio/:portfolio-name/:portfolio-lob/test-automation` | `TestAutomationModule` | Test automation metric view. |
| `/#/portfolio/:portfolio-name/:portfolio-lob/traceability` | `TraceabilityModule` | Traceability metric view. |

## Metric product routes

These routes show metric pages scoped to a product/building-block ID.

| Route | Module | Purpose |
| --- | --- | --- |
| `/#/portfolio/:portfolio-name/:portfolio-lob/scm-commits/product/:product-id` | `ScmCommitsModule` | SCM commits product metric view. |
| `/#/portfolio/:portfolio-name/:portfolio-lob/unit-test-coverage/product/:product-id` | `UnitTestCoverageModule` | Unit test coverage product metric view. |
| `/#/portfolio/:portfolio-name/:portfolio-lob/pipeline-lead-time/product/:product-id` | `PipelineLeadTimeModule` | Pipeline lead time product metric view. |
| `/#/portfolio/:portfolio-name/:portfolio-lob/production-incidents/product/:product-id` | `ProductionIncidentsModule` | Production incidents product metric view. |
| `/#/portfolio/:portfolio-name/:portfolio-lob/production-releases/product/:product-id` | `ProductionReleasesModule` | Production releases product metric view. |
| `/#/portfolio/:portfolio-name/:portfolio-lob/security-violations/product/:product-id` | `SecurityViolationsModule` | Security violations product metric view. |
| `/#/portfolio/:portfolio-name/:portfolio-lob/open-source-violations/product/:product-id` | `OpenSourceViolationsModule` | Open source violations product metric view. |
| `/#/portfolio/:portfolio-name/:portfolio-lob/performance-test/product/:product-id` | `PerformanceTestModule` | Performance test product metric view. |
| `/#/portfolio/:portfolio-name/:portfolio-lob/static-code-analysis/product/:product-id` | `StaticCodeAnalysisModule` | Static code analysis product metric view. |
| `/#/portfolio/:portfolio-name/:portfolio-lob/test-automation/product/:product-id` | `TestAutomationModule` | Test automation product metric view. |
| `/#/portfolio/:portfolio-name/:portfolio-lob/traceability/product/:product-id` | `TraceabilityModule` | Traceability product metric view. |

## Duplicate or variant route definitions

Some modules define variant product routes that overlap with the dashboard/product routes:

| Route | Source | Note |
| --- | --- | --- |
| `/#/portfolio/:portfolio-name/:portfolio-lob/product/:product-id` | `dashboard.routing.module.ts`, `scm-commits.routing.module.ts`, `production-releases.routing.module.ts` | Generic product dashboard route. |
| `/#/portfolio/:portfolio-name/:portfolio-lob/open-source-violations/product/:product-id` | `open-source-violations.routing.module.ts` | Metric-specific product route. |
| `/#/portfolio/:portfolio-name/:portfolio-lob/scm-commits/product/:product-id` | `scm-commits.routing.module.ts` | Metric-specific product route. |
| `/#/portfolio/:portfolio-name/:portfolio-lob/production-releases/product/:product-id` | Not directly defined; module defines generic `product/:product-id` route instead. | Use the generic product route if the metric-specific route fails. |

## Seeded demo examples

These routes should work with the current seeded demo data:

```text
http://localhost:4200/#/directory
http://localhost:4200/#/portfolio/Avery%20Stone/Enterprise%20Platforms
http://localhost:4200/#/portfolio/Avery%20Stone/Enterprise%20Platforms/products
http://localhost:4200/#/portfolio/Avery%20Stone/Enterprise%20Platforms/scm-commits
http://localhost:4200/#/portfolio/Avery%20Stone/Enterprise%20Platforms/unit-test-coverage
http://localhost:4200/#/portfolio/Avery%20Stone/Enterprise%20Platforms/pipeline-lead-time
http://localhost:4200/#/portfolio/Avery%20Stone/Enterprise%20Platforms/production-incidents
http://localhost:4200/#/portfolio/Avery%20Stone/Enterprise%20Platforms/security-violations
http://localhost:4200/#/portfolio/Avery%20Stone/Enterprise%20Platforms/open-source-violations
```

Other seeded portfolios:

```text
http://localhost:4200/#/portfolio/Jordan%20Reed/Digital%20Banking
http://localhost:4200/#/portfolio/Morgan%20Chen/Operations
```

## Data availability notes

- The current seeder populates dashboard cards for `scm-commits`, `unit-test-coverage`, `production-incidents`, `security-violations`, `pipeline-lead-time`, and `open-source` / `open-source-violations`-style data.
- UI route modules also exist for `performance-test`, `static-code-analysis`, `test-automation`, `traceability`, and `production-releases`; those routes may render with empty or partial data unless matching API metric data is seeded.
- The app uses Angular hash routing, so omit server-side path navigation like `/portfolio/...`; use `/#/portfolio/...` directly in the browser.
