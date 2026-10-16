<!-- Warning: Do not manually edit this file. See notes on gluon + helm-docs at the end of this file for more information. -->
# kyverno-reporter

![Version: 3.7.3-bb.4](https://img.shields.io/badge/Version-3.7.3--bb.4-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 3.7.3](https://img.shields.io/badge/AppVersion-3.7.3-informational?style=flat-square) ![Maintenance Track: bb_integrated](https://img.shields.io/badge/Maintenance_Track-bb_integrated-green?style=flat-square)

Policy Reporter watches for PolicyReport Resources.
It creates Prometheus Metrics and can send rule validation events to different targets like Loki, Elasticsearch, Slack or Discord
This variant delegates Istio and NetworkPolicy configuration to the Big Bang operator via a Package CR instead of bb-common.

## Upstream References

- <https://kyverno.github.io/policy-reporter>
- <https://github.com/kyverno/policy-reporter>

## Upstream Release Notes

- [Find our upstream chart's CHANGELOG here](https://github.com/kyverno/policy-reporter/blob/main/CHANGELOG.md)
- [and our upstream application release notes here](https://github.com/kyverno/kyverno/releases)

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
helm install kyverno-reporter chart/
```

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| domain | string | `"dev.bigbang.mil"` | domain to use for virtual service |
| global.fullnameOverride | string | `"kyverno-reporter"` |  |
| global.labels | object | `{}` |  |
| bigbangPackage.enabled | bool | `true` |  |
| bigbangPackage.labels | object | `{}` |  |
| bigbangPackage.annotations | object | `{}` |  |
| bigbangPackage.istio.enabled | bool | `false` |  |
| bigbangPackage.istio.authorizationPolicies.enabled | bool | `true` |  |
| bigbangPackage.istio.authorizationPolicies.generateFromNetpol | bool | `true` |  |
| bigbangPackage.routes.inbound.policy-reporter-ui.enabled | bool | `true` |  |
| bigbangPackage.routes.inbound.policy-reporter-ui.hosts[0] | string | `"policyreporter.dev.bigbang.mil"` |  |
| bigbangPackage.routes.inbound.policy-reporter-ui.service | string | `"policy-reporter-ui.kyverno-reporter.svc.cluster.local"` |  |
| bigbangPackage.routes.inbound.policy-reporter-ui.port | int | `8080` |  |
| bigbangPackage.networkPolicies.enabled | bool | `false` |  |
| bigbangPackage.networkPolicies.egress.from.kyverno-reporter.podSelector.matchLabels."app.kubernetes.io/instance" | string | `"kyverno-reporter-kyverno-reporter"` |  |
| bigbangPackage.networkPolicies.egress.from.kyverno-reporter.to.definition.kubeAPI | bool | `true` |  |
| bigbangPackage.networkPolicies.ingress.to.policy-reporter:8080.from.k8s.monitoring-monitoring-kube-prometheus@monitoring/prometheus | bool | `false` |  |
| bbtests.enabled | bool | `false` |  |
| bbtests.scripts.image | string | `"registry1.dso.mil/ironbank/opensource/kubernetes/kubectl:v1.34.6"` |  |
| bbtests.scripts.envs.KYVERNO_REPORTER_URL | string | `"http://policy-reporter.kyverno-reporter.svc:8080"` |  |
| bbtests.volumes | list | `[]` |  |
| upstream | object | Upstream chart values | Values to pass to [the upstream kyverno chart](https://github.com/kyverno/policy-reporter/blob/main/charts/policy-reporter/values.yaml) |
| upstream.monitoring.enabled | bool | `true` | Enables the Prometheus Operator integration |

## Contributing

Please see the [contributing guide](./CONTRIBUTING.md) if you are interested in contributing.

---

_This file is programatically generated using `helm-docs` and some BigBang-specific templates. The `gluon` repository has [instructions for regenerating package READMEs](https://repo1.dso.mil/big-bang/product/packages/gluon/-/blob/master/docs/bb-package-readme.md)._
