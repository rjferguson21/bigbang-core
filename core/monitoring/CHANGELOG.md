# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [87.10.1-bb.3] (2026-10-15)

### Removed

- OpenShift support: the SCC ClusterRoleBinding and NetworkAttachmentDefinition templates (the whole templates/bigbang/openshift directory) and the `openshift` value (this distribution targets k3s/k3d, not OpenShift).

## [87.10.1-bb.2] (2026-09-27)

### Added

- Initial chart based on repo1 monitoring 87.10.1-bb.2, with a bigbang.dev/v1alpha1 Package CR replacing the bb-common dependency for Istio, NetworkPolicy, and route configuration
