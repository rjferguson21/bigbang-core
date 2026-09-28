# keycloak-bb-package

Big Bang wrapper chart for the upstream [keycloakx](https://github.com/codecentric/helm-charts) Helm chart, structured like the [repo1 keycloak package](https://repo1.dso.mil/big-bang/product/packages/keycloak) — but instead of depending on `bb-common` to render Istio, NetworkPolicy, and route resources at template time, it emits a `bigbang.dev/v1alpha1 Package` CR that the bigbang-operator reconciles into the same resources.

## How it works

- The upstream `keycloakx` chart is a dependency under the `upstream` alias, with the bitnami `postgresql` dependency for the bundled database (same as repo1).
- `chart/templates/bigbang/package.yaml` renders the `Package` CR from `bigbangPackage.istio`, `bigbangPackage.networkPolicies`, and `bigbangPackage.routes` — the same value shapes bb-common uses, nested under `bigbangPackage`. Values are passed through `tpl`, so templated values like `keycloak.{{ .Values.domain }}` work.
- The keycloak route uses TLS passthrough on the passthrough ingressgateway; the operator renders the matching TLS VirtualService.
- The infinispan HA PeerAuthentication exception (`ispn-ha-peerauth-exception.yaml`, PERMISSIVE on jgroups port 7800) stays a chart template and now reads from the `bigbangPackage` tree.

## Prerequisites

- The bigbang-operator (and its `packages.bigbang.dev` CRD) installed in the cluster.

## Values

| Key | Default | Description |
|---|---|---|
| `bigbangPackage.enabled` | `true` | Render the Package CR |
| `bigbangPackage.labels` / `.annotations` | `{}` | Extra metadata on the Package CR |
| `bigbangPackage.istio` | disabled | Istio config, bb-common shape (mtls kept explicit — also consumed by the ispn exception template) |
| `bigbangPackage.networkPolicies` | disabled | NetworkPolicy config, bb-common shape (smtp/ldap definitions, prometheus/tempo toggles) |
| `bigbangPackage.routes` | keycloak passthrough route | Inbound routes, bb-common shape |
| `upstream` | — | Values passed to the upstream keycloakx chart |

## Testing

```sh
helm template keycloak chart -n keycloak \
  --set bigbangPackage.istio.enabled=true --set bigbangPackage.networkPolicies.enabled=true \
  | yq 'select(.kind == "Package")'
```
