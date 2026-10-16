# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [87.10.1-bb.7] (2026-10-15)

### Changed

- Render admission-webhook and metrics-upgrade NetworkPolicies directly as Helm hooks with configurable egress.

### Removed

- Shared operator Helm library dependency and hook cleanup markers.

## [87.10.1-bb.6] (2026-10-15)

### Changed

- Use the shared operator Helm integration for admission and metrics upgrade hook networking, and inherit the global ingress gateway.

### Fixed

- Allow the metrics upgrade hook to render when optional global image settings are absent.

## [87.10.1-bb.5] (2026-10-15)

### Added

- Hook NetworkPolicy allowing the admission-webhook patch Jobs egress to the kube API. In ambient mode ztunnel enforces NetworkPolicy and the namespace default-deny blocked the hook pods, crashlooping the create Job so the release never went Ready. Systemic fix tracked in bigbang-operator#12.

## [87.10.1-bb.4] (2026-10-15)

### Removed

- Unused `gluon` chart dependency (no gluon test templates are present in this chart).

## [87.10.1-bb.3] (2026-10-15)

### Removed

- OpenShift support: the SCC ClusterRoleBinding and NetworkAttachmentDefinition templates (the whole templates/bigbang/openshift directory) and the `openshift` value (this distribution targets k3s/k3d, not OpenShift).

## [87.10.1-bb.2] (2026-09-27)

### Added

- Initial chart based on repo1 monitoring 87.10.1-bb.2, with a bigbang.dev/v1alpha1 Package CR replacing the bb-common dependency for Istio, NetworkPolicy, and route configuration
