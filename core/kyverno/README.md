# kyverno

Big Bang wrapper chart for the upstream [kyverno](https://github.com/kyverno/kyverno) Helm chart, structured like the [repo1 kyverno package](https://repo1.dso.mil/big-bang/product/packages/kyverno) — but instead of depending on `bb-common` to render Istio and NetworkPolicy resources at template time, it emits a `bigbang.dev/v1alpha1 Package` CR that the bigbang-operator reconciles into the same resources.

## How it works

- The upstream `kyverno` chart is a dependency under the `upstream` alias (same as repo1).
- `chart/templates/bigbang/package.yaml` renders the `Package` CR from `bigbangPackage.istio` and `bigbangPackage.networkPolicies` — the same value shapes bb-common uses, nested under `bigbangPackage`. Values are passed through `tpl`, so templated values work.
- Kyverno is not in the service mesh, so the `allowIstiod` and `allowPrometheusToIstioSidecar` netpol defaults are disabled and there are no routes.

## Prerequisites

- The bigbang-operator (and its `packages.bigbang.dev` CRD) installed in the cluster.

## Values

| Key | Default | Description |
|---|---|---|
| `bigbangPackage.enabled` | `true` | Render the Package CR |
| `bigbangPackage.labels` / `.annotations` | `{}` | Extra metadata on the Package CR |
| `bigbangPackage.istio` | disabled | Istio config, bb-common shape |
| `bigbangPackage.networkPolicies` | disabled | NetworkPolicy config, bb-common shape (kubeAPI/private-registry definitions, prometheus toggle) |
| `upstream` | — | Values passed to the upstream kyverno chart |

## Testing

```sh
helm template kyverno chart -n kyverno \
  --set bigbangPackage.istio.enabled=true --set bigbangPackage.networkPolicies.enabled=true \
  | yq 'select(.kind == "Package")'
```
