# Changelog

## [0.4.1] (2026-10-16)

### Added

- Shared `control-plane-subnets` ingress definition in the operator globalConfig; istiod and monitoring reference it for their control-plane webhook ingress instead of inlining `0.0.0.0/0`.

## [0.4.0] (2026-10-15)

### Changed

- Configure shared ingress gateway defaults and the public gateway workload identity through bigbang-operator.
- Install the pinned operator OCI chart through Flux and create Job NetworkPolicies directly with Helm hooks in the package charts.
- Remove the vendored operator chart and CRD; keep deployment configuration in core values.
