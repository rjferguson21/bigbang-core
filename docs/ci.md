# CI

`.github/workflows/ci.yaml` runs on pushes to main and on pull requests, with
two parallel jobs:

- **core-minimal** — `task ci`: recreates a k3d cluster with
  `UPSTREAM_IMAGES=true`, deploys core with the core-minimal and
  upstream-images overlays from the local gitea, waits for every HelmRelease
  to report Ready, then deploys the kiali package with its
  `dev/values/upstream/kiali.yaml` overlay and runs `tests/kiali.spec.ts`
  against the cluster.
- **core-ambient** — `task ci:ambient`: same cluster recipe with the
  `ambient.yaml` overlay added, then asserts the `istio-cni` and `ztunnel`
  DaemonSets roll out and a probe pod in an ambient-labeled namespace gets the
  `ambient.istio.io/redirection: enabled` annotation, before deploying kiali
  and running the same playwright smoke test.

The gateway's `*.dev.bigbang.mil` cert is downloaded from the umbrella repo
when no local checkout is present. Traces are uploaded on failure.

Both jobs print nodes, HelmReleases, Packages and pods on every run, and pod
descriptions, logs, warning events and Flux controller logs on failure.
