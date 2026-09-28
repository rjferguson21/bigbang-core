// Ported from grafana-bb-package/chart/tests/cypress/e2e/01-grafana-healthspec.cy.js

import { test, expect } from '@playwright/test';
import env from '../helpers/env';
import { completeKeycloakLogin } from '../helpers/keycloak';
import { grafanaLogin, loadGrafanaDashboard } from '../helpers/grafana';

test.beforeEach(async ({ page }) => {
  await page.goto(env.GRAFANA_URL);

  if (env.KEYCLOAK_TEST_ENABLE) {
    const grafanaOrigin = new URL(env.GRAFANA_URL).origin;
    await page.locator('a:has-text("SSO"), button:has-text("SSO")').first().click({ timeout: 30000 });
    await completeKeycloakLogin(page, grafanaOrigin, env.TNR_USERNAME, env.TNR_PASSWORD);
    // Checking the session also catches a redirect to an unauthenticated/error page.
    const user = await page.request.get(`${grafanaOrigin}/api/user`);
    expect(user.status()).toBe(200);
  } else {
    await grafanaLogin(page, 'admin', 'prom-operator');
  }
});

test.describe('Grafana Unit Testing', () => {
  test('Test for Grafana Dashboard', async ({ page }) => {
    await page.goto(`${env.GRAFANA_URL}/dashboards`);
    await loadGrafanaDashboard(page, 'CoreDNS');
    await expect(page.locator('[data-testid="data-testid Panel header Requests (total)"]'))
      .not.toContainText('No data');
  });
});
