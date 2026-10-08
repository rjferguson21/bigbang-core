# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.30.4-bb.2] (2026-10-08)

### Fixed

- Gateway was unreachable under the operator's default-deny NetworkPolicies: added the umbrella's per-gateway ingress (web ports from load-balancer-subnets) and egress (gateway to any pod) rules

## [1.30.4-bb.1] (2026-09-27)

### Added

- Initial chart based on repo1 istio-gateway 1.30.4-bb.1, with a bigbang.dev/v1alpha1 Package CR replacing the bb-common dependency for NetworkPolicy configuration
