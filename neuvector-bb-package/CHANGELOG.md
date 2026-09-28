# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [2.8.13-bb.1] (2026-09-27)

### Added

- Initial chart based on repo1 neuvector 2.8.13-bb.1, with a bigbang.dev/v1alpha1 Package CR replacing the bb-common dependency for Istio, NetworkPolicy, and route configuration
- Chart-managed kyverno PolicyException for the privileged neuvector pods, mirroring the umbrella's carve-out
