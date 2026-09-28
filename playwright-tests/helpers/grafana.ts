// Grafana helpers ported from the gluon cypress commands
// (performGrafanaLogin / loadGrafanaDashboard).

import { expect, type Page } from '@playwright/test';
import env from './env';

const escapeRegex = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Port of cy.performGrafanaLogin
export async function grafanaLogin(
  page: Page,
  username: string = env.GRAFANA_USERNAME,
  password: string = env.GRAFANA_PASSWORD
): Promise<void> {
  await page.locator('input[name="user"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.locator('.page-dashboard')).toContainText('Welcome', { timeout: 30000 });
}

// Port of cy.loadGrafanaDashboard: search for the dashboard, open it, and
// wait for a successful panel query before asserting the page title.
export async function loadGrafanaDashboard(page: Page, dashboardName: string): Promise<void> {
  const queryResponse = page.waitForResponse(
    (res) => res.request().method() === 'POST' && res.url().includes('/query'),
    { timeout: 30000 }
  );

  await page.locator('input[placeholder="Search for dashboards and folders"]').fill(dashboardName);

  const row = page
    .locator(`div[data-testid*="browse dashboards row ${dashboardName}"]`)
    .or(page.locator(`a[title="${dashboardName}"]`));
  await row.first().click();

  expect((await queryResponse).status()).toBe(200);
  await expect(page).toHaveTitle(new RegExp(escapeRegex(dashboardName)));
}
