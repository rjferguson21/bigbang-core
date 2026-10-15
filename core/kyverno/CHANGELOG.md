# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [3.9.1-bb.1] (2026-10-15)

### Removed

- OpenShift support: the SCC ClusterRoleBinding and NetworkAttachmentDefinition templates and the `openshift` value (this distribution targets k3s/k3d, not OpenShift).

## [3.9.1-bb.0] (2026-09-27)

### Added

- Initial chart based on repo1 kyverno 3.9.1-bb.0, with a bigbang.dev/v1alpha1 Package CR replacing the bb-common dependency for Istio and NetworkPolicy configuration
