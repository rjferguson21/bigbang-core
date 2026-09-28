# grafana-bb-package

Big Bang wrapper chart for the upstream [grafana](https://github.com/grafana-community/helm-charts) Helm chart, structured like the [repo1 grafana package](https://repo1.dso.mil/big-bang/product/packages/grafana) — but instead of depending on `bb-common` to render Istio, NetworkPolicy, and route resources at template time, it emits a `bigbang.dev/v1alpha1 Package` CR that the bigbang-operator reconciles into the same resources.

## How it works

- The upstream `grafana` chart is a dependency under the `upstream` alias, with `gluon` for the Big Bang test hooks (same as repo1).
- `chart/templates/bigbang/package.yaml` renders the `Package` CR from `bigbangPackage.istio`, `bigbangPackage.networkPolicies`, and `bigbangPackage.routes` — the same value shapes bb-common uses, nested under `bigbangPackage`. Values are passed through `tpl`, so templated values like `grafana.{{ .Values.domain }}` work.
- The grafana route includes custom HTTP routing on the public ingressgateway that redirects `/metrics` to `/`; the operator renders the matching VirtualService.
- The SSO ServiceEntry (`ssoServiceEntry.yaml`) stays a chart template and now reads from the `bigbangPackage.istio` tree, which is why `bigbangPackage.istio.sidecar` remains in values.

## Prerequisites

- The bigbang-operator (and its `packages.bigbang.dev` CRD) installed in the cluster.

## Values

| Key | Default | Description |
|---|---|---|
| `bigbangPackage.enabled` | `true` | Render the Package CR |
| `bigbangPackage.labels` / `.annotations` | `{}` | Extra metadata on the Package CR |
| `bigbangPackage.istio` | disabled | Istio config, bb-common shape (sidecar kept explicit — also consumed by the SSO ServiceEntry template) |
| `bigbangPackage.networkPolicies` | enabled | NetworkPolicy config, bb-common shape (kubeAPI egress, kiali ingress toggle) |
| `bigbangPackage.routes` | grafana route with /metrics redirect | Inbound routes, bb-common shape |
| `upstream` | — | Values passed to the upstream grafana chart |

## Testing

```sh
helm template grafana chart -n monitoring \
  --set bigbangPackage.istio.enabled=true --set bigbangPackage.networkPolicies.enabled=true \
  | yq 'select(.kind == "Package")'
```
