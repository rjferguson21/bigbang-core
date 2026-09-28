// Ported from loki-bb-package/chart/tests/cypress/e2e/01-loki-health.spec.cy.js

import { test, expect, type Page } from '@playwright/test';
import env from '../helpers/env';
import { grafanaLogin, loadGrafanaDashboard } from '../helpers/grafana';

const saveOutput = /Data source is working|Data source successfully connected|Successfully connected to/;

async function grafanaLoginIfNeeded(page: Page): Promise<void> {
  await page.goto(env.GRAFANA_URL);
  if (page.url().includes('/login')) {
    await grafanaLogin(page, 'admin', 'prom-operator');
  }
}

test.describe('Loki Test', () => {
  test.skip(!env.CHECK_DATASOURCE, 'CHECK_DATASOURCE is not enabled');

  test('Check Loki is available as a data source in grafana and connected', async ({ page }) => {
    await grafanaLoginIfNeeded(page);

    await page.goto(`${env.GRAFANA_URL}/connections/datasources`);
    await page.locator('input[type="text"]').first().fill('loki');
    await page.locator('a').filter({ hasText: 'Loki' }).first().click();
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('[data-testid="data-testid Alert success"]'))
      .toContainText(saveOutput, { timeout: 30000 });
  });

  test('Test for Loki Dashboard log data', async ({ page }) => {
    await grafanaLoginIfNeeded(page);

    await page.goto(`${env.GRAFANA_URL}/dashboards`);
    await loadGrafanaDashboard(page, 'Loki Dashboard quick search');

    // Open the namespace template variable and select istio-system if present
    await page
      .locator('[data-testid*="data-testid Dashboard template variables Variable Value DropDown value link text"]')
      .first()
      .click();
    const options = page.locator('[data-testid="data-testid Select option"]');
    await options.first().waitFor();
    const istioOption = options.filter({ hasText: 'istio-system' });
    if (await istioOption.count()) {
      await istioOption.first().click();
    }

    const logMenus = page
      .locator('[data-testid="data-testid Panel header Logs Panel"]')
      .locator('button[aria-label="Log menu"]');
    await expect
      .poll(() => logMenus.count(), { timeout: 30000 })
      .toBeGreaterThanOrEqual(5);
  });
});
