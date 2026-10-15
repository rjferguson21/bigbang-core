<!-- Warning: Do not manually edit this file. See notes on gluon + helm-docs at the end of this file for more information. -->
# bigbang-core

![Version: 0.4.0](https://img.shields.io/badge/Version-0.4.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.1.0](https://img.shields.io/badge/AppVersion-0.1.0-informational?style=flat-square) ![Maintenance Track: unknown](https://img.shields.io/badge/Maintenance_Track-unknown-red?style=flat-square)

Flux parent chart for the Big Bang core stack (Istio + Kyverno). Renders one Flux HelmRelease per core package, sequenced with dependsOn.

## Upstream Release Notes

This package has no upstream release note links on file. Please add some to [chart/Chart.yaml](chart/Chart.yaml) under `annotations.bigbang.dev/upstreamReleaseNotesMarkdown`.
Example:
```yaml
annotations:
  bigbang.dev/upstreamReleaseNotesMarkdown: |
    - [Find our upstream chart's CHANGELOG here](https://link-goes-here/CHANGELOG.md)
    - [and our upstream application release notes here](https://another-link-here/RELEASE_NOTES.md)
```

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
helm install bigbang-core chart/
```

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| domain | string | `"dev.bigbang.mil"` |  |
| profile | string | `""` |  |
| groups.policy.enabled | bool | `true` |  |
| groups.observability.enabled | bool | `true` |  |
| istio.ambient.enabled | bool | `true` |  |
| imagePullSecret.copyFromReleaseNamespace | bool | `false` |  |
| imagePullSecret.name | string | `"private-registry"` |  |
| source.kind | string | `"GitRepository"` |  |
| source.name | string | `"bigbang-core"` |  |
| source.namespace | string | `""` |  |
| flux.interval | string | `"1m"` |  |
| flux.timeout | string | `"10m"` |  |
| flux.install.createNamespace | bool | `false` |  |
| flux.install.remediation.retries | int | `-1` |  |
| flux.upgrade.remediation.retries | int | `3` |  |
| flux.upgrade.remediation.remediateLastFailure | bool | `true` |  |
| flux.upgrade.cleanupOnFail | bool | `true` |  |
| flux.rollback.timeout | string | `"10m"` |  |
| flux.rollback.cleanupOnFail | bool | `true` |  |
| packageValues.bigbangPackage.istio.enabled | bool | `true` |  |
| packageValues.bigbangPackage.networkPolicies.enabled | bool | `true` |  |
| packages.bigbang-operator.enabled | bool | `true` |  |
| packages.bigbang-operator.releaseName | string | `"bigbang-operator"` |  |
| packages.bigbang-operator.namespace | string | `"bigbang-operator"` |  |
| packages.bigbang-operator.chart | string | `"core/bigbang-operator/chart"` |  |
| packages.bigbang-operator.wave | int | `0` |  |
| packages.bigbang-operator.values.globalConfig.create | bool | `true` |  |
| packages.bigbang-operator.values.globalConfig.routes.defaults.inbound.gateways[0] | string | `"istio-gateway/public-ingressgateway"` |  |
| packages.bigbang-operator.values.globalConfig.gateways.istio-gateway/public-ingressgateway.podSelector.matchLabels.app | string | `"public-ingressgateway"` |  |
| packages.bigbang-operator.values.globalConfig.gateways.istio-gateway/public-ingressgateway.serviceAccountName | string | `"public-ingressgateway"` |  |
| packages.bigbang-operator.values.globalConfig.egressDefinitions.sso.to[0].ipBlock.cidr | string | `"0.0.0.0/0"` |  |
| packages.bigbang-operator.values.globalConfig.egressDefinitions.storage-subnets.to[0].ipBlock.cidr | string | `"0.0.0.0/0"` |  |
| packages.bigbang-operator.values.globalConfig.egressDefinitions.storage-subnets.ports[0].port | int | `443` |  |
| packages.bigbang-operator.values.globalConfig.egressDefinitions.storage-subnets.ports[0].protocol | string | `"TCP"` |  |
| packages.bigbang-operator.values.globalConfig.egressDefinitions.redis-subnets.to[0].ipBlock.cidr | string | `"192.168.0.0/16"` |  |
| packages.bigbang-operator.values.globalConfig.egressDefinitions.redis-subnets.to[1].ipBlock.cidr | string | `"172.16.0.0/12"` |  |
| packages.bigbang-operator.values.globalConfig.egressDefinitions.redis-subnets.to[2].ipBlock.cidr | string | `"10.0.0.0/8"` |  |
| packages.bigbang-operator.values.globalConfig.egressDefinitions.redis-subnets.ports[0].port | int | `6379` |  |
| packages.bigbang-operator.values.globalConfig.egressDefinitions.redis-subnets.ports[0].protocol | string | `"TCP"` |  |
| packages.bigbang-operator.values.globalConfig.egressDefinitions.database-subnets.to[0].ipBlock.cidr | string | `"192.168.0.0/16"` |  |
| packages.bigbang-operator.values.globalConfig.egressDefinitions.database-subnets.to[1].ipBlock.cidr | string | `"172.16.0.0/12"` |  |
| packages.bigbang-operator.values.globalConfig.egressDefinitions.database-subnets.to[2].ipBlock.cidr | string | `"10.0.0.0/8"` |  |
| packages.bigbang-operator.values.globalConfig.egressDefinitions.database-subnets.ports[0].port | int | `5432` |  |
| packages.bigbang-operator.values.globalConfig.egressDefinitions.database-subnets.ports[0].protocol | string | `"TCP"` |  |
| packages.bigbang-operator.values.globalConfig.ingressDefinitions.load-balancer-subnets.from[0].ipBlock.cidr | string | `"192.168.0.0/16"` |  |
| packages.bigbang-operator.values.globalConfig.ingressDefinitions.load-balancer-subnets.from[1].ipBlock.cidr | string | `"172.16.0.0/12"` |  |
| packages.bigbang-operator.values.globalConfig.ingressDefinitions.load-balancer-subnets.from[2].ipBlock.cidr | string | `"10.0.0.0/8"` |  |
| packages.prometheus-operator-crds.enabled | bool | `true` |  |
| packages.prometheus-operator-crds.releaseName | string | `"prometheus-operator-crds"` |  |
| packages.prometheus-operator-crds.namespace | string | `"monitoring"` |  |
| packages.prometheus-operator-crds.chart | string | `"core/prometheus-operator-crds/chart"` |  |
| packages.prometheus-operator-crds.wave | int | `0` |  |
| packages.istio-crds.enabled | bool | `true` |  |
| packages.istio-crds.releaseName | string | `"istio-crds"` |  |
| packages.istio-crds.namespace | string | `"istio-system"` |  |
| packages.istio-crds.chart | string | `"core/istio-crds/chart"` |  |
| packages.istio-crds.wave | int | `0` |  |
| packages.istiod.enabled | bool | `true` |  |
| packages.istiod.releaseName | string | `"istiod"` |  |
| packages.istiod.namespace | string | `"istio-system"` |  |
| packages.istiod.chart | string | `"core/istiod/chart"` |  |
| packages.istiod.wave | int | `1` |  |
| packages.istio-gateway.enabled | bool | `true` |  |
| packages.istio-gateway.releaseName | string | `"public-ingressgateway"` |  |
| packages.istio-gateway.namespace | string | `"istio-gateway"` |  |
| packages.istio-gateway.chart | string | `"core/istio-gateway/chart"` |  |
| packages.istio-gateway.wave | int | `2` |  |
| packages.istio-gateway.namespaceLabels.istio-injection | string | `"enabled"` |  |
| packages.istio-gateway.values.upstream.service.annotations."metallb.io/loadBalancerIPs" | string | `"172.28.0.3"` |  |
| packages.istio-cni.enabled | bool | `true` |  |
| packages.istio-cni.requiresAmbient | bool | `true` |  |
| packages.istio-cni.releaseName | string | `"istio-cni"` |  |
| packages.istio-cni.namespace | string | `"istio-system"` |  |
| packages.istio-cni.chart | string | `"core/istio-cni/chart"` |  |
| packages.istio-cni.wave | int | `1` |  |
| packages.istio-cni.values.upstream.cniConfDir | string | `"/var/lib/rancher/k3s/agent/etc/cni/net.d"` |  |
| packages.istio-cni.values.upstream.cniBinDir | string | `"/var/lib/rancher/k3s/data/cni"` |  |
| packages.ztunnel.enabled | bool | `true` |  |
| packages.ztunnel.requiresAmbient | bool | `true` |  |
| packages.ztunnel.releaseName | string | `"ztunnel"` |  |
| packages.ztunnel.namespace | string | `"istio-system"` |  |
| packages.ztunnel.chart | string | `"core/ztunnel/chart"` |  |
| packages.ztunnel.wave | int | `1` |  |
| packages.kyverno.enabled | bool | `true` |  |
| packages.kyverno.releaseName | string | `"kyverno-kyverno"` |  |
| packages.kyverno.namespace | string | `"kyverno"` |  |
| packages.kyverno.group | string | `"policy"` |  |
| packages.kyverno.chart | string | `"core/kyverno/chart"` |  |
| packages.kyverno.wave | int | `1` |  |
| packages.kyverno-policies.enabled | bool | `true` |  |
| packages.kyverno-policies.releaseName | string | `"kyverno-kyverno-policies"` |  |
| packages.kyverno-policies.namespace | string | `"kyverno"` |  |
| packages.kyverno-policies.group | string | `"policy"` |  |
| packages.kyverno-policies.chart | string | `"core/kyverno-policies/chart"` |  |
| packages.kyverno-policies.wave | int | `2` |  |
| packages.kyverno-policies.values.policies.restrict-host-path-mount-pv.parameters.allow[0] | string | `"/var/lib/rancher/k3s/storage/pvc-*"` |  |
| packages.kyverno-policies.values.exclude.any[0].resources.namespaces[0] | string | `"kube-system"` |  |
| packages.kyverno-policies.values.exclude.any[1].resources.namespaces[0] | string | `"istio-system"` |  |
| packages.kyverno-policies.values.exclude.any[1].resources.selector.matchLabels."app.kubernetes.io/name" | string | `"istio-cni"` |  |
| packages.kyverno-policies.values.exclude.any[2].resources.namespaces[0] | string | `"istio-system"` |  |
| packages.kyverno-policies.values.exclude.any[2].resources.selector.matchLabels."app.kubernetes.io/name" | string | `"ztunnel"` |  |
| packages.monitoring.enabled | bool | `true` |  |
| packages.monitoring.releaseName | string | `"monitoring-monitoring"` |  |
| packages.monitoring.namespace | string | `"monitoring"` |  |
| packages.monitoring.group | string | `"observability"` |  |
| packages.monitoring.chart | string | `"core/monitoring/chart"` |  |
| packages.monitoring.wave | int | `3` |  |
| packages.monitoring.meshInjection | bool | `true` |  |
| packages.loki.enabled | bool | `true` |  |
| packages.loki.releaseName | string | `"logging"` |  |
| packages.loki.namespace | string | `"logging"` |  |
| packages.loki.group | string | `"observability"` |  |
| packages.loki.chart | string | `"core/loki/chart"` |  |
| packages.loki.wave | int | `3` |  |
| packages.loki.meshInjection | bool | `true` |  |
| packages.grafana.enabled | bool | `true` |  |
| packages.grafana.releaseName | string | `"monitoring-grafana"` |  |
| packages.grafana.namespace | string | `"monitoring"` |  |
| packages.grafana.group | string | `"observability"` |  |
| packages.grafana.chart | string | `"core/grafana/chart"` |  |
| packages.grafana.wave | int | `3` |  |
| packages.grafana.values.upstream.datasources."datasources.yaml".apiVersion | int | `1` |  |
| packages.grafana.values.upstream.datasources."datasources.yaml".datasources[0].name | string | `"Prometheus"` |  |
| packages.grafana.values.upstream.datasources."datasources.yaml".datasources[0].type | string | `"prometheus"` |  |
| packages.grafana.values.upstream.datasources."datasources.yaml".datasources[0].url | string | `"http://monitoring-monitoring-kube-prometheus.monitoring.svc.cluster.local:9090"` |  |
| packages.grafana.values.upstream.datasources."datasources.yaml".datasources[0].access | string | `"proxy"` |  |
| packages.grafana.values.upstream.datasources."datasources.yaml".datasources[0].isDefault | bool | `true` |  |
| packages.alloy.enabled | bool | `true` |  |
| packages.alloy.releaseName | string | `"alloy"` |  |
| packages.alloy.namespace | string | `"alloy"` |  |
| packages.alloy.group | string | `"observability"` |  |
| packages.alloy.chart | string | `"core/alloy/chart"` |  |
| packages.alloy.wave | int | `3` |  |
| packages.alloy.meshInjection | bool | `true` |  |
| packages.alloy.values.upstream.destinations.loki.type | string | `"loki"` |  |
| packages.alloy.values.upstream.destinations.loki.url | string | `"http://logging-loki.logging.svc.cluster.local:3100/loki/api/v1/push"` |  |
| packages.alloy.values.upstream.collectors.alloy-logs.enabled | bool | `true` |  |
| packages.alloy.values.upstream.collectors.alloy-logs.presets[0] | string | `"daemonset"` |  |
| packages.alloy.values.upstream.collectors.alloy-logs.presets[1] | string | `"filesystem-log-reader"` |  |
| packages.alloy.values.upstream.collectors.alloy-logs.global.podSecurityContext.fsGroup | int | `0` |  |
| packages.alloy.values.upstream.podLogsViaLoki.enabled | bool | `true` |  |
| packages.alloy.values.upstream.podLogsViaLoki.destinations[0] | string | `"loki"` |  |
| packages.alloy.values.serviceMonitors[0].name | string | `"alloy-logs"` |  |
| packages.alloy.values.serviceMonitors[0].selectorLabels."app.kubernetes.io/name" | string | `"alloy-logs"` |  |

## Contributing

Please see the [contributing guide](./CONTRIBUTING.md) if you are interested in contributing.

---

_This file is programatically generated using `helm-docs` and some BigBang-specific templates. The `gluon` repository has [instructions for regenerating package READMEs](https://repo1.dso.mil/big-bang/product/packages/gluon/-/blob/master/docs/bb-package-readme.md)._
