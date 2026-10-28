<!-- Warning: Do not manually edit this file. See notes on gluon + helm-docs at the end of this file for more information. -->
# monitoring

![Version: 87.10.1-bb.10](https://img.shields.io/badge/Version-87.10.1--bb.10-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: v0.92.1](https://img.shields.io/badge/AppVersion-v0.92.1-informational?style=flat-square) ![Maintenance Track: bb_integrated](https://img.shields.io/badge/Maintenance_Track-bb_integrated-green?style=flat-square)

kube-prometheus-stack collects Kubernetes manifests, Grafana dashboards, and Prometheus rules combined with documentation and scripts to provide easy to operate end-to-end Kubernetes cluster monitoring with Prometheus using the Prometheus Operator. This variant delegates Istio and NetworkPolicy configuration to the Big Bang operator via a Package CR instead of bb-common.

## Upstream References

- <https://github.com/prometheus-operator/kube-prometheus>
- <https://github.com/prometheus-community/helm-charts>
- <https://github.com/prometheus-operator/kube-prometheus>

## Upstream Release Notes

- [Find our upstream chart's CHANGELOG here](https://github.com/prometheus-community/helm-charts/blob/main/charts/kube-prometheus-stack/README.md#upgrading-chart)
- [and our upstream application release notes here](https://github.com/prometheus-operator/kube-prometheus/blob/main/CHANGELOG.md)

## Learn More

- [Application Overview](docs/overview.md)
- [Other Documentation](docs/)

## Pre-Requisites

- Kubernetes Cluster deployed
- Kubernetes config installed in `~/.kube/config`
- Helm installed

Kubernetes: `>=1.19.0-0`

Install Helm

https://helm.sh/docs/intro/install/

## Deployment

- Clone down the repository
- cd into directory

```bash
helm install monitoring chart/
```

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| upstream | object | Upstream chart values | Values to pass to [the upstream kube-prometheus-stack chart](https://github.com/prometheus-community/helm-charts/blob/main/charts/kube-prometheus-stack/values.yaml) |
| flux.enabled | bool | `false` |  |
| flux.namespace | string | `"flux-system"` |  |
| kyvernoPolicyException.enabled | bool | `true` |  |
| kyvernoPolicyException.namespace | string | `"kyverno"` |  |
| kyvernoPolicyException.policies[0] | string | `"disallow-tolerations"` |  |
| kyvernoPolicyException.policies[1] | string | `"restrict-host-path-mount"` |  |
| kyvernoPolicyException.policies[2] | string | `"restrict-host-path-write"` |  |
| kyvernoPolicyException.policies[3] | string | `"restrict-volume-types"` |  |
| bigbangPackage.enabled | bool | `true` |  |
| bigbangPackage.labels | object | `{}` |  |
| bigbangPackage.annotations | object | `{}` |  |
| bigbangPackage.istio.enabled | bool | `false` |  |
| bigbangPackage.istio.mtls.mode | string | `"STRICT"` |  |
| bigbangPackage.istio.authorizationPolicies.enabled | bool | `true` |  |
| bigbangPackage.istio.authorizationPolicies.generateFromNetpol | bool | `true` |  |
| bigbangPackage.networkPolicies.enabled | bool | `false` |  |
| bigbangPackage.networkPolicies.egress.from.kube-prometheus-stack-prometheus-operator.to.definition.kubeAPI | bool | `true` | The operator must be able to read Prometheus/Alertmanager CRs from the k8s API |
| bigbangPackage.networkPolicies.egress.from.kube-state-metrics.to.definition.kubeAPI | bool | `true` | Kube-state-metrics derives its metrics from the k8s API |
| bigbangPackage.networkPolicies.egress.from.prometheus.to.definition.kubeAPI | bool | `true` | Prometheus must be able to read ServiceMonitor and PodMonitor resources from the k8s API |
| bigbangPackage.networkPolicies.egress.from.prometheus.to.k8s.* | bool | `true` | Prometheus must be able to scrape any workload in the cluster |
| bigbangPackage.networkPolicies.egress.from.alertmanager.to.cidr."0.0.0.0/0" | bool | `false` | Alertmanager can be configured to integrate with many external alerting systems, so we define this policy but set it to false; set it to true if you need this connectivity |
| bigbangPackage.networkPolicies.ingress.to.kube-prometheus-stack-prometheus-operator:10250.from.definition.control-plane-subnets | bool | `true` | kube API admission webhook traffic and Prometheus scrape access. Narrow via the operator's shared control-plane-subnets definition. |
| bigbangPackage.networkPolicies.ingress.to.prometheus:10901.from.k8s.thanos/thanos | bool | `false` | Thanos store API access to Prometheus sidecar. Set true when Thanos is deployed. |
| bigbangPackage.networkPolicies.ingress.to.prometheus:9090.from.k8s.tempo-tempo@tempo/tempo | bool | `false` | Tempo Prometheus remote-write/read access. Set true when Tempo is deployed. Use service-account identity format for SPIFFE principal generation. |
| bigbangPackage.networkPolicies.ingress.to.prometheus:9090.from.k8s.kiali-service-account@kiali/kiali | bool | `false` | Kiali Prometheus access. Set true when Kiali is deployed. Use service-account identity format for SPIFFE principal generation. |
| bigbangPackage.routes.inbound.monitoring-prometheus.enabled | bool | `true` |  |
| bigbangPackage.routes.inbound.monitoring-prometheus.metadata.labels | object | `{}` |  |
| bigbangPackage.routes.inbound.monitoring-prometheus.metadata.annotations | object | `{}` |  |
| bigbangPackage.routes.inbound.monitoring-prometheus.hosts[0] | string | `"prometheus.{{ .Values.domain }}"` |  |
| bigbangPackage.routes.inbound.monitoring-prometheus.service | string | `"{{ printf \"%s-%s\" (include \"kube-prometheus-stack.fullname\" .) \"kube-prometheus\" }}.{{ .Release.Namespace }}.svc.cluster.local"` |  |
| bigbangPackage.routes.inbound.monitoring-prometheus.port | int | `9090` |  |
| bigbangPackage.routes.inbound.monitoring-prometheus.containerPort | int | `9090` |  |
| bigbangPackage.routes.inbound.monitoring-prometheus.selector."app.kubernetes.io/name" | string | `"prometheus"` |  |
| bigbangPackage.routes.inbound.monitoring-alertmanager.enabled | bool | `true` |  |
| bigbangPackage.routes.inbound.monitoring-alertmanager.metadata.labels | object | `{}` |  |
| bigbangPackage.routes.inbound.monitoring-alertmanager.metadata.annotations | object | `{}` |  |
| bigbangPackage.routes.inbound.monitoring-alertmanager.hosts[0] | string | `"alertmanager.{{ .Values.domain }}"` |  |
| bigbangPackage.routes.inbound.monitoring-alertmanager.service | string | `"{{ printf \"%s-%s\" (include \"kube-prometheus-stack.fullname\" .) \"kube-alertmanager\" }}.{{ .Release.Namespace }}.svc.cluster.local"` |  |
| bigbangPackage.routes.inbound.monitoring-alertmanager.port | int | `9093` |  |
| bigbangPackage.routes.inbound.monitoring-alertmanager.containerPort | int | `9093` |  |
| bigbangPackage.routes.inbound.monitoring-alertmanager.selector."app.kubernetes.io/name" | string | `"alertmanager"` |  |
| bigbangPackage.routes.outbound | object | `{}` |  |
| kiali.enabled | bool | `false` |  |
| sso.enabled | bool | `false` |  |
| sso.selector.key | string | `"protect"` |  |
| sso.selector.value | string | `"keycloak"` |  |
| tempo.enabled | bool | `false` |  |
| cleanUpgrade.enabled | bool | `false` |  |
| cleanUpgrade.image.registry | string | `"registry1.dso.mil"` |  |
| cleanUpgrade.image.repository | string | `"ironbank/big-bang/base"` |  |
| cleanUpgrade.image.tag | string | `"2.1.0"` |  |
| cleanUpgrade.image.sha | string | `""` |  |
| cleanUpgrade.image.imagePullSecrets[0].name | string | `"private-registry"` |  |
| cleanUpgrade.resources.requests.memory | string | `"256Mi"` |  |
| cleanUpgrade.resources.requests.cpu | string | `"100m"` |  |
| cleanUpgrade.resources.limits.memory | string | `"256Mi"` |  |
| cleanUpgrade.resources.limits.cpu | string | `"100m"` |  |
| cleanUpgrade.securityContext.runAsUser | int | `1000` |  |
| cleanUpgrade.securityContext.runAsGroup | int | `1000` |  |
| cleanUpgrade.securityContext.runAsNonRoot | bool | `true` |  |
| cleanUpgrade.securityContext.allowPrivilegeEscalation | bool | `false` |  |
| cleanUpgrade.securityContext.readOnlyRootFilesystem | bool | `true` |  |
| cleanUpgrade.securityContext.capabilities.drop[0] | string | `"ALL"` |  |
| blackboxExporter.enabled | bool | `false` |  |
| blackboxExporter.nameOverride | string | `"prometheus-blackbox-exporter"` |  |
| blackboxExporter.global.imageRegistry | string | `"registry1.dso.mil"` |  |
| blackboxExporter.restartPolicy | string | `"Always"` |  |
| blackboxExporter.kind | string | `"Deployment"` |  |
| blackboxExporter.automountServiceAccountToken | bool | `false` |  |
| blackboxExporter.revisionHistoryLimit | int | `10` |  |
| blackboxExporter.hostNetwork | bool | `false` |  |
| blackboxExporter.strategy.rollingUpdate.maxSurge | int | `1` |  |
| blackboxExporter.strategy.rollingUpdate.maxUnavailable | int | `0` |  |
| blackboxExporter.strategy.type | string | `"RollingUpdate"` |  |
| blackboxExporter.image.registry | string | `"registry1.dso.mil"` |  |
| blackboxExporter.image.repository | string | `"ironbank/opensource/prometheus/blackbox_exporter"` |  |
| blackboxExporter.image.tag | string | `"v0.28.0"` |  |
| blackboxExporter.image.pullSecrets[0] | string | `"private-registry"` |  |
| blackboxExporter.securityContext.runAsUser | int | `1000` |  |
| blackboxExporter.securityContext.runAsGroup | int | `1000` |  |
| blackboxExporter.securityContext.readOnlyRootFilesystem | bool | `true` |  |
| blackboxExporter.securityContext.runAsNonRoot | bool | `true` |  |
| blackboxExporter.securityContext.allowPrivilegeEscalation | bool | `false` |  |
| blackboxExporter.securityContext.capabilities.drop[0] | string | `"ALL"` |  |
| blackboxExporter.livenessProbe.httpGet.path | string | `"/-/healthy"` |  |
| blackboxExporter.livenessProbe.httpGet.port | string | `"http"` |  |
| blackboxExporter.livenessProbe.failureThreshold | int | `3` |  |
| blackboxExporter.readinessProbe.httpGet.path | string | `"/-/healthy"` |  |
| blackboxExporter.readinessProbe.httpGet.port | string | `"http"` |  |
| blackboxExporter.configExistingSecretName | string | `""` |  |
| blackboxExporter.secretConfig | bool | `false` |  |
| blackboxExporter.config.modules.http_2xx.prober | string | `"http"` |  |
| blackboxExporter.config.modules.http_2xx.timeout | string | `"5s"` |  |
| blackboxExporter.config.modules.http_2xx.http.valid_http_versions[0] | string | `"HTTP/1.1"` |  |
| blackboxExporter.config.modules.http_2xx.http.valid_http_versions[1] | string | `"HTTP/2.0"` |  |
| blackboxExporter.config.modules.http_2xx.http.follow_redirects | bool | `true` |  |
| blackboxExporter.config.modules.http_2xx.http.preferred_ip_protocol | string | `"ip4"` |  |
| blackboxExporter.service.annotations | object | `{}` |  |
| blackboxExporter.service.labels | object | `{}` |  |
| blackboxExporter.service.type | string | `"ClusterIP"` |  |
| blackboxExporter.service.port | int | `9115` |  |
| blackboxExporter.service.ipDualStack.enabled | bool | `false` |  |
| blackboxExporter.service.ipDualStack.ipFamilies[0] | string | `"IPv6"` |  |
| blackboxExporter.service.ipDualStack.ipFamilies[1] | string | `"IPv4"` |  |
| blackboxExporter.service.ipDualStack.ipFamilyPolicy | string | `"PreferDualStack"` |  |
| blackboxExporter.containerPort | int | `9115` |  |
| blackboxExporter.replicas | int | `1` |  |
| blackboxExporter.serviceMonitor.selfMonitor.enabled | bool | `false` |  |
| blackboxExporter.serviceMonitor.selfMonitor.additionalMetricsRelabels | object | `{}` |  |
| blackboxExporter.serviceMonitor.selfMonitor.additionalRelabeling | list | `[]` |  |
| blackboxExporter.serviceMonitor.selfMonitor.labels | object | `{}` |  |
| blackboxExporter.serviceMonitor.selfMonitor.path | string | `"/metrics"` |  |
| blackboxExporter.serviceMonitor.selfMonitor.scheme | string | `"http"` |  |
| blackboxExporter.serviceMonitor.selfMonitor.tlsConfig | object | `{}` |  |
| blackboxExporter.serviceMonitor.selfMonitor.interval | string | `"30s"` |  |
| blackboxExporter.serviceMonitor.selfMonitor.scrapeTimeout | string | `"30s"` |  |
| blackboxExporter.serviceMonitor.enabled | bool | `false` |  |
| blackboxExporter.configReloader.enabled | bool | `false` |  |
| blackboxExporter.configReloader.containerPort | int | `8080` |  |
| blackboxExporter.configReloader.config.logFormat | string | `"logfmt"` |  |
| blackboxExporter.configReloader.config.logLevel | string | `"info"` |  |
| blackboxExporter.configReloader.config.watchInterval | string | `"1m"` |  |
| blackboxExporter.configReloader.image.registry | string | `"registry1.dso.mil"` |  |
| blackboxExporter.configReloader.image.repository | string | `"ironbank/opensource/prometheus-operator/prometheus-config-reloader"` |  |
| blackboxExporter.configReloader.image.tag | string | `"v0.92.1"` |  |
| blackboxExporter.configReloader.image.pullPolicy | string | `"IfNotPresent"` |  |
| blackboxExporter.configReloader.image.digest | string | `""` |  |
| blackboxExporter.configReloader.image.imagePullSecrets[0].name | string | `"private-registry"` |  |
| blackboxExporter.configReloader.securityContext.runAsUser | int | `1000` |  |
| blackboxExporter.configReloader.securityContext.runAsGroup | int | `1000` |  |
| blackboxExporter.configReloader.securityContext.readOnlyRootFilesystem | bool | `true` |  |
| blackboxExporter.configReloader.securityContext.runAsNonRoot | bool | `true` |  |
| blackboxExporter.configReloader.securityContext.allowPrivilegeEscalation | bool | `false` |  |
| blackboxExporter.configReloader.securityContext.capabilities.drop[0] | string | `"ALL"` |  |
| blackboxExporter.configReloader.resources.limits.memory | string | `"50Mi"` |  |
| blackboxExporter.configReloader.resources.requests.cpu | string | `"10m"` |  |
| blackboxExporter.configReloader.resources.requests.memory | string | `"20Mi"` |  |
| blackboxExporter.configReloader.service.port | int | `8080` |  |
| blackboxExporter.configReloader.serviceMonitor.selfMonitor.additionalMetricsRelabels | object | `{}` |  |
| blackboxExporter.configReloader.serviceMonitor.selfMonitor.additionalRelabeling | list | `[]` |  |
| blackboxExporter.configReloader.serviceMonitor.selfMonitor.path | string | `"/metrics"` |  |
| blackboxExporter.configReloader.serviceMonitor.selfMonitor.scheme | string | `"http"` |  |
| blackboxExporter.configReloader.serviceMonitor.selfMonitor.tlsConfig | object | `{}` |  |
| blackboxExporter.configReloader.serviceMonitor.selfMonitor.interval | string | `"30s"` |  |
| blackboxExporter.configReloader.serviceMonitor.selfMonitor.scrapeTimeout | string | `"30s"` |  |
| snmpExporter.enabled | bool | `false` |  |
| snmpExporter.nameOverride | string | `"prometheus-snmp-exporter"` |  |
| snmpExporter.image.repository | string | `"registry1.dso.mil/ironbank/opensource/prometheus/snmp_exporter"` |  |
| snmpExporter.image.tag | string | `"v0.30.1"` |  |
| snmpExporter.image.imagePullSecrets[0].name | string | `"private-registry"` |  |
| snmpExporter.configmapReload.image.repository | string | `"registry1.dso.mil/ironbank/opensource/prometheus-operator/prometheus-config-reloader"` |  |
| snmpExporter.configmapReload.image.tag | string | `"v0.92.1"` |  |
| snmpExporter.configmapReload.image.imagePullSecrets[0].name | string | `"private-registry"` |  |
| snmpExporter.configmapReload.containerSecurityContext.runAsGroup | int | `1001` |  |
| snmpExporter.configmapReload.containerSecurityContext.runAsNonRoot | bool | `true` |  |
| snmpExporter.configmapReload.containerSecurityContext.runAsUser | int | `1001` |  |
| snmpExporter.configmapReload.containerSecurityContext.capabilities.drop[0] | string | `"ALL"` |  |
| snmpExporter.securityContext.runAsNonRoot | bool | `true` |  |
| snmpExporter.securityContext.runAsUser | int | `1001` |  |
| snmpExporter.securityContext.runAsGroup | int | `1001` |  |
| snmpExporter.securityContext.fsGroup | int | `1001` |  |
| snmpExporter.containerSecurityContext.runAsGroup | int | `1001` |  |
| snmpExporter.containerSecurityContext.runAsNonRoot | bool | `true` |  |
| snmpExporter.containerSecurityContext.runAsUser | int | `1001` |  |
| snmpExporter.containerSecurityContext.capabilities.drop[0] | string | `"ALL"` |  |
| snmpExporter.serviceMonitor.enabled | bool | `true` |  |
| prometheusRule.IstioSidecarMemModerate | bool | `true` |  |
| prometheusRule.IstioSidecarMemHigh | bool | `true` |  |
| prometheusRule.Istio5XXResponseCode | bool | `true` |  |
| prometheusRule.IstioSidecarEndpointError | bool | `true` |  |
| prometheusRule.IstioSidecarListenerConflict | bool | `true` |  |
| prometheusRule.IstioAmbientReadinessProbeFailures | bool | `true` |  |
| hookNetworkPolicies | object | `{"egress":[{"ports":[{"port":443,"protocol":"TCP"},{"port":6443,"protocol":"TCP"}],"to":[{"ipBlock":{"cidr":"10.0.0.0/8"}},{"ipBlock":{"cidr":"172.16.0.0/12"}},{"ipBlock":{"cidr":"192.168.0.0/16"}}]},{"ports":[{"port":53,"protocol":"UDP"},{"port":53,"protocol":"TCP"}],"to":[{"namespaceSelector":{"matchLabels":{"kubernetes.io/metadata.name":"kube-system"}},"podSelector":{"matchLabels":{"k8s-app":"kube-dns"}}}]},{"ports":[{"port":15012,"protocol":"TCP"}],"to":[{"namespaceSelector":{"matchLabels":{"kubernetes.io/metadata.name":"istio-system"}},"podSelector":{"matchLabels":{"app":"istiod"}}}]}]}` | Egress rules for the chart's hook Jobs. Override for your API endpoints, DNS, or mesh control plane. |

## Contributing

Please see the [contributing guide](./CONTRIBUTING.md) if you are interested in contributing.

---

_This file is programatically generated using `helm-docs` and some BigBang-specific templates. The `gluon` repository has [instructions for regenerating package READMEs](https://repo1.dso.mil/big-bang/product/packages/gluon/-/blob/master/docs/bb-package-readme.md)._
