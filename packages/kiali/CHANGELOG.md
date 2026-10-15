# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [2.32.0-bb.1] (2026-10-15)

### Removed

- OpenShift support: the SCC ClusterRoleBinding and NetworkAttachmentDefinition templates (this distribution targets k3s/k3d, not OpenShift).

## [2.32.0-bb.0] (2026-09-25)

### Added

- Initial chart wrapping upstream kiali-operator 2.32.0, with a bigbang.dev/v1alpha1 Package CR replacing the bb-common dependency for Istio and NetworkPolicy configuration
