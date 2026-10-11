# Testing

[`tests/`](https://github.com/rjferguson21/bigbang-core/blob/main/tests/README.md) is a shared Playwright suite that replaces the
per-package cypress tests. It runs against an already-deployed cluster and
discovers the gateway IPs and passwords from the current kubectl context:

```bash
cd tests && npm ci && npx playwright install chromium
npx playwright test                       # everything, against dev.bigbang.mil
npx playwright test tests/keycloak.spec.ts
```

From the Taskfile:

```bash
task playwright:install                   # deps + chromium (WITH_DEPS=true also installs OS packages)
task playwright:test                      # whole suite
task playwright:test SPEC=tests/kiali.spec.ts
```
