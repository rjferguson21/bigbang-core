# CI

`.github/workflows/ci.yaml` runs on pushes to main and on pull requests, with a
single job:

- **core-minimal** — `task ci`: recreates a k3d cluster with
  `UPSTREAM_IMAGES=true`, deploys core with the `minimal` profile and the
  upstream-images overlay from the local gitea, waits for every HelmRelease to
  report Ready. Ambient is the default mesh mode, so it asserts the `istio-cni`
  and `ztunnel` DaemonSets roll out and a probe pod in an ambient-labeled
  namespace gets the `ambient.istio.io/redirection: enabled` annotation, then
  deploys the kiali package with its `dev/values/upstream/kiali.yaml` overlay
  and runs `tests/kiali.spec.ts` against the cluster.

The gateway's `*.dev.bigbang.mil` cert is downloaded from the umbrella repo
when no local checkout is present. Traces are uploaded on failure.

The job prints nodes, HelmReleases, Packages, istio-system pods and the
ambient-test namespace on every run, and pod descriptions, logs, istio-cni/
ztunnel logs, warning events and Flux controller logs on failure.
