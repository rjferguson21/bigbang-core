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

## Operator chart integration

Run the render checks before changing gateway defaults or hook networking:

```bash
python3 -m unittest discover -s tests -p '*_test.py' -v
```

These checks require Helm 4 and PyYAML. They verify gateway identity against
its Deployment, route inheritance, hook policy selectors and ordering,
release isolation, cleanup markers, and disabled networking in rendered
charts. They do not install workloads or verify network connectivity.
