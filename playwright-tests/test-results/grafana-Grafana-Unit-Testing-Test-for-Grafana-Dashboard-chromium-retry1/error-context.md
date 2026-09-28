# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: grafana.spec.ts >> Grafana Unit Testing >> Test for Grafana Dashboard
- Location: tests/grafana.spec.ts:24:7

# Error details

```
Error: expect(locator).not.toContainText(expected) failed

Locator: locator('[data-testid="data-testid Panel header Requests (total)"]')
Expected substring: not "No data"
Received string: "Requests (total)No data"
Timeout: 15000ms

Call log:
  - Expect "not toContainText" with timeout 15000ms
  - waiting for locator('[data-testid="data-testid Panel header Requests (total)"]')
    34 × locator resolved to <section tabindex="0" aria-labelledby="_r_2q_" class="css-iwhfbi-panel-container" data-testid="data-testid Panel header Requests (total)">…</section>
       - unexpected value "Requests (total)No data"

```

```yaml
- region "Requests (total)":
  - heading "Requests (total)" [level=2]
  - button "Menu for panel Requests (total)"
  - text: No data
```

# Test source

```ts
  1  | // Ported from grafana-bb-package/chart/tests/cypress/e2e/01-grafana-healthspec.cy.js
  2  | 
  3  | import { test, expect } from '@playwright/test';
  4  | import env from '../helpers/env';
  5  | import { completeKeycloakLogin } from '../helpers/keycloak';
  6  | import { grafanaLogin, loadGrafanaDashboard } from '../helpers/grafana';
  7  | 
  8  | test.beforeEach(async ({ page }) => {
  9  |   await page.goto(env.GRAFANA_URL);
  10 | 
  11 |   if (env.KEYCLOAK_TEST_ENABLE) {
  12 |     const grafanaOrigin = new URL(env.GRAFANA_URL).origin;
  13 |     await page.locator('a:has-text("SSO"), button:has-text("SSO")').first().click({ timeout: 30000 });
  14 |     await completeKeycloakLogin(page, grafanaOrigin, env.TNR_USERNAME, env.TNR_PASSWORD);
  15 |     // Checking the session also catches a redirect to an unauthenticated/error page.
  16 |     const user = await page.request.get(`${grafanaOrigin}/api/user`);
  17 |     expect(user.status()).toBe(200);
  18 |   } else {
  19 |     await grafanaLogin(page, 'admin', 'prom-operator');
  20 |   }
  21 | });
  22 | 
  23 | test.describe('Grafana Unit Testing', () => {
  24 |   test('Test for Grafana Dashboard', async ({ page }) => {
  25 |     await page.goto(`${env.GRAFANA_URL}/dashboards`);
  26 |     await loadGrafanaDashboard(page, 'CoreDNS');
  27 |     await expect(page.locator('[data-testid="data-testid Panel header Requests (total)"]'))
> 28 |       .not.toContainText('No data');
     |            ^ Error: expect(locator).not.toContainText(expected) failed
  29 |   });
  30 | });
  31 | 
```