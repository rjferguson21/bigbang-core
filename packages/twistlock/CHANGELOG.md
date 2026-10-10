# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.30.0-bb.3] (2026-09-27)

### Added

- Initial chart based on repo1 twistlock 0.30.0-bb.3, with a bigbang.dev/v1alpha1 Package CR replacing the bb-common dependency for Istio, NetworkPolicy, and route configuration
- Chart-managed kyverno PolicyException for twistlock-console*, twistlock-defender-ds*, and volume-upgrade* pods
