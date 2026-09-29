# core

The Istio, Kyverno, and observability packages that form the Big Bang core,
plus an Argo CD app-of-apps that deploys them. Everything else lives in
[`../packages`](../packages).

```
core/
  Chart.yaml  values.yaml  templates/   # app-of-apps chart: renders Argo CD Applications
  app-of-apps.yaml                       # parent Application that sources the chart
  istio-crds/        # Istio CRDs (installed first)
  istiod/            # Istio control plane
  istio-gateway/     # ingress gateway
  kyverno/           # policy engine
  kyverno-reporter/  # policy reporter
  monitoring/        # kube-prometheus-stack
  loki/              # logs backend
  grafana/           # dashboards (Prometheus datasource)
  alloy/             # log/metrics collectors -> loki
```

## Argo CD deployment (the `core` app-of-apps)

`core/` is a Helm chart that renders one Argo CD `Application` per core
package, each pulling its chart by path (`core/<pkg>/chart`) from
`repoURL`. It carries no workloads of its own — it just hands the packages
to Argo CD.

The set is driven by `.Values.packages` (one entry per Application, with
`enabled`, `releaseName`, `namespace`, `chart`, `syncWave`, and optional
per-package `values`). `.Values.packageValues` is merged into every
Application's Helm values (plus `domain`).

**Sequencing** uses Argo CD sync waves. `app-of-apps.yaml` is the parent
Application that sources this chart; during its sync Argo CD applies the child
Applications in wave order, waiting for each wave to go Healthy before the
next:

- wave 0: `istio-crds` (Istio CRDs, before anything that uses them)
- wave 1: `istiod`, `kyverno`
- wave 2: `istio-gateway` (after istiod), `kyverno-reporter` (after kyverno), `monitoring`, `loki`
- wave 3: `grafana` (after monitoring's Prometheus datasource), `alloy` (after loki + monitoring)

`istio-crds` is a member of the app-of-apps (wave 0). `kyverno-reporter`
additionally needs the prometheus-operator CRDs, installed by the `core:crds`
task (the umbrella ships them as a separate chart).

`repoURL` is required and must be reachable/registered by Argo CD. Deploy via
the Taskfile (installs Argo CD if absent, then applies the parent app):

```bash
REPO_URL=https://repo1.dso.mil/…/bigbang-core.git TARGET_REVISION=main task core:deploy
```

To apply the parent by hand, substitute the vars and apply:

```bash
REPO_URL=… TARGET_REVISION=main ARGOCD_NAMESPACE=argocd \
  envsubst < core/app-of-apps.yaml | kubectl apply -f -
```

Disable a package with `--set packages.kyverno-reporter.enabled=false` (via the
parent Application's `helm.valuesObject`).

## Direct-helm deployment (no remote)

The dogfood cluster has no reachable git remote, so the local `up` flow uses
`core:deploy:helm`, which installs the four charts with `helm` in dependency
order. Prefer `core:deploy` (Flux) once `GIT_URL` points at a reachable clone.

Both paths require the bigbang-operator to be running (`operator:deploy`) so the
`Package` CRs each chart emits get reconciled.
