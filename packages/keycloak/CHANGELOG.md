# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [7.3.0-bb.3] (2026-10-15)

### Removed

- Big Bang gluon script-test (templates/tests/test-script.yaml) and the `gluon` chart dependency. The standalone pod-test helm test and the keycloak admin-API wait hook are retained.

## [7.3.0-bb.2] (2026-09-25)

### Added

- Initial chart based on repo1 keycloak 7.3.0-bb.2, with a bigbang.dev/v1alpha1 Package CR replacing the bb-common dependency for Istio, NetworkPolicy, and route configuration
