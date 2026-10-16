# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.30.0-bb.8] (2026-10-15)

### Changed

- Declare the volume-upgrade Job's kube-API egress in the Package CR instead of a standalone Helm-hook NetworkPolicy, letting the operator manage it as a persistent, release-scoped policy.

### Removed

- Standalone hook NetworkPolicy template and the `hookNetworkPolicies.egress` value.

## [0.30.0-bb.7] (2026-10-15)

### Changed

- Render the volume-upgrade NetworkPolicy directly as a Helm hook with configurable egress.

### Removed

- Shared operator Helm library dependency and hook cleanup markers.

## [0.30.0-bb.6] (2026-10-15)

### Changed

- Render volume upgrade hook networking through the shared operator Helm integration.

## [0.30.0-bb.5] (2026-10-15)

### Removed

- Big Bang gluon API test + wait-job (templates/tests + tests/scripts + tests/*.bats) and the `gluon` chart dependency.

## [0.30.0-bb.4] (2026-10-15)

### Removed

- OpenShift support: the SCC RoleBinding and NetworkAttachmentDefinition templates, the `openshift` value, and OpenShift conditionals/comments (the defender orchestration type is now always `kubernetes`; this distribution targets k3s/k3d, not OpenShift).

## [0.30.0-bb.3] (2026-09-27)

### Added

- Initial chart based on repo1 twistlock 0.30.0-bb.3, with a bigbang.dev/v1alpha1 Package CR replacing the bb-common dependency for Istio, NetworkPolicy, and route configuration
- Chart-managed kyverno PolicyException for twistlock-console*, twistlock-defender-ds*, and volume-upgrade* pods
