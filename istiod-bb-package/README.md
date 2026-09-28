# istiod-bb-package

Big Bang wrapper chart for the upstream [istiod](https://github.com/istio/istio) Helm chart, structured like the [repo1 istiod package](https://repo1.dso.mil/big-bang/product/packages/istiod) — but instead of depending on `bb-common` to render Istio and NetworkPolicy resources at template time, it emits a `bigbang.dev/v1alpha1 Package` CR that the bigbang-operator reconciles into the same resources.

## How it works

- The upstream `istiod` chart is a dependency under the `upstream` alias (passthrough, same as repo1).
- `chart/templates/bigbang/package.yaml` renders the `Package` CR from `bigbangPackage.istio` and `bigbangPackage.networkPolicies` — the same value shapes bb-common uses, nested under `bigbangPackage`. Values are passed through `tpl`, so templated values work. `bigbangPackage.routes` is also supported but unset by default (istiod exposes no inbound routes).
- The istio-specific templates the package ships (EnvoyFilters for security headers, misdirected requests, server header removal, classification banner, additional filters, and the Grafana dashboards ConfigMaps) stay chart templates and are unchanged.

## Prerequisites

- The bigbang-operator (and its `packages.bigbang.dev` CRD) installed in the cluster.

## Values

| Key | Default | Description |
|---|---|---|
| `bigbangPackage.enabled` | `true` | Render the Package CR |
| `bigbangPackage.labels` / `.annotations` | `{}` | Extra metadata on the Package CR |
| `bigbangPackage.istio` | enabled | Istio config, bb-common shape |
| `bigbangPackage.networkPolicies` | disabled | NetworkPolicy config, bb-common shape (kube-apiserver egress, webhook/monitoring/xDS ingress) |
| `additionalEnvoyFilters` | `[]` | Extra EnvoyFilters in the release namespace |
| `monitoring.enabled` | `true` | Grafana dashboard ConfigMaps |
| `defaultSecurityHeaders.enabled` | `true` | Default security headers EnvoyFilter |
| `upstream` | — | Values passed to the upstream istiod chart |

## Testing

```sh
helm template test chart -n istio-system \
  --set bigbangPackage.istio.enabled=true --set bigbangPackage.networkPolicies.enabled=true \
  | yq 'select(.kind == "Package")'
```
