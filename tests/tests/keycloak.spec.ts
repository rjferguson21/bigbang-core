// Ported from keycloak-bb-package/chart/tests/cypress/e2e/keycloak-health.spec.cy.js
// The source spec was one continuous admin-console session split across
// sequential it() blocks; it is merged into a single test here.

import { test, expect } from '@playwright/test';
import env from '../helpers/env';

test.describe('Keycloak', () => {
  test('admin console is accessible and allows login', async ({ page }) => {
    await page.goto(`${env.KEYCLOAK_URL}/auth/admin`);

    // should render the header
    await expect(page.locator('div[id="kc-header-wrapper"]')).toBeVisible({ timeout: 30000 });

    // should allow login
    await page.locator('input[id="username"]').fill(env.KEYCLOAK_USERNAME);
    await page.locator('input[id="password"]').fill(env.KEYCLOAK_PASSWORD);
    await page.locator('#kc-login').click();

    await page.waitForURL((url) => url.pathname === '/auth/admin/master/console/', { timeout: 10000 });
    await expect(page).toHaveTitle('Keycloak Administration Console');

    // The remaining checks need the baby-yoda realm and Cypress test user,
    // which only exist when Big Bang's dev realm import has run (CI).
    if (!env.KEYCLOAK_TEST_ENABLE) return;

    // should allow enabling the test user
    await page.locator('[data-testid="nav-item-realms"]').click();
    await page
      .locator('[data-ouia-component-type="PF5/TableRow"]')
      .filter({ hasText: 'baby-yoda' })
      .getByText('baby-yoda')
      .first()
      .click({ force: true });

    await page.locator('[data-testid="nav-item-users"]').click();
    await expect(page.locator('body')).toContainText('Cypress');

    if (env.KEYCLOAK_TEST_ENABLE) {
      await page.goto(`${env.KEYCLOAK_URL}/auth/realms/baby-yoda/account`);
      await page.waitForTimeout(2000);

      // Port of cy.performKeycloakLogin: credentials, then consent if shown
      await page.locator('input[id="username"]').fill(env.TNR_USERNAME);
      await page.locator('input[id="password"]').fill(env.TNR_PASSWORD);
      await page.locator('#kc-login').click();
      await page.waitForLoadState('domcontentloaded');

      const accept = page.locator('#kc-accept');
      if (await accept.isVisible().catch(() => false)) {
        await accept.click();
        await page.locator('#kc-login').click();
      }
      await page.waitForTimeout(500);
    }
  });
});
