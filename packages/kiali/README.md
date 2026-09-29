# kiali

Big Bang wrapper chart for the upstream [kiali-operator](https://github.com/kiali/helm-charts) Helm chart, structured like the [repo1 kiali package](https://repo1.dso.mil/big-bang/product/packages/kiali) — but instead of depending on `bb-common` to render Istio and NetworkPolicy resources at template time, it emits a `bigbang.dev/v1alpha1 Package` CR that the [bigbang-operator](../..//bigbang-operator) reconciles into the same resources.

## How it works

- The upstream `kiali-operator` chart is a dependency under the `upstream` alias, configured with Iron Bank images and Big Bang security contexts (same as repo1).
- `chart/templates/bigbang/package.yaml` renders the `Package` CR from `bigbangPackage.istio`, `bigbangPackage.networkPolicies`, and `bigbangPackage.routes` — the same value shapes bb-common uses, nested under `bigbangPackage`. Values are passed through `tpl`, so templated values like `kiali.{{ .Values.domain }}` work.
- The bigbang-operator continuously reconciles the CR into PeerAuthentication, Sidecar, AuthorizationPolicy, ServiceEntry, VirtualService, and NetworkPolicy resources, with drift recovery and pruning.

## Prerequisites

- The bigbang-operator (and its `packages.bigbang.dev` CRD) installed in the cluster.

## Values

| Key | Default | Description |
|---|---|---|
| `bigbangPackage.enabled` | `true` | Render the Package CR |
| `bigbangPackage.labels` / `.annotations` | `{}` | Extra metadata on the Package CR |
| `bigbangPackage.istio` | disabled | Istio config, bb-common shape (mtls, sidecar, authorizationPolicies, serviceEntries) |
| `bigbangPackage.networkPolicies` | disabled | NetworkPolicy config, bb-common shape (defaults, egress/ingress shorthand, additionalPolicies) |
| `bigbangPackage.routes` | kiali inbound route | Inbound/outbound routes, bb-common shape |
| `upstream` | — | Values passed to the upstream kiali-operator chart |

## Testing

```sh
helm template kiali chart -n kiali \
  --set bigbangPackage.istio.enabled=true --set bigbangPackage.networkPolicies.enabled=true \
  | yq 'select(.kind == "Package")'
```
