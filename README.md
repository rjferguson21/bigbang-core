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

```bash
# Just the cluster (no core) — MetalLB + Flux, nothing else.
# Add UPSTREAM_IMAGES=true if you don't have Iron Bank (registry1) creds.
task cluster:recreate UPSTREAM_IMAGES=true

# Cluster + core stack. Two common recipes:

# a) With Iron Bank creds (REGISTRY1_USERNAME / REGISTRY1_PASSWORD set) — full core:
task cluster:recreate
task core:deploy

# b) No creds — minimal core (operator, CRDs, Istio) on public images, fast:
task cluster:recreate UPSTREAM_IMAGES=true
task core:deploy CORE_VALUES=dev/values/core-minimal.yaml,dev/values/upstream-images.yaml

task status      # operator pods + Package CRs
task down        # delete the cluster
```

`task` on its own does the whole thing (recreate → core → all packages).

## Repo layout

```
core/              # Flux parent chart + the core packages (operator, Istio, Kyverno, observability)
packages/          # app packages (keycloak, gitlab, kiali, logging, security tools, …)
dev/values/        # overlays for the dev/CI clusters (core-minimal, upstream-images, per-package tweaks)
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
