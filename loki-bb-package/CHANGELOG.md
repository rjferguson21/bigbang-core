# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [6.55.0-bb.2] (2026-09-25)

### Added

- Initial chart wrapping upstream loki 6.55.0 under the `upstream` alias, with a bigbang.dev/v1alpha1 Package CR replacing the bb-common dependency for Istio, NetworkPolicy, and route configuration

### Changed

- Converted from a fork of the upstream chart to a thin wrapper; Big Bang overrides live under `upstream:` in values, minio-instance is no longer bundled (storage defaults to filesystem)
