# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [10.3.2-bb.4] (2026-10-15)

### Removed

- Big Bang gluon script-test (templates/tests/test-scripts.yaml + tests/scripts) and the `gluon` chart dependency. The standalone test-services helm test is retained.

## [10.3.2-bb.3] (2026-10-15)

### Removed

- OpenShift support: the SCC RoleBinding template and the `openshift` value (this distribution targets k3s/k3d, not OpenShift).

## [10.3.2-bb.2] (2026-10-15)

### Removed

- Gluon Cypress UI test (test-cypress template, cypress specs/npm harness, `bbtests.cypress` values, and the cypress image). The script-based (`bbtests.scripts`) tests remain.

## [10.3.2-bb.1] (2026-10-08)

### Added

- Initial chart based on repo1 gitlab 10.3.2-bb.1, with a bigbang.dev/v1alpha1 Package CR replacing the bb-common dependency for Istio, NetworkPolicy, and route configuration
