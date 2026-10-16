# Changelog

## [0.4.0] (2026-10-15)

### Changed

- Configure shared ingress gateway defaults and the public gateway workload identity through bigbang-operator.
- Install the pinned operator OCI chart through Flux and create Job NetworkPolicies directly with Helm hooks in the package charts.
- Remove the vendored operator chart and CRD; keep deployment configuration in core values.
