// Ported from neuvector-bb-package/chart/tests/cypress/e2e/01-neuvector-health.cy.js

import { test, expect, type Page } from '@playwright/test';
import env from '../helpers/env';

// Persist a password changed via the reset modal for the rest of this run
let changedPassword: string | null = null;

async function resetPasswordIfPrompted(page: Page): Promise<void> {
  const modal = page.locator('mat-dialog-container app-reset-password-modal');
  if ((await modal.count()) === 0) return;
  const newPwd = 'cypressPwd!1';

  await modal.locator('input[formcontrolname="newPassword"]').fill(newPwd);
  await modal.locator('input[formcontrolname="confirmPassword"]').fill(newPwd);
  const submit = modal.locator('button#reset-password-dialog-submit');
  await expect(submit).toBeEnabled();
  await submit.click();

  await expect(page.locator('mat-dialog-container')).toHaveCount(0, { timeout: 20000 });
  changedPassword = newPwd;
}

async function attemptLogin(page: Page, username: string, password: string): Promise<boolean> {
  await page.goto(env.NEUVECTOR_URL);
  await expect(page).toHaveTitle(/NeuVector/);

  await page.locator('input[id="Email1"]').fill(username);
  await page.locator('input[id="password1"]').fill(password);

  // Accept the EULA checkbox when present
  // Angular Material checkbox: the hidden input never toggles from direct
  // clicks; click the mdc container instead.
  const eula = page.locator('div.mdc-checkbox');
  if ((await eula.count()) !== 0) {
    await eula.click();
  }
  await page.locator('button[type="submit"]').click();

  await page.waitForTimeout(2000);
  await resetPasswordIfPrompted(page);

  // Login success = the app routed to the dashboard
  try {
    await page.waitForURL('**/#/dashboard', { timeout: 20000 });
    return true;
  } catch {
    return false;
  }
}

// Login to NeuVector before each test, falling back to the reset password
test.beforeEach(async ({ page }) => {
  const primary = changedPassword || env.NEUVECTOR_PASSWORD;
  const success = await attemptLogin(page, 'admin', primary);
  if (!success) {
    await attemptLogin(page, 'admin', 'cypressPwd!1');
  }
});

// Basic test that validates Dashboard panels exist
test('Check Dashboard Panels', async ({ page }) => {
  await expect(page.locator('app-exposure-chart')).toBeVisible({ timeout: 30000 });
  await expect(page.locator('app-policy-mode-panel[assettype="services"]')).toBeVisible();
  await expect(page.locator('app-policy-mode-panel[assettype="containers"]')).toBeVisible();
  await expect(page.locator('app-application-protocols-panel')).toBeVisible();
});

// Basic test that validates system component health
test('Check System Components', async ({ page }) => {
  await page.locator('nav.sidebar > ul').getByRole('link', { name: /Assets/ }).click();
  await page.locator('nav.sidebar > ul').getByRole('link', { name: /System Components/ }).click();
  await page.waitForTimeout(2000);

  await expect(
    page
      .locator('div[role="row"] > div[col-id="connection_state"] > app-controllers-grid-status-cell > span')
      .filter({ hasText: 'Connected' })
      .first()
  ).toBeVisible();

  await page.locator('div[role="tablist"]').getByText('Scanners').click();
  await page.waitForTimeout(2000);
  await expect(page.locator('app-scanners-grid').getByText(/[1-9]/).first()).toBeVisible();

  await page.locator('div[role="tablist"]').getByText('Enforcers').click();
  await page.waitForTimeout(2000);
  await expect(
    page
      .locator('div[role="row"] > div[col-id="connection_state"] > app-enforcers-grid-status-cell > span')
      .filter({ hasText: 'Connected' })
      .first()
  ).toBeVisible();
});

// Basic test that scans an image and validates results/success
test('Scan an image', async ({ page }) => {
  test.slow(); // the scan itself can take over a minute

  await page.locator('nav.sidebar > ul').getByRole('link', { name: /Assets/ }).click();
  await page.locator('nav.sidebar > ul').getByRole('link', { name: /Containers/ }).click();
  await page.waitForTimeout(1000);

  // Get a container that has not been scanned
  const row = page
    .locator('div[role="rowgroup"] > div.ag-row')
    .filter({
      has: page.locator('div[col-id="security.scan_summary.status"] > app-containers-grid-status-cell:empty'),
    })
    .first();
  await row.waitFor();
  const rowName = (await row.locator('app-containers-grid-name-cell').first().innerText()).trim();
  const rowId = await row.getAttribute('row-id');
  await row.click();

  // When the scan is complete the grid reloads; wait for that request to fire
  const scanned = page.waitForResponse(
    (res) => res.url().includes('/workload/scanned?start=0&limit=2000'),
    { timeout: 90000 }
  );
  await page.locator('button[aria-label="Scan action"]').click();
  await scanned;

  // Type in container name to ensure row is visible
  await page.locator('app-quick-filter input').fill(rowName);

  // Fetch row by id
  await expect(
    page.locator(`div[role='rowgroup'] > div.ag-row[row-id='${rowId}']`).locator('app-containers-grid-status-cell').first()
  ).toContainText('Finished', { timeout: 60000 });
});
