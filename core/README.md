# core

The Istio, Kyverno, and observability packages that form the Big Bang core,
plus a Flux parent chart that deploys them. Everything else lives in
[`../packages`](../packages).

```
core/
  Chart.yaml  values.yaml  templates/   # parent chart: renders Flux HelmReleases
  bigbang-core.yaml                     # GitRepository + parent HelmRelease that sources the chart
  istio-crds/        # Istio CRDs (installed first)
  istiod/            # Istio control plane
  istio-gateway/     # ingress gateway
  kyverno/           # policy engine
  kyverno-policies/  # Big Bang security policies
  kyverno-reporter/  # policy reporter
  monitoring/        # kube-prometheus-stack
  loki/              # logs backend
  grafana/           # dashboards (Prometheus datasource)
  alloy/             # log/metrics collectors -> loki
```

## Flux deployment (the `core` parent chart)

`core/` is a Helm chart that renders one Flux `HelmRelease` per core package,
each pulling its chart by path (`core/<pkg>/chart`) from the `bigbang-core`
`GitRepository`. It carries no workloads of its own — it just hands the
packages to helm-controller.

The set is driven by `.Values.packages` (one entry per HelmRelease, with
`enabled`, `releaseName`, `namespace`, `chart`, `wave`, and optional
per-package `values`). `.Values.packageValues` is merged into every
HelmRelease's Helm values (plus `domain`), and `.Values.flux` (interval,
timeout, remediation) is merged into every HelmRelease spec.

**Sequencing** uses Flux `dependsOn`, derived from `wave`: each package
depends on every enabled package in a lower wave, so a wave starts only once
the previous waves' releases are Ready (helm-controller installs with wait, so
Ready implies the workloads came up):

- wave 0: `bigbang-operator`, `prometheus-operator-crds`, `istio-crds`
- wave 1: `istiod`, `kyverno`
- wave 2: `istio-gateway` (needs istiod's injector), `kyverno-policies`, `kyverno-reporter`
- wave 3: `monitoring`, `loki`, `grafana`, `alloy`

`bigbang-core.yaml` holds the `GitRepository` for this repo and the parent
`HelmRelease` that sources this chart. The repo URL must be reachable from the
cluster. Deploy via the Taskfile (installs Flux if absent, then applies the
parent):

```bash
REPO_URL=https://repo1.dso.mil/…/bigbang-core.git TARGET_REVISION=main task core:deploy
```

To apply the parent by hand, substitute the vars and apply:

```bash
REPO_URL=… TARGET_REVISION=main FLUX_NAMESPACE=flux-system \
  envsubst < core/bigbang-core.yaml | kubectl apply -f -
```

Disable a package with `packages.kyverno-reporter.enabled=false` (via the
parent HelmRelease's `spec.values`).

All paths require the bigbang-operator (wave 0) so the `Package` CRs each
chart emits get reconciled.
