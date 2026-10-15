# bigbang-core

A Big Bang built on the [bigbang-operator](https://repo1.dso.mil/big-bang/product/packages/bigbang-operator)
instead of `bb-common`. Each package chart wraps its upstream chart and emits a
`bigbang.dev/v1alpha1 Package` custom resource; the operator reconciles that CR
into the Istio and NetworkPolicy resources Big Bang would otherwise render at
template time. The core stack is deployed by Flux from this repo; the app
packages are deployed with Helm on top of it.

## Quick start

Spin up a throwaway test cluster (k3d, with MetalLB + Flux bootstrapped) and
deploy the core stack. Needs docker, [k3d](https://k3d.io),
[Task](https://taskfile.dev), helm, kubectl, [yq](https://github.com/mikefarah/yq) (v4),
envsubst and rsync (see [Prerequisites](#prerequisites)).

One task creates the cluster and deploys the core stack (no app packages):

```bash
# With Iron Bank creds (REGISTRY1_USERNAME / REGISTRY1_PASSWORD set):
task core:up

# No creds — minimal core (operator, CRDs, Istio) on public images, fast:
task core:up UPSTREAM_IMAGES=true PROFILE=minimal CORE_VALUES=dev/values/upstream-images.yaml

task status      # operator pods + Package CRs
task down        # delete the cluster
```

Other entry points:

```bash
task cluster:recreate      # just the k3d cluster (MetalLB + Flux, no core); add UPSTREAM_IMAGES=true without creds
task                       # the whole thing: cluster → core → all app packages
```

## Repo layout

```
core/              # Flux parent chart + the core packages (operator, Istio, Kyverno, observability)
packages/          # app packages (keycloak, gitlab, kiali, logging, security tools, …)
dev/values/        # overlays for the dev/CI clusters (upstream-images, per-package tweaks)
tests/             # shared end-to-end suite, run against a deployed cluster
docs/              # project documentation (published to GitHub Pages)
Taskfile.yml       # dev harness: k3d cluster, core via Flux, packages via helm
.github/workflows/ # CI: k3d cluster + core on upstream images; Pages publish
deps.md            # the umbrella's HelmRelease dependency graph, for reference
```

## Prerequisites

docker, [k3d](https://k3d.io), [Task](https://taskfile.dev), helm, kubectl,
[yq](https://github.com/mikefarah/yq) (v4), envsubst and rsync. For the
default dev profile you also need Iron Bank credentials in
`REGISTRY1_USERNAME` / `REGISTRY1_PASSWORD`; the k3d cluster runs a
registry1 pull-through cache seeded with them. Without them, pass
`UPSTREAM_IMAGES=true` and use the `dev/values/upstream-images.yaml` overlay.

## Documentation

Full docs live in [`docs/`](docs/) (published to GitHub Pages):

- [Architecture](docs/architecture.md) — how the operator, core chart and packages fit together
- [Dev workflow](docs/dev-workflow.md) — the Taskfile harness, cluster lifecycle and profiles
- [CI](docs/ci.md) — what the GitHub Actions pipeline does
- [Testing](docs/testing.md) — the shared Playwright end-to-end suite
- [Packages](docs/packages.md) — the app and core package list
