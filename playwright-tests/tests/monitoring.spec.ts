// Ported from monitoring-bb-package/chart/tests/cypress/e2e/
//   01-alertmanager-healthspec.cy.js
//   02-prometheus-healthspec.cy.js
//   03-monitoring-targets-up.cy.js
// The shared login.cy.js helper is replaced by helpers/keycloak.ts.

import { test, expect, type Page } from '@playwright/test';
import env from '../helpers/env';
import { completeKeycloakLogin } from '../helpers/keycloak';
import { grafanaLogin } from '../helpers/grafana';
import { validatePromTarget } from '../helpers/prometheus';

// Visit a monitoring URL and complete the authservice/Keycloak redirect when
// SSO is enabled (port of the "wrapInAppOrigin" logic from the cypress specs).
async function visitWithSso(page: Page, url: string): Promise<void> {
  const appOrigin = new URL(url).origin;
  await page.goto(url);
  if (env.KEYCLOAK_TEST_ENABLE && !page.url().startsWith(appOrigin)) {
    await completeKeycloakLogin(page, appOrigin, env.TNR_USERNAME, env.TNR_PASSWORD);
    await page.goto(url);
  }
}

test.describe('Alertmanager unit testing', () => {
  test('Test alertmanager UI loads and groups expand', async ({ page }) => {
    await visitWithSso(page, env.ALERTMANAGER_URL);

    // Verify Alertmanager API is healthy before testing UI
    const healthy = await page.request.get(`${env.ALERTMANAGER_URL}/-/healthy`);
    expect(healthy.status()).toBe(200);

    await page.reload();
    await page.getByText('Expand all groups').click({ timeout: 30000 });
    await page.getByText('Collapse all groups').click();
  });
});

test.describe('Basic prometheus', () => {
  test('Visits the prometheus sign in page', async ({ page }) => {
    const appOrigin = new URL(env.PROMETHEUS_URL).origin;
    await page.goto(env.PROMETHEUS_URL);

    if (env.KEYCLOAK_TEST_ENABLE && !page.url().startsWith(appOrigin)) {
      await completeKeycloakLogin(page, appOrigin, env.TNR_USERNAME, env.TNR_PASSWORD);
    } else if (!env.KEYCLOAK_TEST_ENABLE && (await page.locator('input[name="user"]').count()) !== 0) {
      await grafanaLogin(page, 'admin', 'prom-operator');
    }

    // Run a query and verify it completes without error
    await page.locator('div.cm-line').first().click({ timeout: 30000 });
    await page.keyboard.type('kube_node_info');
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Execute' }).click();

    await page.waitForTimeout(1000);
    await expect(page.locator('body')).not.toContainText('Error executing query');
  });
});

test.describe('Monitoring Targets', () => {
  test.beforeEach(async ({ page }) => {
    await visitWithSso(page, `${env.PROMETHEUS_URL}/targets`);
  });

  test('Validate Prometheus internal metrics are being scraped', async ({ page }) => {
    test.skip(!env.BIGBANG_INTEGRATION, 'only applies to Big Bang integration');
    await validatePromTarget(page, 'serviceMonitor/monitoring/monitoring-monitoring-kube-prometheus/0');
    await validatePromTarget(page, 'serviceMonitor/monitoring/monitoring-monitoring-kube-prometheus/1');
    await validatePromTarget(page, 'serviceMonitor/monitoring/monitoring-monitoring-kube-operator/0');
  });

  test('Validate Prometheus Node Exporter metrics are being scraped', async ({ page }) => {
    if (env.BIGBANG_INTEGRATION) {
      await validatePromTarget(page, 'serviceMonitor/monitoring/monitoring-monitoring-prometheus-node-exporter/0');
    } else {
      await validatePromTarget(page, 'serviceMonitor/monitoring/monitoring-prometheus-node-exporter/0');
    }
  });

  test('Validate Prometheus Kube State Metrics', async ({ page }) => {
    if (env.BIGBANG_INTEGRATION) {
      await validatePromTarget(page, 'serviceMonitor/monitoring/monitoring-monitoring-kube-state-metrics/0');
      await validatePromTarget(page, 'serviceMonitor/monitoring/monitoring-monitoring-kube-coredns/0');
      await validatePromTarget(page, 'serviceMonitor/monitoring/monitoring-monitoring-kube-apiserver/0');
    } else {
      await validatePromTarget(page, 'serviceMonitor/monitoring/monitoring-kube-state-metrics/0');
      await validatePromTarget(page, 'serviceMonitor/monitoring/monitoring-kube-prometheus-coredns/0');
      await validatePromTarget(page, 'serviceMonitor/monitoring/monitoring-kube-prometheus-apiserver/0');
    }
  });

  test('Validate Prometheus Kubelet Targets', async ({ page }) => {
    if (env.BIGBANG_INTEGRATION) {
      await validatePromTarget(page, 'serviceMonitor/monitoring/monitoring-monitoring-kube-kubelet/0');
      await validatePromTarget(page, 'serviceMonitor/monitoring/monitoring-monitoring-kube-kubelet/1');
      await validatePromTarget(page, 'serviceMonitor/monitoring/monitoring-monitoring-kube-kubelet/2');
    } else {
      await validatePromTarget(page, 'serviceMonitor/monitoring/monitoring-kube-prometheus-kubelet/0');
    }
  });
});

test.describe('Prometheus Targets Test', () => {
  test('Test should fetch and verify Prometheus targets', async ({ request }) => {
    const response = await request.get(`${env.PROMETHEUS_URL}/api/v1/targets`);
    const { data } = await response.json();

    expect(data).toHaveProperty('activeTargets');
    expect(data).toHaveProperty('droppedTargets');

    for (const target of data.activeTargets) {
      expect(target).toHaveProperty('scrapePool');
      expect(target).toHaveProperty('scrapeUrl');
      expect(target).toHaveProperty('health');
      expect(['up', 'down', 'unknown']).toContain(target.health);
    }

    const expectedPool = env.BIGBANG_INTEGRATION
      ? 'serviceMonitor/monitoring/monitoring-monitoring-kube-prometheus/0'
      : 'serviceMonitor/monitoring/monitoring-kube-prometheus-prometheus/0';
    const target = data.activeTargets.find((t: { scrapePool: string }) => t.scrapePool === expectedPool);
    expect(target).toBeTruthy();
    expect(target.health).toBe('up');
  });
});
