// Ported from kiali/chart/tests/cypress/e2e/kiali-health.cy.js

import { test, expect } from '@playwright/test';
import env from '../helpers/env';
import { completeKeycloakLogin } from '../helpers/keycloak';

const consoleUrl = `${env.KIALI_URL}/kiali/`;

test.beforeEach(async ({ page }) => {
  await page.goto(consoleUrl);

  if (env.KEYCLOAK_TEST_ENABLE) {
    const kialiOrigin = new URL(env.KIALI_URL).origin;
    await completeKeycloakLogin(page, kialiOrigin, env.TNR_USERNAME, env.TNR_PASSWORD);
    const info = await page.request.get(`${env.KIALI_URL}/kiali/api/auth/info`);
    expect(info.status()).toBe(200);
  }
});

test.describe('Kiali', () => {
  test('Console loads', async ({ page }) => {
    await expect(page.locator('#nav-toggle')).toBeVisible({ timeout: 30000 });
    await expect(page).toHaveTitle(/Kiali/);
  });

  test('Namespaces are discovered', async ({ page }) => {
    const namespaces = await page.request.get(`${env.KIALI_URL}/kiali/api/namespaces`);
    expect(namespaces.status()).toBe(200);
    const names = ((await namespaces.json()) as Array<{ name: string }>).map((ns) => ns.name);
    expect(names).toContain('istio-system');
  });

  test('Traffic graph and applications pages open', async ({ page }) => {
    await page.goto(`${env.KIALI_URL}/kiali/console/graph/namespaces/`);
    await expect(page.locator('nav a[aria-current="page"]')).toContainText('Traffic Graph', { timeout: 30000 });

    await page.goto(`${env.KIALI_URL}/kiali/console/applications`);
    await expect(page.locator('nav a[aria-current="page"]')).toContainText('Applications', { timeout: 30000 });
  });

  // The remaining checks need the monitoring stack (Kiali's Prometheus
  // backend); the core-minimal CI profile deploys Kiali without it.
  test('Mesh components are reachable', async ({ page }) => {
    test.skip(!env.CHECK_DATA, 'CHECK_DATA is not enabled');

    const status = await page.request.get(`${env.KIALI_URL}/kiali/api/istio/status`);
    expect(status.status()).toBe(200);
    const components = (await status.json()) as Array<{ name: string; status: string; is_core: boolean }>;
    const broken = components.filter((c) => /unreachable|unhealthy/i.test(c.status));
    expect(broken, `unhealthy components: ${broken.map((c) => `${c.name}=${c.status}`).join(', ')}`).toEqual([]);
  });

  test('Graph renders traffic for the monitoring namespace', async ({ page }) => {
    test.skip(!env.CHECK_DATA, 'CHECK_DATA is not enabled');

    await page.goto(`${env.KIALI_URL}/kiali/console/graph/namespaces/?namespaces=monitoring`);
    await expect(page.locator('#graph-side-panel')).toBeVisible({ timeout: 60000 });
  });
});
