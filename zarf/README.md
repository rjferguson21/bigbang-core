# Airgap (Zarf) — prototype

A [Zarf](https://zarf.dev) package that installs the **full bigbang-core default
stack** (operator, CRDs, Istio, Kyverno + policies + reporter, monitoring, Loki,
Grafana, Alloy) into an airgapped cluster. Zarf mirrors this repo into the
in-cluster git and the core images into the in-cluster registry, and its
admission agent rewrites the Flux `GitRepository` and pod image references
automatically — so no manual hub-rewrite overlay is needed.

Ambient-only packages (istio-cni, ztunnel) are omitted; add their images to
`zarf.yaml` and set `profile: ambient` to deploy the ambient variant.

Two integration points the agent does **not** cover, handled here:
- **Pull secret.** The agent injects `imagePullSecrets: private-registry` into
  pods but only seeds the secret into namespaces that exist at deploy time. The
  core chart copies it into every package namespace when
  `imagePullSecret.copyFromReleaseNamespace=true` (set in the core values).
- **Gateway proxy tag.** Zarf rewrites the injected istio-proxy tag to
  `:<ver>-zarf-<hash>`; the gateway wait job compares only the version prefix so
  it no longer loops (gateway chart `1.30.4-bb.4`).

## Quick start (local demo)
From the repo root:
```bash
task zarf:up          # cluster + zarf init + package create + deploy + gateway cert
```
`zarf:up` creates the k3d cluster itself (bb-k3d bootstrap with public Flux/MetalLB
images; the core images come from Zarf), so nothing needs to exist first.
Individual steps: `task zarf:cluster`, `task zarf:init`, `task zarf:create`,
`task zarf:deploy`, `task zarf:gateway:cert`, `task zarf:remove`. See `zarf/Taskfile.yml`.

## Prerequisites (in the airgap)
- A Zarf-initialised cluster with the **git-server** component
  (`zarf init --components git-server` — in-cluster registry, gitea, and agent).
- **Flux** (`helm-controller` + `source-controller`) already installed.
  bigbang-core's parent chart emits `HelmRelease` + `Package` CRs that Flux and
  the bigbang-operator reconcile.
- The gateway TLS secret `public-cert` in the `istio-gateway` namespace
  (`task zarf:gateway:cert` creates it from the umbrella dev cert; supply your
  own in a real environment).

## Build (connected side)
```bash
zarf package create zarf/
```
Zarf mirrors the repo in `zarf.yaml`'s `repos:` and pulls the images in `images:`
(needs registry1 pull access — `REGISTRY1_USERNAME`/`REGISTRY1_PASSWORD`). Both
are resolved at **create** time (not deploy), so they are literals in `zarf.yaml`
rather than Zarf variables.

## Deploy (airgap side)
```bash
zarf package deploy zarf-package-bigbang-core-*.tar.zst --confirm
```
Zarf pushes the images, mirrors the repo into gitea, applies the
`bigbang-core-values` ConfigMap and the parent `GitRepository`/`HelmRelease`; the
agent repoints the GitRepository to gitea and rewrites pod images to the
in-cluster registry.

## Image list
`zarf.yaml`'s `images:` is the full non-ambient set, enumerated from each chart's
`helm.sh/images` annotation:
```bash
for p in istiod istio-gateway kyverno kyverno-policies kyverno-reporter \
         monitoring loki grafana alloy; do
  yq '.annotations."helm.sh/images"' "core/$p/chart/Chart.yaml"
done | grep 'image:' | sed 's/.*image: //' | sort -u
```
(plus the operator image `ghcr.io/rjferguson21/bigbang-operator`). Re-run and
diff after a package/image bump to keep the list in sync.

## Profiles
- **Minimal** (operator + CRDs + Istio only): set `profile: minimal` in
  `manifests/core-values.yaml` and trim `images:` to the istio + operator + kubectl set.
- **Ambient**: set `profile: ambient` and add the istio-cni/ztunnel images.

## Notes / not yet done
- **Deploy-tested locally** against a `zarf init`-ed k3d cluster — not yet
  exercised in a real disconnected environment.
- Flux is assumed present; bundling it as its own component/package is a follow-up.
- Images use tags, not digests (lint warns) — pin for production.
- The repo + GitRepository branch are literals (`main`). For a different branch,
  edit both `zarf.yaml` (`repos:`) and `manifests/bigbang-core.yaml` (`ref.branch`).
