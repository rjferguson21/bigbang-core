# Airgap (Zarf) — prototype

A [Zarf](https://zarf.dev) package that installs **bigbang-core, minimal profile**
(operator + CRDs + Istio) into an airgapped cluster. Zarf mirrors this repo into
the in-cluster git and the core images into the in-cluster registry, and its
admission agent rewrites the Flux `GitRepository` and pod image references
automatically — so no manual hub-rewrite overlay or pull secret is needed.

## Prerequisites (in the airgap)
- A Zarf-initialised cluster (`zarf init` — provides the in-cluster registry, gitea, and agent).
- **Flux** (`helm-controller` + `source-controller`) already installed — deploy it first via its own Zarf package/init. bigbang-core's parent chart emits `HelmRelease` + `Package` CRs that Flux and the bigbang-operator reconcile.
- The gateway TLS secret `public-cert` in the `istio-gateway` namespace (the dev flow creates it from the umbrella cert; supply your own in a real environment).

## Build (connected side)
```bash
zarf package create zarf/
```
Zarf clones `REPO_URL@TARGET_REVISION` and pulls the images listed in `zarf.yaml`.

## Deploy (airgap side)
```bash
zarf package deploy zarf-package-bigbang-core-minimal-*.tar.zst \
  --set REPO_URL=https://github.com/rjferguson21/bigbang-core.git \
  --set TARGET_REVISION=main
```
Zarf pushes the images, mirrors the repo into gitea, applies the `bigbang-core-values`
ConfigMap (`profile: minimal`) and the parent `GitRepository`/`HelmRelease`; the
agent repoints the GitRepository to gitea and rewrites pod images to the registry.

## Extending beyond minimal
- Change the profile: edit `manifests/core-values-minimal.yaml` (drop `profile: minimal`
  for the full stack, or set `profile: ambient`).
- Add the extra images to `zarf.yaml`'s `images:` — the full set is enumerable from each
  chart's `helm.sh/images` annotation:
  ```bash
  for c in core/*/chart/Chart.yaml; do yq '.annotations."helm.sh/images"' "$c"; done \
    | grep 'image:' | sed 's/.*image: //' | sort -u
  ```
  (plus a few subchart `image:` refs in monitoring/loki/alloy `values.yaml`).

## Notes / not yet done
- **Prototype, not deploy-tested** in a real airgap — authored and `zarf dev lint`-clean only.
- Flux is assumed present; bundling it as its own component/package is a follow-up.
- Images use tags, not digests (lint warns) — pin for production.
