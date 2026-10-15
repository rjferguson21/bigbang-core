# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [3.3.4-bb.65] (2026-10-15)

### Removed

- Big Bang gluon policy test + wait-job scaffolding (templates/tests + tests/{gpol,mpol,vpol,manifests,scripts}) and the `gluon` chart dependency.

## [3.3.4-bb.64] (2026-09-30)

### Added

- Initial chart based on repo1 kyverno-policies 3.3.4-bb.64, with the umbrella's policy defaults for the core stack baked into the chart values
