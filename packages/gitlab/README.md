<!-- Warning: Do not manually edit this file. See notes on gluon + helm-docs at the end of this file for more information. -->
# gitlab

![Version: 10.3.2-bb.4](https://img.shields.io/badge/Version-10.3.2--bb.4-informational?style=flat-square) ![AppVersion: 19.3.2](https://img.shields.io/badge/AppVersion-19.3.2-informational?style=flat-square) ![Maintenance Track: bb_integrated](https://img.shields.io/badge/Maintenance_Track-bb_integrated-green?style=flat-square)

GitLab is the most comprehensive AI-powered DevSecOps Platform. This variant delegates Istio and NetworkPolicy configuration to the Big Bang operator via a Package CR instead of bb-common.

## Upstream References

- <https://about.gitlab.com/>
- <https://gitlab.com/gitlab-org/charts/gitlab>

## Upstream Release Notes

The [upstream chart's release notes](https://gitlab.com/gitlab-org/charts/gitlab/-/blob/master/CHANGELOG.md) may help when reviewing this package.

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
helm install gitlab chart/
```

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| bigbangPackage.enabled | bool | `true` |  |
| bigbangPackage.labels | object | `{}` |  |
| bigbangPackage.annotations | object | `{}` |  |
| bigbangPackage.istio.enabled | bool | `false` |  |
| bigbangPackage.istio.authorizationPolicies.enabled | bool | `true` |  |
| bigbangPackage.istio.authorizationPolicies.generateFromNetpol | bool | `true` |  |
| bigbangPackage.routes.inbound.gitlab.enabled | bool | `true` |  |
| bigbangPackage.routes.inbound.gitlab.gateways[0] | string | `"istio-gateway/public-ingressgateway"` |  |
| bigbangPackage.routes.inbound.gitlab.hosts[0] | string | `"gitlab.{{ .Values.domain }}"` |  |
| bigbangPackage.routes.inbound.gitlab.service | string | `"gitlab-webservice-default"` |  |
| bigbangPackage.routes.inbound.gitlab.port | int | `8181` |  |
| bigbangPackage.routes.inbound.gitlab.http[0].fault.abort.httpStatus | int | `403` |  |
| bigbangPackage.routes.inbound.gitlab.http[0].fault.abort.percentage.value | int | `100` |  |
| bigbangPackage.routes.inbound.gitlab.http[0].match[0].uri.prefix | string | `"/-/metrics"` |  |
| bigbangPackage.routes.inbound.gitlab.http[0].route[0].destination.host | string | `"gitlab-webservice-default"` |  |
| bigbangPackage.routes.inbound.gitlab.http[0].route[0].destination.port.number | int | `8181` |  |
| bigbangPackage.routes.inbound.gitlab.http[1].match[0].uri.prefix | string | `"/"` |  |
| bigbangPackage.routes.inbound.gitlab.http[1].route[0].destination.host | string | `"gitlab-webservice-default"` |  |
| bigbangPackage.routes.inbound.gitlab.http[1].route[0].destination.port.number | int | `8181` |  |
| bigbangPackage.routes.inbound.gitlab.http[2].match[0].uri.prefix | string | `"/admin/sidekiq"` |  |
| bigbangPackage.routes.inbound.gitlab.http[2].route[0].destination.host | string | `"gitlab-webservice-default"` |  |
| bigbangPackage.routes.inbound.gitlab.http[2].route[0].destination.port.number | int | `8080` |  |
| bigbangPackage.routes.inbound.gitlab.selector.app | string | `"webservice"` |  |
| bigbangPackage.routes.inbound.registry.enabled | bool | `false` |  |
| bigbangPackage.routes.inbound.registry.gateways[0] | string | `"istio-gateway/public-ingressgateway"` |  |
| bigbangPackage.routes.inbound.registry.hosts[0] | string | `"registry.{{ .Values.domain }}"` |  |
| bigbangPackage.routes.inbound.registry.service | string | `"gitlab-registry"` |  |
| bigbangPackage.routes.inbound.registry.port | int | `5000` |  |
| bigbangPackage.routes.inbound.registry.selector.app | string | `"registry"` |  |
| bigbangPackage.routes.outbound.gitlab.enabled | bool | `true` |  |
| bigbangPackage.routes.outbound.gitlab.hosts[0] | string | `"gitlab.com"` |  |
| bigbangPackage.routes.outbound.gitlab.hosts[1] | string | `"version.gitlab.com"` |  |
| bigbangPackage.routes.outbound.gravatar.enabled | bool | `true` |  |
| bigbangPackage.routes.outbound.gravatar.hosts[0] | string | `"secure.gravatar.com"` |  |
| bigbangPackage.networkPolicies.enabled | bool | `false` |  |
| bigbangPackage.networkPolicies.ingress.to.redis:9121.from.k8s.monitoring-monitoring-kube-prometheus@monitoring/prometheus | bool | `true` |  |
| bigbangPackage.networkPolicies.ingress.to.gitlab-exporter:9168.podSelector.matchLabels.app | string | `"gitlab-exporter"` |  |
| bigbangPackage.networkPolicies.ingress.to.gitlab-exporter:9168.from.k8s.monitoring-monitoring-kube-prometheus@monitoring/prometheus | bool | `true` |  |
| bigbangPackage.networkPolicies.ingress.to.gitaly:9236.podSelector.matchLabels.app | string | `"gitaly"` |  |
| bigbangPackage.networkPolicies.ingress.to.gitaly:9236.from.k8s.monitoring-monitoring-kube-prometheus@monitoring/prometheus | bool | `true` |  |
| bigbangPackage.networkPolicies.ingress.to.webservice:[8083,8084,9229].podSelector.matchLabels.app | string | `"webservice"` |  |
| bigbangPackage.networkPolicies.ingress.to.webservice:[8083,8084,9229].from.k8s.monitoring-monitoring-kube-prometheus@monitoring/prometheus | bool | `true` |  |
| bigbangPackage.networkPolicies.ingress.to.registry:5001.podSelector.matchLabels.app | string | `"registry"` |  |
| bigbangPackage.networkPolicies.ingress.to.registry:5001.from.k8s.monitoring-monitoring-kube-prometheus@monitoring/prometheus | bool | `true` |  |
| bigbangPackage.networkPolicies.egress.from.*.to.definition.kubeAPI | bool | `true` |  |
| bigbangPackage.networkPolicies.egress.from.webservice.podSelector.matchLabels.app | string | `"webservice"` |  |
| bigbangPackage.networkPolicies.egress.from.webservice.to.definition.sso | bool | `true` |  |
| bigbangPackage.networkPolicies.egress.from.webservice.to.definition.database-subnets | bool | `true` |  |
| bigbangPackage.networkPolicies.egress.from.webservice.to.definition.redis-subnets | bool | `true` |  |
| bigbangPackage.networkPolicies.egress.from.webservice.to.definition.storage-subnets | bool | `true` |  |
| bigbangPackage.networkPolicies.egress.from.sidekiq.podSelector.matchLabels.app | string | `"sidekiq"` |  |
| bigbangPackage.networkPolicies.egress.from.sidekiq.to.definition.database-subnets | bool | `true` |  |
| bigbangPackage.networkPolicies.egress.from.sidekiq.to.definition.redis-subnets | bool | `true` |  |
| bigbangPackage.networkPolicies.egress.from.sidekiq.to.definition.storage-subnets | bool | `true` |  |
| bigbangPackage.networkPolicies.egress.from.migrations.podSelector.matchLabels.app | string | `"migrations"` |  |
| bigbangPackage.networkPolicies.egress.from.migrations.to.definition.database-subnets | bool | `true` |  |
| bigbangPackage.networkPolicies.egress.from.migrations.to.definition.redis-subnets | bool | `true` |  |
| bigbangPackage.networkPolicies.egress.from.toolbox.podSelector.matchLabels.app | string | `"toolbox"` |  |
| bigbangPackage.networkPolicies.egress.from.toolbox.to.definition.database-subnets | bool | `true` |  |
| bigbangPackage.networkPolicies.egress.from.toolbox.to.definition.redis-subnets | bool | `true` |  |
| bigbangPackage.networkPolicies.egress.from.toolbox.to.definition.storage-subnets | bool | `true` |  |
| bigbangPackage.networkPolicies.egress.from.gitlab-exporter.podSelector.matchLabels.app | string | `"gitlab-exporter"` |  |
| bigbangPackage.networkPolicies.egress.from.gitlab-exporter.to.definition.database-subnets | bool | `true` |  |
| bigbangPackage.networkPolicies.egress.from.gitlab-exporter.to.definition.redis-subnets | bool | `true` |  |
| bigbangPackage.networkPolicies.egress.from.registry.podSelector.matchLabels.app | string | `"registry"` |  |
| bigbangPackage.networkPolicies.egress.from.registry.to.definition.storage-subnets | bool | `true` |  |
| global.image.pullSecrets[0].name | string | `"private-registry"` |  |
| global.imagePullSecrets[0].name | string | `"private-registry"` |  |
| global.hosts.domain | string | `"dev.bigbang.mil"` |  |
| global.hosts.gitlab.name | string | `"gitlab.dev.bigbang.mil"` |  |
| global.hosts.registry.name | string | `"registry.dev.bigbang.mil"` |  |
| global.ingress.configureCertmanager | bool | `false` |  |
| global.gatewayApi.enabled | bool | `false` |  |
| global.gatewayApi.installEnvoy | bool | `false` |  |
| global.gatewayApi.configureCertmanager | bool | `false` |  |
| global.hpa.apiVersion | string | `"autoscaling/v2"` |  |
| global.pdb.apiVersion | string | `"policy/v1"` |  |
| global.batch.cronJob.apiVersion | string | `"batch/v1"` |  |
| global.appConfig.defaultCanCreateGroup | bool | `false` |  |
| global.appConfig.enableUsagePing | bool | `false` |  |
| global.appConfig.initialDefaults.gitlabProductUsageData | bool | `false` |  |
| global.appConfig.omniauth.enabled | bool | `false` |  |
| global.kas.enabled | bool | `false` |  |
| global.certificates.image.repository | string | `"registry1.dso.mil/gitlab/gitlab-org/build/cng/certificates"` |  |
| global.certificates.image.tag | string | `"v19.3.2-ubi"` |  |
| global.certificates.init.securityContext.capabilities.drop[0] | string | `"ALL"` |  |
| global.certificates.init.securityContext.runAsUser | int | `65534` |  |
| global.certificates.init.securityContext.runAsNonRoot | bool | `true` |  |
| global.certificates.customCAs[0].secret | string | `"ca-certs-australian-defence-organisation-cross-cert-chain"` |  |
| global.certificates.customCAs[1].secret | string | `"ca-certs-australian-defence-organisation-direct-trust-chain"` |  |
| global.certificates.customCAs[2].secret | string | `"ca-certs-boeing"` |  |
| global.certificates.customCAs[3].secret | string | `"ca-certs-carillon-federal-services-trust-chain-1"` |  |
| global.certificates.customCAs[4].secret | string | `"ca-certs-carillon-federal-services-trust-chain-2"` |  |
| global.certificates.customCAs[5].secret | string | `"ca-certs-department-of-state-trust-chain-1"` |  |
| global.certificates.customCAs[6].secret | string | `"ca-certs-department-of-state-trust-chain-2"` |  |
| global.certificates.customCAs[7].secret | string | `"ca-certs-digicert-federal-ssp-trust-chain-1"` |  |
| global.certificates.customCAs[8].secret | string | `"ca-certs-digicert-federal-ssp-trust-chain-2"` |  |
| global.certificates.customCAs[9].secret | string | `"ca-certs-digicert-nfi-trust-chain-1"` |  |
| global.certificates.customCAs[10].secret | string | `"ca-certs-digicert-nfi-trust-chain-2"` |  |
| global.certificates.customCAs[11].secret | string | `"ca-certs-entrust-federal-ssp-trust-chain-1"` |  |
| global.certificates.customCAs[12].secret | string | `"ca-certs-entrust-federal-ssp-trust-chain-2"` |  |
| global.certificates.customCAs[13].secret | string | `"ca-certs-entrust-federal-ssp-trust-chain-3"` |  |
| global.certificates.customCAs[14].secret | string | `"ca-certs-entrust-managed-service-nfi"` |  |
| global.certificates.customCAs[15].secret | string | `"ca-certs-exostar-llc"` |  |
| global.certificates.customCAs[16].secret | string | `"ca-certs-identrust-nfi"` |  |
| global.certificates.customCAs[17].secret | string | `"ca-certs-lockheed-martin"` |  |
| global.certificates.customCAs[18].secret | string | `"ca-certs-netherlands-ministry-of-defence"` |  |
| global.certificates.customCAs[19].secret | string | `"ca-certs-northrop-grumman"` |  |
| global.certificates.customCAs[20].secret | string | `"ca-certs-raytheon-trust-chain-1"` |  |
| global.certificates.customCAs[21].secret | string | `"ca-certs-raytheon-trust-chain-2"` |  |
| global.certificates.customCAs[22].secret | string | `"ca-certs-us-treasury-ssp-trust-chain-1"` |  |
| global.certificates.customCAs[23].secret | string | `"ca-certs-us-treasury-ssp-trust-chain-2"` |  |
| global.certificates.customCAs[24].secret | string | `"ca-certs-verizon-cybertrust-federal-ssp"` |  |
| global.certificates.customCAs[25].secret | string | `"ca-certs-widepoint-federal-ssp-trust-chain-1"` |  |
| global.certificates.customCAs[26].secret | string | `"ca-certs-widepoint-federal-ssp-trust-chain-2"` |  |
| global.certificates.customCAs[27].secret | string | `"ca-certs-widepoint-nfi"` |  |
| global.certificates.customCAs[28].secret | string | `"ca-certs-dod-intermediate-and-issuing-ca-certs"` |  |
| global.certificates.customCAs[29].secret | string | `"ca-certs-dod-trust-anchors-self-signed"` |  |
| global.certificates.customCAs[30].secret | string | `"ca-certs-eca"` |  |
| global.kubectl.image.repository | string | `"registry1.dso.mil/gitlab/gitlab-org/build/cng/kubectl"` |  |
| global.kubectl.image.tag | string | `"v19.3.2-ubi"` |  |
| global.kubectl.securityContext.runAsUser | int | `65534` |  |
| global.kubectl.securityContext.fsGroup | int | `65534` |  |
| global.kubectl.securityContext.seccompProfile.type | string | `"RuntimeDefault"` |  |
| global.gitlabBase.image.repository | string | `"registry1.dso.mil/gitlab/gitlab-org/build/cng/gitlab-base"` |  |
| global.gitlabBase.image.tag | string | `"v19.3.2-ubi"` |  |
| global.serviceAccount.enabled | bool | `true` |  |
| global.serviceAccount.create | bool | `true` |  |
| global.serviceAccount.annotations | object | `{}` |  |
| global.serviceAccount.automountServiceAccountToken | bool | `false` |  |
| upstream.nameOverride | string | `"gitlab"` |  |
| upstream.ai-gateway.image.repository | string | `"registry1.dso.mil/gitlab/gitlab-org/modelops/applied-ml/code-suggestions/ai-assist/model-gateway"` |  |
| upstream.ai-gateway.image.tag | string | `"self-hosted-v19.2.0-ee"` |  |
| upstream.ai-gateway.imagePullSecrets[0].name | string | `"private-registry"` |  |
| upstream.ai-gateway.init.resources.requests.cpu | string | `"200m"` |  |
| upstream.ai-gateway.init.resources.requests.memory | string | `"200Mi"` |  |
| upstream.ai-gateway.init.resources.limits.cpu | string | `"200m"` |  |
| upstream.ai-gateway.init.resources.limits.memory | string | `"200Mi"` |  |
| upstream.ai-gateway.podSecurityContext.seccompProfile.type | string | `"RuntimeDefault"` |  |
| upstream.ai-gateway.securityContext.runAsNonRoot | bool | `true` |  |
| upstream.ai-gateway.securityContext.runAsUser | int | `1000` |  |
| upstream.ai-gateway.securityContext.runAsGroup | int | `1000` |  |
| upstream.ai-gateway.securityContext.allowPrivilegeEscalation | bool | `false` |  |
| upstream.ai-gateway.securityContext.capabilities.drop[0] | string | `"ALL"` |  |
| upstream.ai-gateway.serviceAccount.automount | bool | `false` |  |
| upstream.ai-gateway.test.enabled | bool | `false` |  |
| upstream.ai-gateway.test.image | string | `"registry1.dso.mil/ironbank/afdco/docker/busybox:1.37.0"` |  |
| upstream.ai-gateway.grpc-tls-proxy.image.repository | string | `"registry1.dso.mil/ironbank/opensource/nginx/nginx"` |  |
| upstream.ai-gateway.grpc-tls-proxy.image.tag | string | `"1.31.5"` |  |
| upstream.ai-gateway.grpc-tls-proxy.imagePullSecrets[0].name | string | `"private-registry"` |  |
| upstream.ai-gateway.grpc-tls-proxy.podSecurityContext.seccompProfile.type | string | `"RuntimeDefault"` |  |
| upstream.ai-gateway.grpc-tls-proxy.securityContext.runAsNonRoot | bool | `true` |  |
| upstream.ai-gateway.grpc-tls-proxy.securityContext.runAsUser | int | `997` |  |
| upstream.ai-gateway.grpc-tls-proxy.securityContext.runAsGroup | int | `997` |  |
| upstream.ai-gateway.grpc-tls-proxy.securityContext.allowPrivilegeEscalation | bool | `false` |  |
| upstream.ai-gateway.grpc-tls-proxy.securityContext.capabilities.drop[0] | string | `"ALL"` |  |
| upstream.openbao.image.repository | string | `"registry1.dso.mil/gitlab/gitlab-org/build/cng/gitlab-openbao"` |  |
| upstream.openbao.image.tag | string | `"v2.5.5-gitlab2-ubi"` |  |
| upstream.openbao.imagePullSecrets[0].name | string | `"private-registry"` |  |
| upstream.gitlab-zoekt.indexer.image.repository | string | `"registry1.dso.mil/gitlab/gitlab-org/build/cng/gitlab-zoekt"` |  |
| upstream.gitlab-zoekt.indexer.image.tag | string | `"v19.2.1-ubi"` |  |
| upstream.gitlab-zoekt.webserver.image.repository | string | `"registry1.dso.mil/gitlab/gitlab-org/build/cng/gitlab-zoekt"` |  |
| upstream.gitlab-zoekt.webserver.image.tag | string | `"v19.2.1-ubi"` |  |
| upstream.gitlab-zoekt.gateway.image.repository | string | `"registry1.dso.mil/ironbank/opensource/nginx/nginx"` |  |
| upstream.gitlab-zoekt.gateway.image.tag | string | `"1.31.5"` |  |
| upstream.gitlab-zoekt.imagePullSecrets[0].name | string | `"private-registry"` |  |
| upstream.upgradeCheck.image.repository | string | `"registry1.dso.mil/ironbank/redhat/ubi/ubi9"` |  |
| upstream.upgradeCheck.image.tag | string | `"9.8"` |  |
| upstream.upgradeCheck.securityContext.runAsGroup | int | `65534` |  |
| upstream.upgradeCheck.containerSecurityContext.runAsGroup | int | `65534` |  |
| upstream.upgradeCheck.annotations."sidecar.istio.io/inject" | string | `"true"` |  |
| upstream.upgradeCheck.resources.requests.cpu | string | `"500m"` |  |
| upstream.upgradeCheck.resources.requests.memory | string | `"500Mi"` |  |
| upstream.upgradeCheck.resources.limits.cpu | string | `"500m"` |  |
| upstream.upgradeCheck.resources.limits.memory | string | `"500Mi"` |  |
| upstream.installCertmanager | bool | `false` |  |
| upstream.nginx-ingress.enabled | bool | `false` |  |
| upstream.prometheus.install | bool | `false` |  |
| upstream.registry.enabled | bool | `true` |  |
| upstream.registry.init.resources.limits.cpu | string | `"200m"` |  |
| upstream.registry.init.resources.limits.memory | string | `"200Mi"` |  |
| upstream.registry.init.resources.requests.cpu | string | `"200m"` |  |
| upstream.registry.init.resources.requests.memory | string | `"200Mi"` |  |
| upstream.registry.resources.limits.cpu | string | `"200m"` |  |
| upstream.registry.resources.limits.memory | string | `"1024Mi"` |  |
| upstream.registry.resources.requests.cpu | string | `"200m"` |  |
| upstream.registry.resources.requests.memory | string | `"1024Mi"` |  |
| upstream.registry.image.repository | string | `"registry1.dso.mil/gitlab/gitlab-org/build/cng/gitlab-container-registry"` |  |
| upstream.registry.image.tag | string | `"v4.40.2-gitlab-ubi"` |  |
| upstream.registry.ingress.enabled | bool | `false` |  |
| upstream.registry.metrics.enabled | bool | `true` |  |
| upstream.registry.metrics.serviceMonitor.enabled | bool | `true` |  |
| upstream.registry.securityContext.runAsGroup | int | `1000` |  |
| upstream.registry.containerSecurityContext.runAsGroup | int | `1000` |  |
| upstream.shared-secrets.selfsign.image.repository | string | `"registry1.dso.mil/gitlab/gitlab-org/build/cng/cfssl-self-sign"` |  |
| upstream.shared-secrets.selfsign.image.tag | string | `"v19.3.2-ubi"` |  |
| upstream.shared-secrets.serviceAccount.automountServiceAccountToken | bool | `false` |  |
| upstream.shared-secrets.resources.requests.cpu | string | `"300m"` |  |
| upstream.shared-secrets.resources.requests.memory | string | `"200Mi"` |  |
| upstream.shared-secrets.resources.limits.cpu | string | `"300m"` |  |
| upstream.shared-secrets.resources.limits.memory | string | `"200Mi"` |  |
| upstream.shared-secrets.securityContext.runAsGroup | int | `65534` |  |
| upstream.shared-secrets.annotations."sidecar.istio.io/inject" | string | `"true"` |  |
| upstream.gitlab-runner.install | bool | `false` |  |
| upstream.gitlab.containerSecurityContext.capabilities.drop[0] | string | `"ALL"` |  |
| upstream.gitlab.init.containerSecurityContext.capabilities.drop[0] | string | `"ALL"` |  |
| upstream.gitlab.certificates.init.securityContext.capabilities.drop[0] | string | `"ALL"` |  |
| upstream.gitlab.certificates.init.securityContext.runAsUser | int | `65534` |  |
| upstream.gitlab.certificates.init.securityContext.runAsNonRoot | bool | `true` |  |
| upstream.gitlab.toolbox.image.repository | string | `"registry1.dso.mil/gitlab/gitlab-org/build/cng/gitlab-toolbox-ee"` |  |
| upstream.gitlab.toolbox.image.tag | string | `"v19.3.2-ubi"` |  |
| upstream.gitlab.toolbox.init.resources.requests.cpu | string | `"200m"` |  |
| upstream.gitlab.toolbox.init.resources.requests.memory | string | `"200Mi"` |  |
| upstream.gitlab.toolbox.init.resources.limits.cpu | string | `"200m"` |  |
| upstream.gitlab.toolbox.init.resources.limits.memory | string | `"200Mi"` |  |
| upstream.gitlab.toolbox.resources.requests.cpu | int | `2` |  |
| upstream.gitlab.toolbox.resources.requests.memory | string | `"3.5Gi"` |  |
| upstream.gitlab.toolbox.resources.limits.cpu | int | `2` |  |
| upstream.gitlab.toolbox.resources.limits.memory | string | `"3.5Gi"` |  |
| upstream.gitlab.toolbox.annotations."sidecar.istio.io/proxyMemory" | string | `"512Mi"` |  |
| upstream.gitlab.toolbox.annotations."sidecar.istio.io/proxyMemoryLimit" | string | `"512Mi"` |  |
| upstream.gitlab.toolbox.backups.cron.resources.requests.cpu | string | `"500m"` |  |
| upstream.gitlab.toolbox.backups.cron.resources.requests.memory | string | `"768Mi"` |  |
| upstream.gitlab.toolbox.backups.cron.resources.limits.cpu | string | `"500m"` |  |
| upstream.gitlab.toolbox.backups.cron.resources.limits.memory | string | `"768Mi"` |  |
| upstream.gitlab.toolbox.containerSecurityContext.runAsGroup | int | `1000` |  |
| upstream.gitlab.toolbox.customScripts | string | `nil` |  |
| upstream.gitlab.gitlab-exporter.enabled | bool | `false` |  |
| upstream.gitlab.gitlab-exporter.init.resources.limits.cpu | string | `"200m"` |  |
| upstream.gitlab.gitlab-exporter.init.resources.limits.memory | string | `"200Mi"` |  |
| upstream.gitlab.gitlab-exporter.init.resources.requests.cpu | string | `"200m"` |  |
| upstream.gitlab.gitlab-exporter.init.resources.requests.memory | string | `"200Mi"` |  |
| upstream.gitlab.gitlab-exporter.resources.limits.cpu | string | `"150m"` |  |
| upstream.gitlab.gitlab-exporter.resources.limits.memory | string | `"200Mi"` |  |
| upstream.gitlab.gitlab-exporter.resources.requests.cpu | string | `"150m"` |  |
| upstream.gitlab.gitlab-exporter.resources.requests.memory | string | `"200Mi"` |  |
| upstream.gitlab.gitlab-exporter.capabilities.drop[0] | string | `"ALL"` |  |
| upstream.gitlab.gitlab-exporter.image.repository | string | `"registry1.dso.mil/gitlab/gitlab-org/build/cng/gitlab-exporter"` |  |
| upstream.gitlab.gitlab-exporter.image.tag | string | `"16.9.0-ubi"` |  |
| upstream.gitlab.gitlab-exporter.metrics.serviceMonitor.enabled | bool | `true` |  |
| upstream.gitlab.gitlab-exporter.securityContext.runAsGroup | int | `1000` |  |
| upstream.gitlab.gitlab-exporter.containerSecurityContext.runAsGroup | int | `1000` |  |
| upstream.gitlab.migrations.annotations."sidecar.istio.io/inject" | string | `"true"` |  |
| upstream.gitlab.migrations.init.resources.limits.cpu | string | `"500m"` |  |
| upstream.gitlab.migrations.init.resources.limits.memory | string | `"768Mi"` |  |
| upstream.gitlab.migrations.init.resources.requests.cpu | string | `"500m"` |  |
| upstream.gitlab.migrations.init.resources.requests.memory | string | `"768Mi"` |  |
| upstream.gitlab.migrations.resources.limits.cpu | string | `"500m"` |  |
| upstream.gitlab.migrations.resources.limits.memory | string | `"1.5G"` |  |
| upstream.gitlab.migrations.resources.requests.cpu | string | `"500m"` |  |
| upstream.gitlab.migrations.resources.requests.memory | string | `"1.5G"` |  |
| upstream.gitlab.migrations.image.repository | string | `"registry1.dso.mil/gitlab/gitlab-org/build/cng/gitlab-toolbox-ee"` |  |
| upstream.gitlab.migrations.image.tag | string | `"v19.3.2-ubi"` |  |
| upstream.gitlab.migrations.securityContext.runAsGroup | int | `1000` |  |
| upstream.gitlab.migrations.containerSecurityContext.runAsGroup | int | `1000` |  |
| upstream.gitlab.webservice.extraEnv.GITLAB_PRODUCT_USAGE_DATA_ENABLED | string | `"false"` |  |
| upstream.gitlab.webservice.init.resources.limits.cpu | string | `"200m"` |  |
| upstream.gitlab.webservice.init.resources.limits.memory | string | `"200Mi"` |  |
| upstream.gitlab.webservice.init.resources.requests.cpu | string | `"200m"` |  |
| upstream.gitlab.webservice.init.resources.requests.memory | string | `"200Mi"` |  |
| upstream.gitlab.webservice.securityContext.runAsGroup | int | `1000` |  |
| upstream.gitlab.webservice.containerSecurityContext.runAsGroup | int | `1000` |  |
| upstream.gitlab.webservice.resources.limits.cpu | string | `"1500m"` |  |
| upstream.gitlab.webservice.resources.limits.memory | string | `"3G"` |  |
| upstream.gitlab.webservice.image.repository | string | `"registry1.dso.mil/gitlab/gitlab-org/build/cng/gitlab-webservice-ee"` |  |
| upstream.gitlab.webservice.image.tag | string | `"v19.3.2-ubi"` |  |
| upstream.gitlab.webservice.workhorse.resources.limits.cpu | string | `"600m"` |  |
| upstream.gitlab.webservice.workhorse.resources.limits.memory | string | `"2.5G"` |  |
| upstream.gitlab.webservice.workhorse.resources.requests.cpu | string | `"600m"` |  |
| upstream.gitlab.webservice.workhorse.resources.requests.memory | string | `"2.5G"` |  |
| upstream.gitlab.webservice.workhorse.image | string | `"registry1.dso.mil/gitlab/gitlab-org/build/cng/gitlab-workhorse-ee"` |  |
| upstream.gitlab.webservice.workhorse.tag | string | `"v19.3.2-ubi"` |  |
| upstream.gitlab.webservice.workhorse.metrics.enabled | bool | `true` |  |
| upstream.gitlab.webservice.workhorse.metrics.serviceMonitor.enabled | bool | `true` |  |
| upstream.gitlab.webservice.ingress.enabled | bool | `false` |  |
| upstream.gitlab.webservice.metrics.serviceMonitor.enabled | bool | `true` |  |
| upstream.gitlab.webservice.helmTests.enabled | bool | `false` |  |
| upstream.gitlab.sidekiq.extraEnv.GITLAB_PRODUCT_USAGE_DATA_ENABLED | string | `"false"` |  |
| upstream.gitlab.sidekiq.image.repository | string | `"registry1.dso.mil/gitlab/gitlab-org/build/cng/gitlab-sidekiq-ee"` |  |
| upstream.gitlab.sidekiq.image.tag | string | `"v19.3.2-ubi"` |  |
| upstream.gitlab.sidekiq.init.resources.limits.cpu | string | `"200m"` |  |
| upstream.gitlab.sidekiq.init.resources.limits.memory | string | `"200Mi"` |  |
| upstream.gitlab.sidekiq.init.resources.requests.cpu | string | `"200m"` |  |
| upstream.gitlab.sidekiq.init.resources.requests.memory | string | `"200Mi"` |  |
| upstream.gitlab.sidekiq.resources.requests.memory | string | `"3G"` |  |
| upstream.gitlab.sidekiq.resources.requests.cpu | string | `"1500m"` |  |
| upstream.gitlab.sidekiq.resources.limits.memory | string | `"3G"` |  |
| upstream.gitlab.sidekiq.resources.limits.cpu | string | `"1500m"` |  |
| upstream.gitlab.sidekiq.securityContext.runAsGroup | int | `1000` |  |
| upstream.gitlab.sidekiq.containerSecurityContext.runAsGroup | int | `1000` |  |
| upstream.gitlab.gitaly.image.repository | string | `"registry1.dso.mil/gitlab/gitlab-org/build/cng/gitaly"` |  |
| upstream.gitlab.gitaly.image.tag | string | `"v19.3.2-ubi"` |  |
| upstream.gitlab.gitaly.cgroups.initContainer.image.repository | string | `"registry1.dso.mil/gitlab/gitlab-org/build/cng/gitaly-init-cgroups"` |  |
| upstream.gitlab.gitaly.cgroups.initContainer.image.tag | string | `"v19.3.2-ubi"` |  |
| upstream.gitlab.gitaly.init.resources.limits.cpu | string | `"200m"` |  |
| upstream.gitlab.gitaly.init.resources.limits.memory | string | `"200Mi"` |  |
| upstream.gitlab.gitaly.init.resources.requests.cpu | string | `"200m"` |  |
| upstream.gitlab.gitaly.init.resources.requests.memory | string | `"200Mi"` |  |
| upstream.gitlab.gitaly.resources.requests.cpu | string | `"400m"` |  |
| upstream.gitlab.gitaly.resources.requests.memory | string | `"600Mi"` |  |
| upstream.gitlab.gitaly.resources.limits.cpu | string | `"400m"` |  |
| upstream.gitlab.gitaly.resources.limits.memory | string | `"600Mi"` |  |
| upstream.gitlab.gitaly.metrics.serviceMonitor.enabled | bool | `true` |  |
| upstream.gitlab.gitaly.securityContext.runAsGroup | int | `1000` |  |
| upstream.gitlab.gitaly.containerSecurityContext.runAsGroup | int | `1000` |  |
| upstream.gitlab.geo-logcursor.image.repository | string | `"registry1.dso.mil/gitlab/gitlab-org/build/cng/gitlab-geo-logcursor"` |  |
| upstream.gitlab.geo-logcursor.image.tag | string | `"v19.3.2-ubi"` |  |
| upstream.gitlab.gitlab-shell.image.repository | string | `"registry1.dso.mil/gitlab/gitlab-org/build/cng/gitlab-shell"` |  |
| upstream.gitlab.gitlab-shell.image.tag | string | `"v14.56.1-ubi"` |  |
| upstream.gitlab.gitlab-shell.init.resources.limits.cpu | string | `"200m"` |  |
| upstream.gitlab.gitlab-shell.init.resources.limits.memory | string | `"200Mi"` |  |
| upstream.gitlab.gitlab-shell.init.resources.requests.cpu | string | `"200m"` |  |
| upstream.gitlab.gitlab-shell.init.resources.requests.memory | string | `"200Mi"` |  |
| upstream.gitlab.gitlab-shell.resources.limits.cpu | string | `"300m"` |  |
| upstream.gitlab.gitlab-shell.resources.limits.memory | string | `"300Mi"` |  |
| upstream.gitlab.gitlab-shell.resources.requests.cpu | string | `"300m"` |  |
| upstream.gitlab.gitlab-shell.resources.requests.memory | string | `"300Mi"` |  |
| upstream.gitlab.gitlab-shell.securityContext.runAsGroup | int | `1000` |  |
| upstream.gitlab.gitlab-shell.containerSecurityContext.runAsGroup | int | `1000` |  |
| upstream.gitlab.mailroom.image.repository | string | `"registry1.dso.mil/gitlab/gitlab-org/build/cng/gitlab-mailroom"` |  |
| upstream.gitlab.mailroom.image.tag | string | `"v19.3.2-ubi"` |  |
| upstream.gitlab.mailroom.containerSecurityContext.capabilities.drop[0] | string | `"ALL"` |  |
| upstream.gitlab.gitlab-pages.service.customDomains.type | string | `"ClusterIP"` |  |
| upstream.gitlab.gitlab-pages.image.repository | string | `"registry1.dso.mil/gitlab/gitlab-org/build/cng/gitlab-pages"` |  |
| upstream.gitlab.gitlab-pages.image.tag | string | `"v19.3.2-ubi"` |  |
| upstream.gitlab.kas.ingress.enabled | bool | `false` |  |
| upstream.gitlab.kas.image.repository | string | `"registry1.dso.mil/gitlab/gitlab-org/build/cng/gitlab-kas"` |  |
| upstream.gitlab.kas.image.tag | string | `"v19.3.2-ubi"` |  |
| upstream.gitlab.kas.init.resources.limits.cpu | string | `"200m"` |  |
| upstream.gitlab.kas.init.resources.limits.memory | string | `"200Mi"` |  |
| upstream.gitlab.kas.init.resources.requests.cpu | string | `"200m"` |  |
| upstream.gitlab.kas.init.resources.requests.memory | string | `"200Mi"` |  |
| upstream.gitlab.kas.resources.requests.cpu | int | `1` |  |
| upstream.gitlab.kas.resources.requests.memory | string | `"1Gi"` |  |
| upstream.gitlab.kas.resources.limits.cpu | int | `1` |  |
| upstream.gitlab.kas.resources.limits.memory | string | `"1Gi"` |  |
| upstream.gitlab.praefect.image.repository | string | `"registry1.dso.mil/gitlab/gitlab-org/build/cng/gitaly"` |  |
| upstream.gitlab.praefect.image.tag | string | `"v19.3.2-ubi"` |  |
| upstream.gitlab.praefect.init.resources.limits.cpu | string | `"200m"` |  |
| upstream.gitlab.praefect.init.resources.limits.memory | string | `"200Mi"` |  |
| upstream.gitlab.praefect.init.resources.requests.cpu | string | `"200m"` |  |
| upstream.gitlab.praefect.init.resources.requests.memory | string | `"200Mi"` |  |
| upstream.gitlab.praefect.resources.requests.cpu | int | `1` |  |
| upstream.gitlab.praefect.resources.requests.memory | string | `"1Gi"` |  |
| upstream.gitlab.praefect.resources.limits.cpu | int | `1` |  |
| upstream.gitlab.praefect.resources.limits.memory | string | `"1Gi"` |  |
| domain | string | `"dev.bigbang.mil"` |  |
| bbtests.enabled | bool | `false` | Enable internal Big Bang package tests. This profile and any dependency configuration supplied by tests/test-values*.yaml are unsupported for consumer deployments. |
| bbtests.scripts.image | string | `"registry1.dso.mil/ironbank/big-bang/devops-tester:1.3"` |  |
| bbtests.scripts.additionalVolumes[0].name | string | `"docker-config"` |  |
| bbtests.scripts.additionalVolumes[0].secret.secretName | string | `"private-registry"` |  |
| bbtests.scripts.additionalVolumes[0].secret.items[0].key | string | `".dockerconfigjson"` |  |
| bbtests.scripts.additionalVolumes[0].secret.items[0].path | string | `"auth.json"` |  |
| bbtests.scripts.additionalVolumeMounts[0].name | string | `"docker-config"` |  |
| bbtests.scripts.additionalVolumeMounts[0].mountPath | string | `"/.docker/"` |  |
| bbtests.scripts.envs.GITLAB_USER | string | `"root"` |  |
| bbtests.scripts.envs.GITLAB_EMAIL | string | `"gitlab-root-user@example.com"` |  |
| bbtests.scripts.envs.GITLAB_HOST | string | `"gitlab-webservice-default.gitlab.svc.cluster.local:8181"` |  |
| bbtests.scripts.envs.GITLAB_PROJECT | string | `"bigbang-test-project-2"` |  |
| bbtests.scripts.envs.GITLAB_REGISTRY | string | `"gitlab-registry-test-svc.gitlab.svc.cluster.local:80"` |  |
| bbtests.scripts.envs.GITLAB_REPOSITORY | string | `"http://gitlab-webservice-default.gitlab.svc.cluster.local:8181"` |  |

## Contributing

Please see the [contributing guide](./CONTRIBUTING.md) if you are interested in contributing.

---

_This file is programatically generated using `helm-docs` and some BigBang-specific templates. The `gluon` repository has [instructions for regenerating package READMEs](https://repo1.dso.mil/big-bang/product/packages/gluon/-/blob/master/docs/bb-package-readme.md)._
