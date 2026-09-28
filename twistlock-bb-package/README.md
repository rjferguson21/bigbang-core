# twistlock-bb-package

Big Bang twistlock (Prisma Cloud Compute Edition) chart, structured like the [repo1 twistlock package](https://repo1.dso.mil/big-bang/product/packages/twistlock) — but instead of depending on `bb-common` to render Istio, NetworkPolicy, and route resources at template time, it emits a `bigbang.dev/v1alpha1 Package` CR that the bigbang-operator reconciles into the same resources.

## How it works

- Twistlock is a Big Bang-native chart (no upstream alias): the console, defender daemonset, and init job templates are unchanged from repo1.
- `chart/templates/bigbang/package.yaml` renders the `Package` CR from `bigbangPackage.istio`, `bigbangPackage.networkPolicies`, and `bigbangPackage.routes` — the same value shapes bb-common uses, nested under `bigbangPackage`. Values are passed through `tpl`, so templated values like `twistlock.{{ .Values.domain }}` work.
- The console/defender PeerAuthentications, init secrets, and openshift NetworkAttachmentDefinition stay chart templates and now read from the `bigbangPackage` tree (`bigbangPackage.istio.enabled`, `.mtls.mode`, `.ambient.enabled`, `bigbangPackage.routes.inbound.console.hosts`).
- `chart/templates/bigbang/policy-exception.yaml` renders a kyverno `PolicyException` for the twistlock pods (`twistlock-console*`, `twistlock-defender-ds*`, `volume-upgrade*`) — defenders need host access and elevated privileges to scan nodes, the same carve-out the Big Bang umbrella makes for twistlock.

## Prerequisites

- The bigbang-operator (and its `packages.bigbang.dev` CRD) installed in the cluster.
- Kyverno with `kyverno` as the configured exceptionNamespace (or disable/repoint `kyvernoPolicyException`).

## Values

| Key | Default | Description |
|---|---|---|
| `bigbangPackage.enabled` | `true` | Render the Package CR |
| `bigbangPackage.labels` / `.annotations` | `{}` | Extra metadata on the Package CR |
| `bigbangPackage.istio` | disabled | Istio config, bb-common shape (mtls and ambient kept explicit — also consumed by the PeerAuthentication and init templates) |
| `bigbangPackage.networkPolicies` | enabled | NetworkPolicy config, bb-common shape (console/defender ingress, kubeAPI and intelligence egress) |
| `bigbangPackage.routes` | console route + intelligence ServiceEntry | Inbound/outbound routes, bb-common shape |
| `kyvernoPolicyException.enabled` | `true` | Render the kyverno PolicyException for twistlock pods |

## Testing

```sh
helm template twistlock chart -n twistlock \
  --set bigbangPackage.istio.enabled=true --set bigbangPackage.networkPolicies.enabled=true \
  | yq 'select(.kind == "Package")'
```
