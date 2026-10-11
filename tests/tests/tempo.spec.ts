// Ported from tempo-bb-package/chart/tests/cypress/e2e/01-tempo-health.cy.js

import { test, expect } from '@playwright/test';
import env from '../helpers/env';
import { grafanaLogin } from '../helpers/grafana';

const saveOutput = /Data source is working|Data source successfully connected|Successfully connected to/;

test.describe('Tempo Test', () => {
  test('Check Tempo is available as a data source in grafana', async ({ page }) => {
    test.skip(!env.CHECK_DATASOURCE, 'CHECK_DATASOURCE is not enabled');

    await page.goto(env.GRAFANA_URL);
    await grafanaLogin(page, 'admin', 'prom-operator');

    // Visit the datasources page
    await page.goto(`${env.GRAFANA_URL}/connections/datasources`);
    await page.locator('input[placeholder="Search by name or type"]').fill('tempo');
    await page.locator('a').filter({ hasText: 'Tempo' }).first().click();
    // Click on the 'Save & test' button
    await page.locator('button[type="submit"]').click();
    // Check to ensure the data source is working
    await expect(page.locator('[data-testid="data-testid Alert success"]'))
      .toContainText(saveOutput, { timeout: 10000 });
  });
});
