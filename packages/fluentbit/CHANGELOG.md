# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.57.9-bb.2] (2026-10-15)

### Removed

- Big Bang gluon API-check test (templates/tests/api-check.yaml + tests/scripts) and the `gluon` chart dependency. The standalone test-connection helm test is retained.

## [0.57.9-bb.1] (2026-10-15)

### Removed

- OpenShift support: the SCC RoleBinding and NetworkAttachmentDefinition templates and the `openshift` value (this distribution targets k3s/k3d, not OpenShift).

## [0.57.9-bb.0] (2026-09-27)

### Added

- Initial chart based on repo1 fluentbit 0.57.9-bb.0, with a bigbang.dev/v1alpha1 Package CR replacing the bb-common dependency for Istio and NetworkPolicy configuration, and a chart-managed kyverno PolicyException for the fluent-bit pods
