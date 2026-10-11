# bigbang-core

A Big Bang built on the [bigbang-operator](https://repo1.dso.mil/big-bang/product/packages/bigbang-operator)
instead of `bb-common`. Each package chart wraps its upstream chart and emits a
`bigbang.dev/v1alpha1 Package` custom resource; the operator reconciles that CR
into the Istio and NetworkPolicy resources Big Bang would otherwise render at
template time. The core stack is deployed by Flux from this repo; the app
packages are deployed with Helm on top of it.

To stand up a cluster in one command, see the
[Quick start](https://github.com/rjferguson21/bigbang-core#quick-start) in the repo README.

## Documentation

- [Architecture](architecture.md) — how the operator, core chart and packages fit together
- [Dev workflow](dev-workflow.md) — the Taskfile harness, cluster lifecycle and profiles
- [CI](ci.md) — what the GitHub Actions pipeline does
- [Testing](testing.md) — the shared Playwright end-to-end suite
- [Packages](packages.md) — the app and core package list
