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
- **The operator** (published OCI chart, wave 0) must be running before
  anything else, since every chart in both trees emits a Package CR. Core renders
  an `OCIRepository` for the pinned chart and a HelmRelease with `chartRef`;
  the published chart installs the operator and its CRD. Configure the URL and
  tag through `packages.bigbang-operator.oci` and deployment settings through
  `.values`. Other packages continue using local `chart` paths. The Zarf bundle
  includes the operator chart as an OCI artifact alongside its image, so its
  agent can redirect the OCIRepository to the bundled registry.

## Repo layout

```
core/              # Flux parent chart + local core packages (Istio, Kyverno, observability)
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

## Shared ingress configuration

The operator global ConfigMap defines the default public ingress gateway and
its pod selector and ServiceAccount identity. Configure these under
`packages.bigbang-operator.values.globalConfig.routes` and `.gateways` in
`core/values.yaml`. Monitoring, Grafana, Loki, and Policy Reporter inherit the
gateway list; route-specific `gateways` and Package
`routes.defaults.inbound.gateways` override the shared default. Standalone
installs of these charts need one of those defaults or an explicit route list.
Gateway definitions also apply to packages that retain explicit gateway lists.
Egress gateway configuration is not enabled.

## Helm hook networking

Monitoring renders NetworkPolicy hooks for its admission create/patch Jobs and
metrics-upgrade Job. Twistlock renders one for its volume-upgrade Job. Each
policy selects only its Job pods in the release and runs before the Job using
a lower hook weight. The charts render their regular Package CR directly;
Job policies do not depend on the operator Helm library or cleanup markers.

Policies follow the Job enablement settings and require both
`bigbangPackage.enabled` and `bigbangPackage.networkPolicies.enabled`.
`hookNetworkPolicies.egress` in each chart supplies the egress rules: private
API endpoints on TCP 443/6443, cluster DNS on UDP/TCP 53, and istiod on TCP 15012.
Override this list for other API addresses/ports, NodeLocal DNS, or a different
mesh control-plane location. These rules render offline and are independent
of the operator's global network definitions.

Policies use `before-hook-creation` so Helm replaces them at the next matching
hook execution. They remain after the Jobs finish and may remain after
uninstall or disabling the Jobs; remove them manually when retiring the
release. Their selectors restrict access to the corresponding hook pods.
