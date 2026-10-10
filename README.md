# bigbang-core

A Big Bang built on the [bigbang-operator](https://repo1.dso.mil/big-bang/product/packages/bigbang-operator)
instead of `bb-common`. Each package chart wraps its upstream chart and emits a
`bigbang.dev/v1alpha1 Package` custom resource; the operator reconciles that CR
into the Istio and NetworkPolicy resources Big Bang would otherwise render at
template time. The core stack is deployed by Flux from this repo; the app
packages are deployed with Helm on top of it.

```
core/              # Flux parent chart + the core packages (operator, Istio, Kyverno, observability)
packages/          # app packages (keycloak, gitlab, kiali, logging, security tools, …)
dev/values/        # overlays for the dev/CI clusters (core-minimal, upstream-images, per-package tweaks)
playwright-tests/  # shared end-to-end suite, run against a deployed cluster
Taskfile.yml       # dev harness: k3d cluster, core via Flux, packages via helm
.github/workflows/ # CI: k3d cluster + core-minimal on upstream images
deps.md            # the umbrella's HelmRelease dependency graph, for reference
```

## How it fits together

- **[`core/`](core/README.md)** is a Helm chart that renders one Flux
  `HelmRelease` per core package, sequenced by `wave` (operator and CRDs
  first, then istiod and kyverno, then the gateway and policies, then
  monitoring, loki, grafana and alloy). `core/bigbang-core.yaml` holds the
  `GitRepository` and the parent `HelmRelease` that sources the chart.
- **`packages/`** holds one wrapper chart per app. Every chart carries a
  `bigbangPackage` values block (istio, networkPolicies, routes, in the
  bb-common shapes) that becomes the Package CR, and an `upstream` block
  passed to the vendored upstream chart. Each package has its own README.
- **The operator** (`core/bigbang-operator`, wave 0) must be running before
  anything else, since every chart in both trees emits a Package CR.

## Prerequisites

docker, [k3d](https://k3d.io), [Task](https://taskfile.dev), helm, kubectl,
[yq](https://github.com/mikefarah/yq) (v4), envsubst and rsync. For the
default dev profile you also need Iron Bank credentials in
`REGISTRY1_USERNAME` / `REGISTRY1_PASSWORD`; the k3d cluster runs a
registry1 pull-through cache seeded with them.

## Dev workflow

```bash
task                       # full stack: recreate the cluster, deploy core via Flux, then all packages
task cluster:recreate      # just the k3d cluster (MetalLB + Flux bootstrapped by the bb-k3d chart)
task core:deploy           # core via Flux, sourced from a local gitea seeded with the working tree
task packages:deploy       # app packages via helm (core must be up)
task status                # operator pods + Package CRs
task down                  # delete the cluster
```

`core:deploy` needs a git URL the cluster can reach. With no `REPO_URL` it
stands up a gitea container on the k3d network, pushes a snapshot of the
working tree, and points Flux at that. Pass `REPO_URL=<git url>`
(and `TARGET_REVISION=<branch>`) to use a real remote instead.

Deploy a single package with
`task package:deploy PKG=kiali RELEASE=kiali NS=kiali`; gitlab has its own
`task gitlab:deploy`, which first brings up its external postgres, object
storage and valkey from the pipeline-templates dependency stack.

### Profiles

Overlays for the core chart go in `CORE_VALUES`, one file or a
comma-separated list merged in order:

- `dev/values/core-minimal.yaml`: only the operator, the CRD charts and
  Istio, for testing one package at a time.
- `dev/values/upstream-images.yaml`: public images instead of Iron Bank
  ones, for clusters without registry1 credentials. Currently it covers
  the core-minimal set; Istio pulls from `mirror.gcr.io/istio`, Google's
  public cache of Docker Hub, which avoids Docker Hub's anonymous pull
  limits.

```bash
task core:deploy CORE_VALUES=dev/values/core-minimal.yaml
task package:deploy PKG=<name> RELEASE=<release> NS=<ns>
```

`UPSTREAM_IMAGES=true` on `cluster:recreate` drops the registry1
requirement and renders the cluster with the bb-k3d chart's public-image
values; on `package:deploy` it adds `dev/values/upstream/<PKG>.yaml` when
one exists (kiali so far).

## CI

`.github/workflows/ci.yaml` runs on pushes to main and on pull requests. It
runs `task ci`, which recreates a k3d cluster with `UPSTREAM_IMAGES=true`,
deploys core with the core-minimal and upstream-images overlays from the
local gitea, waits for every HelmRelease to report Ready, then deploys the
kiali package with its `dev/values/upstream/kiali.yaml` overlay. It then
installs the Playwright suite and runs `tests/kiali.spec.ts` against the
cluster (the gateway's `*.dev.bigbang.mil` cert is downloaded from the
umbrella repo when no local checkout is present). Traces are uploaded on
failure.

The workflow prints nodes, HelmReleases, Packages and pods on every run, and
pod descriptions, logs, warning events and Flux controller logs on failure.

## End-to-end tests

[`playwright-tests/`](playwright-tests/README.md) is a shared Playwright
suite that replaces the per-package cypress tests. It runs against an
already-deployed cluster and discovers the gateway IPs and passwords from
the current kubectl context:

```bash
cd playwright-tests && npm ci && npx playwright install chromium
npx playwright test                       # everything, against dev.bigbang.mil
npx playwright test tests/keycloak.spec.ts
```

## Packages

| Package | Upstream |
|---|---|
| eck-operator | Elastic Cloud on Kubernetes operator |
| elasticsearch-kibana | Elasticsearch and Kibana via ECK |
| fluentbit | Fluent Bit log forwarder |
| gitlab | GitLab (external postgres, object storage and redis in dev) |
| keycloak | Keycloak identity provider |
| kiali | Kiali service mesh observability |
| neuvector | NeuVector container security |
| tempo | Grafana Tempo tracing |
| twistlock | Prisma Cloud Compute |

Core packages (under `core/`): bigbang-operator, prometheus-operator-crds,
istio-crds, istiod, istio-gateway, kyverno, kyverno-policies,
kyverno-reporter, monitoring, loki, grafana, alloy.
