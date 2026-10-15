# Dev workflow

```bash
task                       # full stack: recreate the cluster, deploy core via Flux, then all packages
task core:up               # cluster + core only (no app packages); UPSTREAM_IMAGES/CORE_VALUES pass through
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

## Profiles

The core chart ships named profiles in `core/profiles/<name>.yaml`, selected with
`PROFILE=` (or `--set profile=<name>`); the chart reads them via `.Files.Get` and
merges them over your values (the profile wins on the keys it sets; keys it
doesn't touch stay customizable):

- `minimal` — only the operator, the CRD charts and Istio, for testing one package at a time.

```bash
task core:up PROFILE=minimal
```

Istio **ambient** is the default mesh mode (`istio.ambient.enabled: true`), so it
isn't a profile — it's always on unless you set `istio.ambient.enabled=false` for
sidecar mode. See [architecture.md](architecture.md#ambient-mode).

## Package groups

Packages are tagged into groups you can toggle together; a package renders only
when its own `enabled` is true **and** its group isn't disabled. Groups
(default on):

- `policy` — kyverno, kyverno-policies
- `observability` — monitoring, grafana, loki, alloy

(The operator, CRDs and Istio are ungrouped/foundational.) Toggle a group via a
`CORE_VALUES` overlay or `--set`, e.g. drop the observability stack:

```bash
helm template core ./core --set groups.observability.enabled=false
```

Groups are the primitive profiles build on: the `minimal` profile is just
`groups.policy.enabled=false` + `groups.observability.enabled=false`.

## Value overlays

Ad-hoc overlays for the core chart go in `CORE_VALUES`, one file or a
comma-separated list merged in order (composable with `PROFILE=`):

- `dev/values/upstream-images.yaml`: public images instead of Iron Bank
  ones, for clusters without registry1 credentials. It covers the `minimal`
  profile's set plus the ambient data plane (istio-cni, ztunnel); Istio
  pulls from `mirror.gcr.io/istio`, Google's public cache of Docker Hub,
  which avoids Docker Hub's anonymous pull limits.

For a cut-down stack (just the operator, the CRD charts and Istio, for testing
one package at a time) use the `minimal` profile:

```bash
task core:deploy PROFILE=minimal
task package:deploy PKG=<name> RELEASE=<release> NS=<ns>
```

`UPSTREAM_IMAGES=true` on `cluster:recreate` drops the registry1
requirement and renders the cluster with the bb-k3d chart's public-image
values; on `package:deploy` it adds `dev/values/upstream/<PKG>.yaml` when
one exists (kiali so far).
