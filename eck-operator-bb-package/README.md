# eck-operator-bb-package

Big Bang wrapper chart for the upstream [eck-operator](https://github.com/elastic/cloud-on-k8s) Helm chart, structured like the [repo1 eck-operator package](https://repo1.dso.mil/big-bang/product/packages/eck-operator) — but instead of depending on `bb-common` to render Istio and NetworkPolicy resources at template time, it emits a `bigbang.dev/v1alpha1 Package` CR that the bigbang-operator reconciles into the same resources.

## How it works

- The upstream `eck-operator` chart is a dependency under the `upstream` alias (same as repo1).
- `chart/templates/bigbang/package.yaml` renders the `Package` CR from `bigbangPackage.istio` and `bigbangPackage.networkPolicies` — the same value shapes bb-common uses, nested under `bigbangPackage`. Values are passed through `tpl`, so templated values work.
- The validating webhook PeerAuthentication exception (`webhook-peer-authentication.yaml`, PERMISSIVE on port 9443) stays a chart template and now reads from the `bigbangPackage` tree.
- Other Big Bang extras (metrics Service/ServiceMonitor, enterprise license secret, CRD upgrade job, OpenShift bindings) are unchanged chart templates.

## Prerequisites

- The bigbang-operator (and its `packages.bigbang.dev` CRD) installed in the cluster.

## Values

| Key | Default | Description |
|---|---|---|
| `bigbangPackage.enabled` | `true` | Render the Package CR |
| `bigbangPackage.labels` / `.annotations` | `{}` | Extra metadata on the Package CR |
| `bigbangPackage.istio` | disabled | Istio config, bb-common shape (mtls kept explicit — also consumed by the webhook PeerAuthentication exception template) |
| `bigbangPackage.networkPolicies` | disabled | NetworkPolicy config, bb-common shape (elasticsearch/kibana egress definitions, prometheus/tempo toggles) |
| `upstream` | — | Values passed to the upstream eck-operator chart |

## Testing

```sh
helm template eck-operator chart -n eck-operator \
  --set bigbangPackage.istio.enabled=true --set bigbangPackage.networkPolicies.enabled=true \
  | yq 'select(.kind == "Package")'
```
