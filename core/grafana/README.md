<!-- Warning: Do not manually edit this file. See notes on gluon + helm-docs at the end of this file for more information. -->
# grafana

![Version: 13.2.5-bb.4](https://img.shields.io/badge/Version-13.2.5--bb.4-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 13.2.1](https://img.shields.io/badge/AppVersion-13.2.1-informational?style=flat-square) ![Maintenance Track: bb_integrated](https://img.shields.io/badge/Maintenance_Track-bb_integrated-green?style=flat-square)

The leading tool for querying and visualizing time series and metrics. This variant delegates Istio and NetworkPolicy configuration to the Big Bang operator via a Package CR instead of bb-common.

## Upstream References

- <https://grafana.com>
- <https://github.com/grafana/grafana>
- <https://github.com/grafana-community/helm-charts>

## Upstream Release Notes

- [Find our upstream chart's CHANGELOG here](https://github.com/grafana-community/helm-charts/tree/main/charts/grafana#upgrading-an-existing-release-to-a-new-major-version)
- [and our upstream application release notes here](https://grafana.com/docs/grafana/latest/release-notes/)

## Learn More

- [Application Overview](docs/overview.md)
- [Other Documentation](docs/)

## Pre-Requisites

- Kubernetes Cluster deployed
- Kubernetes config installed in `~/.kube/config`
- Helm installed

Kubernetes: `^1.25.0-0`

Install Helm

https://helm.sh/docs/intro/install/

## Deployment

- Clone down the repository
- cd into directory

```bash
helm install grafana chart/
```

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| global.imageRegistry | string | `"registry1.dso.mil"` | Overrides the Docker registry globally for all images |
| global.imagePullSecrets | list | `[]` |  |
| enterprise | object | `{"createSecret":false,"license":null}` | Toggle creation of Enterprise License Secret See https://docs-bigbang.dso.mil/latest/packages/grafana/docs/enterprise |
| alertmanager | object | `{"enabled":true}` | kube-prometheus-stack dashboard backward-compatibility values |
| coreDns.enabled | bool | `true` |  |
| kubeEtcd.enabled | bool | `true` |  |
| kubeApiServer.enabled | bool | `true` |  |
| kubeControllerManager.enabled | bool | `true` |  |
| kubeScheduler.enabled | bool | `true` |  |
| kubeProxy.enabled | bool | `true` |  |
| nodeExporter.enabled | bool | `true` |  |
| nodeExporter.operatingSystems.linux.enabled | bool | `true` |  |
| nodeExporter.operatingSystems.aix.enabled | bool | `true` |  |
| nodeExporter.operatingSystems.darwin.enabled | bool | `true` |  |
| kubelet.enabled | bool | `true` |  |
| windowsMonitoring.enabled | bool | `true` |  |
| prometheusRemoteWriteDashboards | bool | `true` |  |
| grafana.forceDeployDashboards | bool | `true` |  |
| grafana.defaultDashboardsEnabled | bool | `true` |  |
| grafana.operator.dashboardsConfigMapRefEnabled | bool | `false` |  |
| grafana.operator.annotations | object | `{}` |  |
| grafana.operator.matchLabels | object | `{}` |  |
| grafana.defaultDashboardsEditable | bool | `true` |  |
| grafana.sidecar.dashboards.label | string | `"grafana_dashboard"` |  |
| grafana.sidecar.dashboards.labelValue | string | `"1"` |  |
| grafana.sidecar.dashboards.annotations | object | `{}` |  |
| bigbangPackage.enabled | bool | `true` |  |
| bigbangPackage.labels | object | `{}` |  |
| bigbangPackage.annotations | object | `{}` |  |
| bigbangPackage.istio.prependReleaseName | bool | `true` |  |
| bigbangPackage.istio.enabled | bool | `false` |  |
| bigbangPackage.istio.sidecar.enabled | bool | `false` |  |
| bigbangPackage.istio.sidecar.outboundTrafficPolicyMode | string | `"REGISTRY_ONLY"` |  |
| bigbangPackage.istio.authorizationPolicies.enabled | bool | `true` |  |
| bigbangPackage.istio.authorizationPolicies.generateFromNetpol | bool | `true` |  |
| bigbangPackage.networkPolicies.enabled | bool | `true` |  |
| bigbangPackage.networkPolicies.prependReleaseName | bool | `true` |  |
| bigbangPackage.networkPolicies.egress.from.grafana.to.cidr."0.0.0.0/0" | bool | `true` |  |
| bigbangPackage.networkPolicies.egress.from.grafana.to.definition.kubeAPI | bool | `true` |  |
| bigbangPackage.networkPolicies.ingress.to.grafana.from.k8s.kiali-service-account@kiali/kiali | bool | `true` |  |
| bigbangPackage.routes.inbound.grafana.enabled | bool | `true` |  |
| bigbangPackage.routes.inbound.grafana.hosts[0] | string | `"grafana.{{ .Values.domain }}"` |  |
| bigbangPackage.routes.inbound.grafana.service | string | `"monitoring-grafana.monitoring.svc.cluster.local"` |  |
| bigbangPackage.routes.inbound.grafana.port | int | `80` |  |
| bigbangPackage.routes.inbound.grafana.containerPort | int | `3000` |  |
| bigbangPackage.routes.inbound.grafana.http[0].match[0].uri.prefix | string | `"/metrics"` |  |
| bigbangPackage.routes.inbound.grafana.http[0].redirect.uri | string | `"/"` |  |
| bigbangPackage.routes.inbound.grafana.http[1].route[0].destination.host | string | `"monitoring-grafana"` |  |
| bigbangPackage.routes.inbound.grafana.http[1].route[0].destination.port.number | int | `80` |  |
| bigbangPackage.routes.inbound.grafana.selector."app.kubernetes.io/name" | string | `"grafana"` |  |
| domain | string | `"dev.bigbang.mil"` |  |
| autoRollingUpgrade.enabled | bool | `true` | Enable BigBang specific autoRollingUpgrade support |
| autoRollingUpgrade.image.repository | string | `"registry1.dso.mil/ironbank/big-bang/base"` |  |
| autoRollingUpgrade.image.tag | string | `"2.1.0"` |  |
| sso.enabled | bool | `false` |  |
| upstream | object | Upstream chart values | Values to pass to [the upstream grafana chart](https://github.com/grafana-community/helm-charts/blob/main/charts/grafana/values.yaml) |

## Contributing

Please see the [contributing guide](./CONTRIBUTING.md) if you are interested in contributing.

---

_This file is programatically generated using `helm-docs` and some BigBang-specific templates. The `gluon` repository has [instructions for regenerating package READMEs](https://repo1.dso.mil/big-bang/product/packages/gluon/-/blob/master/docs/bb-package-readme.md)._
