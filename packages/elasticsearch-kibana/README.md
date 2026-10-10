# elasticsearch-kibana

Big Bang-native Elasticsearch/Kibana chart (renders ECK `Elasticsearch` and `Kibana` custom resources), structured like the [repo1 elasticsearch-kibana package](https://repo1.dso.mil/big-bang/product/packages/elasticsearch-kibana) — but instead of depending on `bb-common` to render Istio, NetworkPolicy, and route resources at template time, it emits a `bigbang.dev/v1alpha1 Package` CR that the bigbang-operator reconciles into the same resources.

## How it works

- There is no upstream chart dependency; the chart itself renders the ECK custom resources (same as repo1), with the `prometheus-elasticsearch-exporter` dependency under the `metrics` alias.
- `chart/templates/bigbang/package.yaml` renders the `Package` CR from `bigbangPackage.istio`, `bigbangPackage.networkPolicies`, and `bigbangPackage.routes` — the same value shapes bb-common uses, nested under `bigbangPackage`. Values are passed through `tpl`, so templated values like `kibana.{{ .Values.domain }}` work.
- The PeerAuthentications (`elasticPeerAuth`, `kibanaPeerAuth`, `metricsExporterPeerAuth`) and the istio ServiceMonitor stay chart templates and now read from the `bigbangPackage` tree.
- Kibana config (`publicBaseUrl`, SSO redirect URL) is derived from `bigbangPackage.routes.inbound.kibana.hosts`.

## Prerequisites

- The bigbang-operator (and its `packages.bigbang.dev` CRD) installed in the cluster.
- The ECK operator, which reconciles the Elasticsearch and Kibana custom resources.

## Values

| Key | Default | Description |
|---|---|---|
| `bigbangPackage.enabled` | `true` | Render the Package CR |
| `bigbangPackage.labels` / `.annotations` | `{}` | Extra metadata on the Package CR |
| `bigbangPackage.istio` | disabled | Istio config, bb-common shape (mtls kept explicit — also consumed by the PeerAuthentication templates) |
| `bigbangPackage.networkPolicies` | enabled | NetworkPolicy config, bb-common shape (kubeAPI egress definition, elasticsearch/kibana/metrics ingress rules) |
| `bigbangPackage.routes` | kibana route | Inbound routes, bb-common shape (elasticsearch route disabled by default) |
| `elasticsearch` / `kibana` | — | ECK custom resource configuration |

## Testing

```sh
helm template test chart -n eck \
  --set bigbangPackage.istio.enabled=true --set bigbangPackage.networkPolicies.enabled=true \
  | yq 'select(.kind == "Package")'
```
