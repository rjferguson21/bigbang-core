# tempo

Big Bang wrapper chart for the upstream [tempo](https://github.com/grafana/helm-charts/tree/main/charts/tempo) Helm chart, structured like the [repo1 tempo package](https://repo1.dso.mil/big-bang/product/packages/tempo) — but instead of depending on `bb-common` to render Istio, NetworkPolicy, and route resources at template time, it emits a `bigbang.dev/v1alpha1 Package` CR that the bigbang-operator reconciles into the same resources.

## How it works

- The upstream `tempo` chart is a dependency under the `upstream` alias (same as repo1).
- `chart/templates/bigbang/package.yaml` renders the `Package` CR from `bigbangPackage.istio`, `bigbangPackage.networkPolicies`, and `bigbangPackage.routes` — the same value shapes bb-common uses, nested under `bigbangPackage`. Values are passed through `tpl`, so templated values like `tempo.{{ .Values.domain }}` work.
- The autoRollingUpgrade job templates stay chart templates and now read `bigbangPackage.networkPolicies` for their kube-api egress policy.

## Prerequisites

- The bigbang-operator (and its `packages.bigbang.dev` CRD) installed in the cluster.

## Values

| Key | Default | Description |
|---|---|---|
| `bigbangPackage.enabled` | `true` | Render the Package CR |
| `bigbangPackage.labels` / `.annotations` | `{}` | Extra metadata on the Package CR |
| `bigbangPackage.istio` | disabled | Istio config, bb-common shape |
| `bigbangPackage.networkPolicies` | disabled | NetworkPolicy config, bb-common shape (ingress rules for query/OTLP/zipkin ports, prometheus egress); `controlPlaneCidr` is also consumed by the upgrade job NetworkPolicy template |
| `bigbangPackage.routes` | tempo-query route (disabled) | Inbound routes, bb-common shape |
| `upstream` | — | Values passed to the upstream tempo chart |

## Testing

```sh
helm template tempo chart -n tempo \
  --set bigbangPackage.istio.enabled=true --set bigbangPackage.networkPolicies.enabled=true \
  | yq 'select(.kind == "Package")'
```
