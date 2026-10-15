# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [13.2.5-bb.4] (2026-10-15)

### Changed

- Inherit the ingress gateway from operator global route defaults.

## [13.2.5-bb.3] (2026-10-15)

### Removed

- Unused `gluon` chart dependency (no gluon test templates are present in this chart).

## [13.2.5-bb.2] (2026-10-15)

### Removed

- OpenShift support: the SCC ClusterRoleBinding template and the `openshift` value (this distribution targets k3s/k3d, not OpenShift).

## [13.2.5-bb.1] (2026-10-15)

### Removed

- Vestigial Cypress image from `helm.sh/images` (no Cypress test is defined in this chart).

## [13.2.5-bb.0] (2026-09-27)

### Added

- Initial chart based on repo1 grafana 13.2.5-bb.0, with a bigbang.dev/v1alpha1 Package CR replacing the bb-common dependency for Istio, NetworkPolicy, and route configuration
