# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.26.5-bb.3] (2026-10-15)

### Removed

- Big Bang gluon script-test (templates/tests + tests/scripts) and the `gluon` chart dependency.

## [1.26.5-bb.2] (2026-10-15)

### Removed

- OpenShift support: the SCC ClusterRoleBinding and NetworkAttachmentDefinition templates and the `openshift` value (this distribution targets k3s/k3d, not OpenShift).

## [1.26.5-bb.1] (2026-09-27)

### Added

- Initial chart based on repo1 tempo 1.26.5-bb.1, with a bigbang.dev/v1alpha1 Package CR replacing the bb-common dependency for Istio, NetworkPolicy, and route configuration
