# neuvector-bb-package

Big Bang wrapper chart for the upstream [NeuVector core](https://github.com/neuvector/neuvector-helm) Helm chart, structured like the [repo1 neuvector package](https://repo1.dso.mil/big-bang/product/packages/neuvector) — but instead of depending on `bb-common` to render Istio, NetworkPolicy, and route resources at template time, it emits a `bigbang.dev/v1alpha1 Package` CR that the bigbang-operator reconciles into the same resources.

## How it works

- The upstream `core` chart is a dependency under the `upstream` alias, with the `crd` and optional `monitor` subcharts (same as repo1).
- `chart/templates/bigbang/package.yaml` renders the `Package` CR from `bigbangPackage.istio`, `bigbangPackage.networkPolicies`, and `bigbangPackage.routes` — the same value shapes bb-common uses, nested under `bigbangPackage`. Values are passed through `tpl`, so templated values like `neuvector.{{ .Values.domain }}` work.
- The controller PeerAuthentication exception (`controller-pa.yaml`, PERMISSIVE on gossip port 18300) and the headless services for istio stay chart templates and now read from the `bigbangPackage` tree.
- `chart/templates/bigbang/policy-exception.yaml` renders a kyverno `PolicyException` for the neuvector pods (enforcer, controller, cert-upgrader, scanner, prometheus-exporter), which run privileged with host access for runtime inspection; this mirrors the carve-out Big Bang's umbrella makes for neuvector.

## Prerequisites

- The bigbang-operator (and its `packages.bigbang.dev` CRD) installed in the cluster.
- kyverno (for the PolicyException; disable with `kyvernoPolicyException.enabled=false` if kyverno is not installed).

## Values

| Key | Default | Description |
|---|---|---|
| `bigbangPackage.enabled` | `true` | Render the Package CR |
| `bigbangPackage.labels` / `.annotations` | `{}` | Extra metadata on the Package CR |
| `bigbangPackage.istio` | disabled | Istio config, bb-common shape (mtls kept explicit — also consumed by the controller PeerAuthentication template) |
| `bigbangPackage.networkPolicies` | disabled | NetworkPolicy config, bb-common shape (kubeAPI egress per component, prometheus exporter ingress) |
| `bigbangPackage.routes` | neuvector web UI route | Inbound routes, bb-common shape |
| `kyvernoPolicyException` | enabled, namespace `kyverno` | PolicyException for the privileged neuvector pods |
| `upstream` | — | Values passed to the upstream NeuVector core chart |

## Testing

```sh
helm template neuvector chart -n neuvector \
  --set bigbangPackage.istio.enabled=true --set bigbangPackage.networkPolicies.enabled=true \
  | yq 'select(.kind == "Package")'
```
