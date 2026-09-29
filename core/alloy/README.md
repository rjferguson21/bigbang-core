# alloy

Big Bang wrapper chart for the upstream [k8s-monitoring](https://github.com/grafana/k8s-monitoring-helm) Helm chart (Grafana Alloy collectors), structured like the [repo1 alloy package](https://repo1.dso.mil/big-bang/product/packages/alloy) — but instead of depending on `bb-common` to render Istio and NetworkPolicy resources at template time, it emits a `bigbang.dev/v1alpha1 Package` CR that the bigbang-operator reconciles into the same resources.

## How it works

- The upstream `k8s-monitoring` chart is a dependency under the `upstream` alias, configured with Iron Bank images (same as repo1).
- `chart/templates/bigbang/package.yaml` renders the `Package` CR from `bigbangPackage.istio` and `bigbangPackage.networkPolicies` — the same value shapes bb-common uses, nested under `bigbangPackage`.
- The bigbang-operator continuously reconciles the CR into PeerAuthentication, AuthorizationPolicy, and NetworkPolicy resources, with drift recovery and pruning.

## Prerequisites

- The bigbang-operator (and its `packages.bigbang.dev` CRD) installed in the cluster.

## Values

| Key | Default | Description |
|---|---|---|
| `bigbangPackage.enabled` | `true` | Render the Package CR |
| `bigbangPackage.labels` / `.annotations` | `{}` | Extra metadata on the Package CR |
| `bigbangPackage.istio` | disabled | Istio config, bb-common shape |
| `bigbangPackage.networkPolicies` | disabled | NetworkPolicy config, bb-common shape (collector scrape/forwarding rules) |
| `upstream` | — | Values passed to the upstream k8s-monitoring chart |

## Testing

```sh
helm template alloy chart -n alloy \
  --set bigbangPackage.istio.enabled=true --set bigbangPackage.networkPolicies.enabled=true \
  | yq 'select(.kind == "Package")'
```
