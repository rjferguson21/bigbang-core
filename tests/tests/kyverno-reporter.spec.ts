// Ported from kyverno-reporter-bb-package/chart/tests/cypress/e2e/01-grafana.cy.js
// and kyverno-reporter-bb-package/chart/tests/cypress/e2e/01-policyreporter.cy.js

import { test, expect, type Page } from '@playwright/test';
import env from '../helpers/env';
import { grafanaLogin, loadGrafanaDashboard } from '../helpers/grafana';

// Port of the cy.panelnotzero command: panel data should not be zero
async function panelNotZero(page: Page, name: string): Promise<void> {
  const panel = page.locator(`[data-testid="data-testid Panel header ${name}"]`);
  await expect(panel.getByText(/^[1-9][0-9]*$/).first()).toBeVisible();
}

test.describe('Validate Grafana Dashboards', () => {
  test.skip(!env.CHECK_DATASOURCE, 'CHECK_DATASOURCE is not enabled');

  test.beforeEach(async ({ page }) => {
    await page.goto(env.GRAFANA_URL);
    await grafanaLogin(page, env.GRAFANA_USERNAME, env.GRAFANA_PASSWORD);
    await page.goto(`${env.GRAFANA_URL}/dashboards`);
  });

  test('Validate Cluster Policy Report Details Dashboard', async ({ page }) => {
    await loadGrafanaDashboard(page, 'ClusterPolicyReport Details');
    await panelNotZero(page, 'Policy Pass Status');
    await panelNotZero(page, 'Policy Fail Status');
  });

  test('Validate Policy Report Details Dashboard', async ({ page }) => {
    await loadGrafanaDashboard(page, 'PolicyReport Details');
    await panelNotZero(page, 'Policy Pass Status');
    await panelNotZero(page, 'Policy Fail Status');
  });

  test('Validate Policy Reports Dashboard', async ({ page }) => {
    await loadGrafanaDashboard(page, 'PolicyReports');
    await panelNotZero(page, 'Failing ClusterPolicies');
  });
});

test.describe('Validate Policy Reporter UI Dashboards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(env.POLICYREPORTER_URL);
  });

  test('Validate main dashboard widgets exist', async ({ page }) => {
    await expect(page.getByText('Policy Reporter').first()).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('Kyverno Cluster Scoped Results').first()).toBeVisible();
    await expect(page.getByText('Cluster Resources').first()).toBeVisible();
    await expect(page.getByText('Namespace Scoped Resources').first()).toBeVisible();
  });

  test('Navigate to Policy Dashboard and validate categories', async ({ page }) => {
    const policyDashboard = page.getByText(/policy dashboard/i).first();
    await policyDashboard.scrollIntoViewIfNeeded();
    await policyDashboard.click({ force: true });

    await expect
      .poll(() => new URL(page.url()).hash, { timeout: 30000 })
      .not.toBe('');

    await expect(page.getByText('Security').first()).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('Vulnerability').first()).toBeVisible();

    const bestPractices = page.getByText('Best Practices').first();
    await expect(bestPractices).toBeVisible();
    await bestPractices.scrollIntoViewIfNeeded();
  });
});
