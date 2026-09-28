# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.57.9-bb.0] (2026-09-27)

### Added

- Initial chart based on repo1 fluentbit 0.57.9-bb.0, with a bigbang.dev/v1alpha1 Package CR replacing the bb-common dependency for Istio and NetworkPolicy configuration, and a chart-managed kyverno PolicyException for the fluent-bit pods
