# Big Bang Playwright Tests

Shared Playwright end-to-end test suite for the Big Bang core packages. These
tests replace the per-package cypress tests that were previously embedded in
each package chart (`<pkg>/chart/tests/cypress/e2e/`) and run
against an already-deployed cluster.

The dev/CI clusters use self-signed certificates, so the Playwright config
sets `ignoreHTTPSErrors: true`.

## Running

```bash
cd playwright-tests
npm ci
npx playwright install chromium

# Run everything against the default dev domain
npx playwright test

# Run against a different domain
DOMAIN=my.cluster.mil npx playwright test

# Run a single package's tests
npx playwright test tests/monitoring.spec.ts
```

At config time the suite fills in unset environment variables automatically:

1. from a `.env` file in this directory (`KEY=value` lines), then
2. from the current kubectl context (`helpers/cluster.ts`): the public and
   passthrough gateway LoadBalancer IPs (`GATEWAY_IP`,
   `PASSTHROUGH_GATEWAY_IP`), the elastic password
   (`ELASTIC_PASSWORD` from the `logging-ek-es-elastic-user` secret), and the
   NeuVector bootstrap password (`NEUVECTOR_PASSWORD`).

Explicit environment variables always win, and `SKIP_CLUSTER_DISCOVERY=1`
disables the kubectl lookups (useful off-cluster or in CI where the values
are injected).

## Test files

| File | Replaces |
|---|---|
| `tests/alloy.spec.ts` | alloy `01-validate-service-monitors.cy.js` |
| `tests/elasticsearch-kibana.spec.ts` | elasticsearch-kibana `01-kibana-health.cy.js` |
| `tests/gitlab.spec.ts` | gitlab `01-gitlab-health-spec.cy.js` |
| `tests/grafana.spec.ts` | grafana `01-grafana-healthspec.cy.js` |
| `tests/keycloak.spec.ts` | keycloak `keycloak-health.spec.cy.js` |
| `tests/kyverno-reporter.spec.ts` | kyverno-reporter `01-grafana.cy.js`, `01-policyreporter.cy.js` |
| `tests/loki.spec.ts` | loki `01-loki-health.spec.cy.js` |
| `tests/monitoring.spec.ts` | monitoring `01-alertmanager-healthspec.cy.js`, `02-prometheus-healthspec.cy.js`, `03-monitoring-targets-up.cy.js` (the shared `login.cy.js` helper became `helpers/keycloak.ts`) |
| `tests/neuvector.spec.ts` | neuvector `01-neuvector-health.cy.js` |
| `tests/tempo.spec.ts` | tempo `01-tempo-health.cy.js` |
| `tests/twistlock.spec.ts` | twistlock `twistlock-health.cy.js` |

## Environment variables

All URLs default to the in-cluster-external (VirtualService) route on
`https://<service>.$DOMAIN`.

| Variable | Default | Replaces cypress env |
|---|---|---|
| `GATEWAY_IP` | *(unset — uses system DNS/etc-hosts)* | maps `*.$DOMAIN` to the public gateway LB inside the browser; set `PASSTHROUGH_GATEWAY_IP` too if keycloak's passthrough gateway has a different LB IP |
| `DOMAIN` | `dev.bigbang.mil` | — |
| `GRAFANA_URL` | `https://grafana.$DOMAIN` | `cypress_grafana_url` |
| `PROMETHEUS_URL` | `https://prometheus.$DOMAIN` | `cypress_prometheus_url` |
| `ALERTMANAGER_URL` | `https://alertmanager.$DOMAIN` | `cypress_alertmanager_url` |
| `KIALI_URL` | `https://kiali.$DOMAIN` | — (no kiali cypress spec existed; reserved) |
| `KIBANA_URL` | `https://kibana.$DOMAIN` | `cypress_kibana_url` |
| `KEYCLOAK_URL` | `https://keycloak.$DOMAIN` | `cypress_url` (keycloak), `cypress_keycloak_url` |
| `NEUVECTOR_URL` | `https://neuvector.$DOMAIN` | `cypress_url` (neuvector) |
| `TWISTLOCK_URL` | `https://twistlock.$DOMAIN` | `cypress_twistlock_url` |
| `POLICYREPORTER_URL` | `https://policyreporter.$DOMAIN` | `cypress_policyreporter_ui` |
| `GITLAB_URL` | `https://gitlab.$DOMAIN` | `cypress_url` (gitlab) |
| `TEMPO_DATASOURCE` | `http://tempo-tempo.tempo.svc:3200` | `cypress_tempo_datasource` (unused by the tests, kept for parity) |
| `SAML_METADATA_URL` | *(unset — skips the Twistlock SAML cert sync)* | `cypress_saml_metadata_url` |
| `BIGBANG_INTEGRATION` | `true` | `cypress_bigbang_integration` |
| `EXPECT_LOGS` | `false` | `cypress_expect_logs` |
| `CHECK_DATASOURCE` | `false` | `cypress_check_datasource` |
| `KEYCLOAK_TEST_ENABLE` | `false` | `cypress_keycloak_test_enable` |
| `GRAFANA_USERNAME` | `admin` | `cypress_grafana_user` |
| `GRAFANA_PASSWORD` | `prom-operator` | `cypress_grafana_pass` |
| `ELASTIC_PASSWORD` | *(empty — required for kibana tests)* | `cypress_elastic_password` |
| `KEYCLOAK_USERNAME` | `admin` | `cypress_username` (keycloak) |
| `KEYCLOAK_PASSWORD` | `password` | `cypress_password` (keycloak) |
| `TNR_USERNAME` | `cypress` | `cypress_tnr_username` |
| `TNR_PASSWORD` | `tnr_w!G33ZyAt@C8` | `cypress_tnr_password` |
| `NEUVECTOR_PASSWORD` | `admin` | `cypress_password` — NeuVector 5.5+ generates a random bootstrap password; set from the cluster: `kubectl get secret neuvector-bootstrap-secret -n neuvector -o jsonpath='{.data.bootstrapPassword}' \| base64 -d` |
| `TWISTLOCK_USERNAME` | `admin` | `cypress_user` (twistlock) |
| `TWISTLOCK_PASSWORD` | `change_this_password` | `cypress_password` (twistlock) |
| `GITLAB_FIRST_NAME` | `test` | `cypress_gitlab_first_name` |
| `GITLAB_LAST_NAME` | `user` | `cypress_gitlab_last_name` |
| `GITLAB_USERNAME` | `testuser` | `cypress_gitlab_username` |
| `GITLAB_PASSWORD` | `Password123h56a78` | `cypress_gitlab_password` |
| `GITLAB_EMAIL` | `testuser@example.com` | `cypress_gitlab_email` |
| `GITLAB_PROJECT` | `my-awesome-project` | `cypress_gitlab_project` |
| `GITLAB_ADMIN_PASSWORD` | *(empty — discovered from the `gitlab-gitlab-initial-root-password` secret)* | `cypress_adminpassword` |
| `RETRIES` | `2` | per-spec cypress `retries` config |
