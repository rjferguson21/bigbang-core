// Ported from kiali/chart/tests/cypress/e2e/kiali-health.cy.js

import { test, expect, type Page } from '@playwright/test';
import env from '../helpers/env';
import { completeKeycloakLogin } from '../helpers/keycloak';

const consoleUrl = `${env.KIALI_URL}/kiali/`;

// Call the Kiali API from inside the page: page.request resolves hosts with
// Node's resolver, which ignores the --host-resolver-rules mapping that
// points *.DOMAIN at the gateway (CI has no /etc/hosts entries), and an
// in-page fetch also carries the session cookie after a Keycloak login.
async function apiGet<T>(page: Page, path: string): Promise<{ status: number; body: T | null }> {
  return page.evaluate(async (p) => {
    const res = await fetch(p);
    return { status: res.status, body: (await res.json().catch(() => null)) as T | null };
  }, path);
}

test.beforeEach(async ({ page }) => {
  await page.goto(consoleUrl);

  if (env.KEYCLOAK_TEST_ENABLE) {
    const kialiOrigin = new URL(env.KIALI_URL).origin;
    await completeKeycloakLogin(page, kialiOrigin, env.TNR_USERNAME, env.TNR_PASSWORD);
    const info = await apiGet(page, '/kiali/api/auth/info');
    expect(info.status).toBe(200);
  }
});

test.describe('Kiali', () => {
  test('Console loads', async ({ page }) => {
    await expect(page.locator('#nav-toggle')).toBeVisible({ timeout: 30000 });
    await expect(page).toHaveTitle(/Kiali/);
  });

  test('Namespaces are discovered', async ({ page }) => {
    const namespaces = await apiGet<Array<{ name: string }>>(page, '/kiali/api/namespaces');
    expect(namespaces.status).toBe(200);
    expect((namespaces.body ?? []).map((ns) => ns.name)).toContain('istio-system');
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

    const status = await apiGet<Array<{ name: string; status: string; is_core: boolean }>>(page, '/kiali/api/istio/status');
    expect(status.status).toBe(200);
    const broken = (status.body ?? []).filter((c) => /unreachable|unhealthy/i.test(c.status));
    expect(broken, `unhealthy components: ${broken.map((c) => `${c.name}=${c.status}`).join(', ')}`).toEqual([]);
  });

  test('Graph renders traffic for the monitoring namespace', async ({ page }) => {
    test.skip(!env.CHECK_DATA, 'CHECK_DATA is not enabled');

    await page.goto(`${env.KIALI_URL}/kiali/console/graph/namespaces/?namespaces=monitoring`);
    await expect(page.locator('#graph-side-panel')).toBeVisible({ timeout: 60000 });
  });
});
