# monitoring-bb-package

Big Bang wrapper chart for the upstream [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack) Helm chart, structured like the [repo1 monitoring package](https://repo1.dso.mil/big-bang/product/packages/monitoring) — but instead of depending on `bb-common` to render Istio, NetworkPolicy, and route resources at template time, it emits a `bigbang.dev/v1alpha1 Package` CR that the bigbang-operator reconciles into the same resources.

## How it works

- The upstream `kube-prometheus-stack` chart is a dependency under the `upstream` alias, with optional `prometheus-snmp-exporter` and `prometheus-blackbox-exporter` dependencies (same as repo1).
- `chart/templates/bigbang/package.yaml` renders the `Package` CR from `bigbangPackage.istio`, `bigbangPackage.networkPolicies`, and `bigbangPackage.routes` — the same value shapes bb-common uses, nested under `bigbangPackage`. Values are passed through `tpl`, so templated values like `prometheus.{{ .Values.domain }}` work.
- The prometheus and alertmanager routes go through the public ingressgateway; the operator renders the matching VirtualServices.
- Package-specific Istio templates stay in the chart and now read from the `bigbangPackage` tree: the admission webhook and SNMP exporter PeerAuthentication exceptions, the Istio ServiceMonitors/PodMonitors, the Istio proxy memory PrometheusRules, and the SSO AuthorizationPolicies.

## Prerequisites

- The bigbang-operator (and its `packages.bigbang.dev` CRD) installed in the cluster.

## Values

| Key | Default | Description |
|---|---|---|
| `bigbangPackage.enabled` | `true` | Render the Package CR |
| `bigbangPackage.labels` / `.annotations` | `{}` | Extra metadata on the Package CR |
| `bigbangPackage.istio` | disabled | Istio config, bb-common shape (mtls kept explicit — also consumed by the PeerAuthentication exception templates) |
| `bigbangPackage.networkPolicies` | disabled | NetworkPolicy config, bb-common shape (kubeAPI/scrape egress, thanos/tempo/kiali ingress toggles) |
| `bigbangPackage.routes` | prometheus + alertmanager routes | Inbound routes, bb-common shape |
| `upstream` | — | Values passed to the upstream kube-prometheus-stack chart |

## Testing

```sh
helm template monitoring chart -n monitoring \
  --set bigbangPackage.istio.enabled=true --set bigbangPackage.networkPolicies.enabled=true \
  | yq 'select(.kind == "Package")'
```
