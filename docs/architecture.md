# Architecture

## How it fits together

- **[`core/`](https://github.com/rjferguson21/bigbang-core/blob/main/core/README.md)** is a Helm chart that renders one Flux
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

## Repo layout

```
core/              # Flux parent chart + the core packages (operator, Istio, Kyverno, observability)
packages/          # app packages (keycloak, gitlab, kiali, logging, security tools, …)
dev/values/        # overlays for the dev/CI clusters (upstream-images, per-package tweaks)
tests/             # shared end-to-end suite, run against a deployed cluster
Taskfile.yml       # dev harness: k3d cluster, core via Flux, packages via helm
.github/workflows/ # CI: k3d cluster + minimal profile on upstream images
deps.md            # the umbrella's HelmRelease dependency graph, for reference
```

## Ambient mode

Istio ambient is the default mesh mode (`istio.ambient.enabled: true`): the
`istio-cni` and `ztunnel` packages deploy, istiod runs with ambient/HBONE,
`istio.ambient.enabled` is set on every Package CR (so the operator generates
HBONE-aware policies and drops the sidecar resources), and mesh namespaces are
labeled `istio.io/dataplane-mode=ambient` instead of `istio-injection=enabled`.

Set `istio.ambient.enabled: false` for classic sidecar mode (istiod injects an
istio-proxy sidecar into mesh pods; `istio-cni`/`ztunnel` are not deployed).
