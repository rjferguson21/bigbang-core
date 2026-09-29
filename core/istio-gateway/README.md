# istio-gateway

Big Bang wrapper chart for the upstream [istio gateway](https://github.com/istio/istio) Helm chart, structured like the [repo1 istio-gateway package](https://repo1.dso.mil/big-bang/product/packages/istio-gateway) — but instead of depending on `bb-common` to render NetworkPolicy resources at template time, it emits a `bigbang.dev/v1alpha1 Package` CR that the bigbang-operator reconciles into the same resources.

## How it works

- The upstream istio `gateway` chart is a dependency under the `upstream` alias (same as repo1).
- `chart/templates/bigbang/package.yaml` renders the `Package` CR from `bigbangPackage.istio`, `bigbangPackage.networkPolicies`, and `bigbangPackage.routes` — the same value shapes bb-common uses, nested under `bigbangPackage`. Values are passed through `tpl`, so templated values work.
- The gateway-specific Istio resources (Gateway, allow-ingressgateway AuthorizationPolicy, PeerAuthentication, classification banner EnvoyFilter) stay chart templates; they were never bb-common-rendered. The PeerAuthentication reads the top-level `mtls.mode` value.

## Prerequisites

- The bigbang-operator (and its `packages.bigbang.dev` CRD) installed in the cluster.

## Values

| Key | Default | Description |
|---|---|---|
| `bigbangPackage.enabled` | `true` | Render the Package CR |
| `bigbangPackage.labels` / `.annotations` | `{}` | Extra metadata on the Package CR |
| `bigbangPackage.istio` | disabled | Istio config, bb-common shape |
| `bigbangPackage.networkPolicies` | enabled | NetworkPolicy config, bb-common shape (`prependReleaseName: true`) |
| `mtls.mode` | `STRICT` | Mode for the gateway's PeerAuthentication (chart template, not part of the Package CR) |
| `gateway.servers` | `*.dev.bigbang.mil` HTTP/HTTPS | Servers for the Istio Gateway resource |
| `classificationBanner` | disabled | Gateway-scoped classification banner EnvoyFilter |
| `upstream` | — | Values passed to the upstream istio gateway chart |

## Testing

```sh
helm template test chart -n istio-gateway \
  --set bigbangPackage.istio.enabled=true --set bigbangPackage.networkPolicies.enabled=true \
  | yq 'select(.kind == "Package")'
```
