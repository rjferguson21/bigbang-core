# loki

Big Bang wrapper chart for the upstream [Grafana Loki](https://github.com/grafana/loki) Helm chart, structured like the other  wrappers (kiali, alloy, keycloak) — the upstream chart is a dependency under the `upstream` alias, and instead of depending on `bb-common` to render Istio, NetworkPolicy, and route resources at template time, it emits a `bigbang.dev/v1alpha1 Package` CR that the bigbang-operator reconciles into the same resources.

Unlike this package, the repo1 loki chart is a full fork of the upstream chart. This wrapper was derived from that fork by deep-diffing its values against upstream loki 6.55.0; the Big Bang deltas live under `upstream:` in `values.yaml`. Known divergences from the fork:

- **No bundled minio-instance.** The fork reworked the minio integration around Big Bang's minio-instance chart. This wrapper defaults `upstream.loki.storage.type: filesystem` (self-contained single-binary install); point it at an S3-compatible backend for production.
- **Small template patches are dropped.** The fork added `appProtocol: tcp` to scalable-mode services, `tpl` on pod annotations, and kept removed upstream dirs (tokengen, bloom-compactor) — the wrapper uses upstream templates as-is.
- **`helm.sh/chart` labels** on upstream resources read `upstream-6.55.0` (a Helm alias artifact, same as all repo1 wrapper charts).

## How it works

- `chart/templates/bigbang/package.yaml` renders the `Package` CR from `bigbangPackage.istio`, `bigbangPackage.networkPolicies`, and `bigbangPackage.routes` — the same value shapes bb-common uses. Values are passed through `tpl`, so templated values like `loki.{{ .Values.domain }}` work.
- Kept from the fork as parent-chart templates: the Big Bang Grafana dashboards (`monitoring.enabled`, with `src/dashboards/`) and the HA replica validation (`experimentalMode`). UI tests live in the shared [tests](../tests/) suite.

## Prerequisites

- The bigbang-operator (and its `packages.bigbang.dev` CRD) installed in the cluster.

## Values

| Key | Default | Description |
|---|---|---|
| `bigbangPackage.enabled` | `true` | Render the Package CR |
| `bigbangPackage.istio` | disabled | Istio config, bb-common shape |
| `bigbangPackage.networkPolicies` | disabled | NetworkPolicy config, bb-common shape |
| `bigbangPackage.routes` | loki inbound route, disabled | Inbound routes, bb-common shape |
| `monitoring.enabled` | `false` | Create Big Bang Loki dashboards ConfigMaps in the monitoring namespace |
| `upstream` | SingleBinary, Iron Bank images | Values passed to the upstream loki chart |

## Testing

```sh
helm template logging chart -n logging \
  --set bigbangPackage.istio.enabled=true --set bigbangPackage.networkPolicies.enabled=true \
  | yq 'select(.kind == "Package")'
```
