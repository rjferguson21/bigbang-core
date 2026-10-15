<!-- Warning: Do not manually edit this file. See notes on gluon + helm-docs at the end of this file for more information. -->
# loki

![Version: 6.55.0-bb.5](https://img.shields.io/badge/Version-6.55.0--bb.5-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 3.7.1](https://img.shields.io/badge/AppVersion-3.7.1-informational?style=flat-square) ![Maintenance Track: bb_integrated](https://img.shields.io/badge/Maintenance_Track-bb_integrated-green?style=flat-square)

Helm chart for Grafana Loki wrapping the upstream chart. This variant delegates Istio and NetworkPolicy configuration to the Big Bang operator via a Package CR instead of bb-common.

## Upstream References

- <https://grafana.github.io/helm-charts>
- <https://github.com/grafana/loki>
- <https://grafana.com/oss/loki/>
- <https://grafana.com/docs/loki/latest/>

## Upstream Release Notes

- [Find upstream chart's release notes and CHANGELOG here](https://github.com/grafana/loki/blob/main/production/helm/loki/CHANGELOG.md)
- [Find upstream application's release notes and CHANGELOG here](https://grafana.com/docs/loki/latest/release-notes/)

## Learn More

- [Application Overview](docs/overview.md)
- [Other Documentation](docs/)

## Pre-Requisites

- Kubernetes Cluster deployed
- Kubernetes config installed in `~/.kube/config`
- Helm installed

Install Helm

https://helm.sh/docs/intro/install/

## Deployment

- Clone down the repository
- cd into directory

```bash
helm install loki chart/
```

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| domain | string | `"dev.bigbang.mil"` |  |
| experimentalMode.enabled | bool | `false` | Toggle enabling of configurations and deployment modes currently unsupported by Big Bang |
| bigbangPackage.enabled | bool | `true` |  |
| bigbangPackage.labels | object | `{}` |  |
| bigbangPackage.annotations | object | `{}` |  |
| bigbangPackage.istio.enabled | bool | `false` |  |
| bigbangPackage.istio.authorizationPolicies.enabled | bool | `true` |  |
| bigbangPackage.istio.authorizationPolicies.generateFromNetpol | bool | `true` |  |
| bigbangPackage.routes.inbound.loki.enabled | bool | `false` | VirtualService for external access to Loki. Disabled by default as Loki is a backend service. Enable explicitly if external access is required. |
| bigbangPackage.routes.inbound.loki.hosts[0] | string | `"loki.{{ .Values.domain }}"` |  |
| bigbangPackage.routes.inbound.loki.service | string | `"logging-loki-gateway.logging.svc.cluster.local"` |  |
| bigbangPackage.routes.inbound.loki.port | int | `80` |  |
| bigbangPackage.routes.inbound.loki.containerPort | int | `8080` |  |
| bigbangPackage.routes.inbound.loki.selector."app.kubernetes.io/name" | string | `"logging-loki"` |  |
| bigbangPackage.networkPolicies.enabled | bool | `false` |  |
| bigbangPackage.networkPolicies.prependReleaseName | bool | `true` |  |
| bigbangPackage.networkPolicies.ingress.to.loki:8080.podSelector.matchLabels."app.kubernetes.io/name" | string | `"logging-loki"` |  |
| bigbangPackage.networkPolicies.ingress.to.loki:8080.podSelector.matchLabels."app.kubernetes.io/component" | string | `"gateway"` |  |
| bigbangPackage.networkPolicies.ingress.to.loki:8080.from.k8s.monitoring-grafana@monitoring/grafana | bool | `true` |  |
| bigbangPackage.networkPolicies.ingress.to.logging-loki:3100.from.k8s.alloy-alloy-operator@alloy/alloy | bool | `true` |  |
| bigbangPackage.networkPolicies.ingress.to.logging-loki:3100.from.k8s.alloy-alloy-logs@alloy/alloy-logs | bool | `true` |  |
| bigbangPackage.networkPolicies.ingress.to.logging-loki:3100.from.k8s.fluentbit-fluent-bit@fluentbit/fluent-bit | bool | `true` |  |
| bigbangPackage.networkPolicies.ingress.to.logging-loki:3100.from.k8s.monitoring-grafana@monitoring/grafana | bool | `true` |  |
| bigbangPackage.networkPolicies.ingress.to.logging-loki:3100.from.k8s.monitoring-monitoring-kube-prometheus@monitoring/prometheus | bool | `true` |  |
| bigbangPackage.networkPolicies.egress.from.logging-loki.to.k8s.tempo/tempo:9411 | bool | `true` |  |
| monitoring.enabled | bool | `false` | If enabled, create configmaps with Big Bang dashboards for monitoring Loki |
| bbtests.enabled | bool | `false` |  |
| bbtests.scripts.image | string | `"registry1.dso.mil/ironbank/big-bang/base:2.1.0"` |  |
| bbtests.scripts.envs.LOKI_URL | string | `"http://{{ .Values.upstream.fullnameOverride }}.{{ .Release.Namespace }}.svc:3100"` |  |
| bbtests.scripts.envs.LOKI_VERSION | string | `"{{ .Values.upstream.loki.image.tag }}"` |  |
| upstream | object | Upstream chart values plus the Big Bang overrides below | Values to pass to [the upstream Loki chart](https://github.com/grafana/loki/blob/main/production/helm/loki/values.yaml) |

## Contributing

Please see the [contributing guide](./CONTRIBUTING.md) if you are interested in contributing.

---

_This file is programatically generated using `helm-docs` and some BigBang-specific templates. The `gluon` repository has [instructions for regenerating package READMEs](https://repo1.dso.mil/big-bang/product/packages/gluon/-/blob/master/docs/bb-package-readme.md)._
