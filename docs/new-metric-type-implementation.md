# New Metric Type Implementation Guide

This guide documents the implementation path for adding a new Executive Dashboard metric type across MongoDB seed data, Spring Boot API support, and the Angular 4 UI.

Use the `build` metric as the current working example.

## Naming contract

Every metric needs one stable slug and one backend enum type.

| Layer | Example | Notes |
| --- | --- | --- |
| UI/API route slug | `build` | Lowercase, hyphenated if needed. Used in URLs and Angular identifiers. |
| Backend enum | `BUILD` | Defined in `MetricType`. |
| Mongo `type` value | `BUILD` | Stored in metric rollup collections. |
| Angular module class | `BuildModule` | PascalCase from the slug. |
| Angular config class | `BuildConfiguration` | Holds route identifier and display labels. |

Keep these values aligned. A mismatch usually causes the card to appear but fail to fetch data, or the API to return empty results.

## Backend/API checklist

1. Add or confirm the metric enum in `exec-core/src/main/java/com/capitalone/dashboard/exec/model/MetricType.java`.

   ```java
   BUILD("build", DataType.SUM, MULTI_DAY, null),
   ```

2. Confirm the API supports the metric slug through the generic metric routes:

   ```text
   GET /api/metrics/{metric}/portfolio/{portfolio-id}/summary
   GET /api/metrics/{metric}/portfolio/{portfolio-id}/detail
   GET /api/metrics/{metric}/portfolio/{portfolio-id}/product
   GET /api/metrics/{metric}/portfolio/{portfolio-name}/{portfolio-lob}/summary
   GET /api/metrics/{metric}/portfolio/{portfolio-name}/{portfolio-lob}/detail
   GET /api/metrics/{metric}/portfolio/{portfolio-name}/{portfolio-lob}/product
   GET /api/metrics/{metric}/product/{portfolio-name}/{portfolio-lob}/{product-id}/summary
   GET /api/metrics/{metric}/product/{portfolio-name}/{portfolio-lob}/{product-id}/detail
   GET /api/metrics/{metric}/product/{portfolio-name}/{portfolio-lob}/{product-id}/component
   ```

3. Verify API data before building UI:

   ```bash
   curl http://localhost:4002/api/metrics/build/portfolio/655f00000000000000000001/summary
   curl http://localhost:4002/api/metrics/build/portfolio/655f00000000000000000001/product
   curl http://localhost:4002/api/metrics/build/portfolio/Avery%20Stone/Enterprise%20Platforms/summary
   ```

## MongoDB data checklist

A visible UI metric needs both card metadata and metric rollups.

Required collections:

| Collection | Purpose |
| --- | --- |
| `cards_list` | Makes the metric available as a dashboard card type. |
| `metrics_detail` | Portfolio-level summary/detail time-series data. |
| `portfolio_metric` | Portfolio-level card/metric association. |
| `app_metrics_details` | Product/building-block summary/detail data. |
| `portfolio_metrics_details` | Portfolio-to-product metric details. |
| `building_blocks` | Product/building-block metadata used by detail views. |

Important natural-key rule for collectors:

- Do not include `seedVersion` in rollup upsert keys.
- Use natural identity fields such as metric type, level, metric level ID, portfolio, product, and time period.
- Including `seedVersion` in the key can create duplicate metric rows and trigger API errors like non-unique result exceptions.

For the Jenkins POC, source records can keep `seedVersion: "jenkins-poc-v1"`, but dashboard rollups must upsert over the existing metric identity.

## Angular UI implementation checklist

Create a metric module under:

```text
exec-ui/src/app/modules/metrics/modules/metrics/<metric-slug>/
```

For `build`:

```text
exec-ui/src/app/modules/metrics/modules/metrics/build/
```

The quickest safe path is to copy a simple count-based metric such as `production-releases` and rename it.

Expected files:

```text
build.module.ts
build.routing.module.ts
build.configuration.ts
services/build.service.ts
components/metric-preview/build-preview.component.ts
components/metric-detail/build-detail.component.ts
strategies/build-building-blocks-strategy.ts
strategies/build-detail-strategy.ts
strategies/build-graph-strategy.ts
strategies/build-preview-strategy.ts
strategies/build-primary-metric-strategy.ts
strategies/build-trend-strategy.ts
```

Optional spec files can mirror the copied module:

```text
services/build.service.spec.ts
components/metric-preview/build-preview.component.spec.ts
components/metric-detail/build-detail.component.spec.ts
```

## Angular configuration

Set the metric identifier to the API route slug:

```typescript
export class BuildConfiguration {
  public static identifier = 'build';
  public static previewHeading = 'Builds';
  public static detailHeading = 'Builds';
  public static graphHeading = 'Builds';
  public static buildingBlockLabel = 'Builds';
  public static description = 'Build execution count for all associated components. Build information is collected ' +
    'by Hygieia from continuous integration tools such as Jenkins.';
}
```

The `identifier` is what `MetricService` uses when building `/metrics/<identifier>/...` API requests.

## Angular service

The metric service should extend `MetricService` and set `metricType` from the configuration:

```typescript
@Injectable()
export class BuildService extends MetricService {
  protected metricType = BuildConfiguration.identifier;

  constructor(private http: HttpClient) { super(http); }

  getPortfolioSummary(name: string, lob: string): Observable<MetricSummary> {
    return this.http.get<MetricSummary>(this.requestUrl(this.portfolioResource(name, lob, 'summary')))
      .map(response => response)
      .catch(error =>  { console.log(error); return Observable.throw(error); });
  }
}
```

Mirror the existing methods for portfolio detail, products, product summary, product detail, and product components.

## Angular routes

Add metric-specific routes in `<metric-slug>.routing.module.ts`.

For `build`:

```typescript
const routes: Routes = [
  {
    path: 'portfolio/:portfolio-name/:portfolio-lob/build',
    component: BuildDetailComponent
  },
  {
    path: 'portfolio/:portfolio-name/:portfolio-lob/build/product/:product-id',
    component: BuildDetailComponent,
    data: { animation: BuildConfiguration.identifier }
  }
];
```

The detail component must read `product-id` when present:

```typescript
this.productId = params['product-id'];
```

Without this, product-scoped metric routes can render portfolio data or fail to load the correct product detail.

## Angular preview card

Add the new preview component to:

```text
exec-ui/src/app/modules/metrics/modules/previews/components/metric-previews/metric-previews.component.html
```

For `build`:

```html
<app-build-preview class="metric" [attr.data-sort]="sortMap.get('build').currentSort" fxFlex
                   [ngClass]="{'disabled': isDisabled('build')}"
                   [portfolioName]="portfolioName" [portfolioLob]="portfolioLob" [productId]="this.productId"
                   (hideBuildingBlocksEvent)="reset()"
                   (showBuildingBlocksEvent)="showBuildingBlocks($event)"
                   (metricPreviewInitialized)="addMetric()"
                   [selectedMetric]="selectedMetric"
                   (isSelectedEvent)="selectMetric($event)"></app-build-preview>
```

Then add the metric to the sort map in:

```text
exec-ui/src/app/modules/metrics/modules/previews/components/metric-previews/metric-previews.component.ts
```

```typescript
import {BuildConfiguration} from '../../../metrics/build/build.configuration';

[BuildConfiguration.identifier, {
  defaultSort: 12,
  currentSort: 12
}],
```

## Angular module wiring

Import the new metric module anywhere previews or product dashboards need to render it.

Update:

```text
exec-ui/src/app/modules/metrics/modules/previews/previews.module.ts
exec-ui/src/app/modules/metrics/modules/products/products.module.ts
```

Example:

```typescript
import {BuildModule} from '../metrics/build/build.module';

@NgModule({
  imports: [
    ...,
    BuildModule
  ]
})
export class PreviewsModule {}
```

## Metric map wiring

Register the metric in:

```text
exec-ui/src/app/modules/metrics/modules/shared/services/metric-map.service.ts
```

Add imports:

```typescript
import {BuildPrimaryMetricStrategy} from '../../metrics/build/strategies/build-primary-metric-strategy';
import {BuildTrendStrategy} from '../../metrics/build/strategies/build-trend-strategy';
import {BuildConfiguration} from '../../metrics/build/build.configuration';
```

Inject strategies in the constructor:

```typescript
private buildPrimaryMetricStrategy: BuildPrimaryMetricStrategy,
private buildTrendStrategy: BuildTrendStrategy
```

Add the metric to the map:

```typescript
[BuildConfiguration.identifier, {
  primaryMetricStrategy: this.buildPrimaryMetricStrategy,
  trendStrategy: this.buildTrendStrategy,
  isRatio: false,
  label: BuildConfiguration.buildingBlockLabel
}]
```

Use `isRatio: true` only for percentage metrics.

## Strategy selection

Choose a source metric module based on the data shape.

| Metric shape | Good source module | Notes |
| --- | --- | --- |
| Simple count | `production-releases` | Good for builds, deployments, incidents, releases. |
| Percentage or ratio | `unit-test-coverage`, `test-automation` | Sets `isRatio` and percent display. |
| Duration | `pipeline-lead-time` | Converts seconds into minutes/hours/days. |
| Multiple auxiliary values | `performance-test`, `static-code-analysis` | Good when the preview card has secondary metrics. |

For `build`, `production-releases` is the closest fit because both are simple count metrics.

## Git ignore warning

The repository has a broad `.gitignore` rule for directories named `build`. Because the metric slug is also `build`, new files under this path may be ignored:

```text
exec-ui/src/app/modules/metrics/modules/metrics/build/
```

When committing the build metric module, force-add that directory:

```bash
git add -f exec-ui/src/app/modules/metrics/modules/metrics/build
```

Then add the regular tracked wiring files:

```bash
git add exec-ui/src/app/modules/metrics/modules/previews \
  exec-ui/src/app/modules/metrics/modules/products \
  exec-ui/src/app/modules/metrics/modules/shared/services/metric-map.service.ts
```

## Build and verification

Rebuild the local/demo stack:

```bash
docker compose up -d --build exec-api exec-ui mock-jenkins jenkins-collector
```

Verify API:

```bash
curl http://localhost:4002/api/ping
curl http://localhost:4002/api/metrics/build/portfolio/655f00000000000000000001/summary
curl http://localhost:4002/api/metrics/build/portfolio/655f00000000000000000001/product
```

Verify UI:

```text
http://localhost:4004/#/portfolio/Avery%20Stone/Enterprise%20Platforms
http://localhost:4004/#/portfolio/Avery%20Stone/Enterprise%20Platforms/build
http://localhost:4004/#/portfolio/Avery%20Stone/Enterprise%20Platforms/build/product/<product-id>
```

The dashboard page should show the new metric preview card if `cards_list` includes the metric and matching rollups exist.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Card does not appear | Preview HTML/module wiring missing, or `cards_list` does not include metric | Add preview component wiring and seed `cards_list`. |
| Card appears but API returns empty | Mongo rollups missing or wrong `type` | Seed `metrics_detail`, `portfolio_metric`, and product rollups using backend enum type. |
| Detail route does not load | Routing module missing metric path | Add `portfolio/:portfolio-name/:portfolio-lob/<metric>` route. |
| Product route loads wrong data | Detail component does not read `product-id` | Set `this.productId = params['product-id']`. |
| API returns non-unique result | Duplicate rollups for same natural metric key | Delete duplicates and fix collector upsert keys. |
| New files missing from `git status` | Metric folder name is ignored | Use `git add -f` for ignored metric slug directories like `build`. |
