// Ported from elasticsearch-kibana-bb-package/chart/tests/cypress/e2e/01-kibana-health.cy.js

import { test, expect, type Page, type APIRequestContext } from '@playwright/test';
import env from '../helpers/env';
import { completeKeycloakLogin } from '../helpers/keycloak';

const elasticAuth = 'Basic ' + Buffer.from(`elastic:${env.ELASTIC_PASSWORD}`).toString('base64');

async function kibanaLogin(page: Page, request: APIRequestContext): Promise<void> {
  await page.goto(`${env.KIBANA_URL}/login`);
  await expect(page).toHaveTitle('Elastic');

  await request.post(`${env.KIBANA_URL}/api/data_views/data_view`, {
    headers: {
      Authorization: elasticAuth,
      'kbn-xsrf': 'true',
    },
    data: {
      data_view: {
        title: 'logstash-*',
        name: 'logstash-*',
        timeFieldName: '@timestamp',
        allowNoIndex: true,
      },
      override: true,
    },
  });

  if (env.KEYCLOAK_TEST_ENABLE) {
    // fresh clusters have no role mapping for SSO users; create an idempotent one
    await request.post(`${env.KIBANA_URL}/internal/security/role_mapping/cypress-sso`, {
      headers: {
        Authorization: elasticAuth,
        'kbn-xsrf': 'true',
        'x-elastic-internal-origin': 'kibana',
        'elastic-api-version': '1',
      },
      data: {
        roles: ['viewer'],
        enabled: true,
        rules: { field: { username: env.TNR_USERNAME } },
      },
    });

    await page.locator('[data-test-subj="loginCard-oidc/oidc1"]').click({ timeout: 30000 });
    await completeKeycloakLogin(page, new URL(env.KIBANA_URL).origin, env.TNR_USERNAME, env.TNR_PASSWORD);
    await page.waitForURL((url) => url.pathname === '/app/home', { timeout: 30000 });
    return;
  }

  await page.locator('input[name="username"]').fill('elastic');
  await page.locator('input[name="password"]').fill(env.ELASTIC_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => url.pathname === '/app/home', { timeout: 10000 });
}

test.beforeEach(async ({ page, request }) => {
  await kibanaLogin(page, request);
});

test.describe('Check Login And Home Page', () => {
  test('Check Home Page', async ({ page }) => {
    await page.goto(`${env.KIBANA_URL}/app/home`);
    // In Package pipelines, no configurations are passed so matches on "Welcome to Elastic"
    // while in BB, configurations change the landing page to "Welcome home"
    await expect(page.locator('body')).toContainText(/Welcome to Elastic|Welcome home/);
  });
});

test.describe('Check Indices', () => {
  test('Check for existing indices', async ({ page }) => {
    test.skip(!env.EXPECT_LOGS, 'EXPECT_LOGS is not enabled');

    await page.goto(`${env.KIBANA_URL}/app/management/data/index_management/indices`);
    await expect(page.locator('th.euiTableRowCell').first()).toBeVisible({ timeout: 10000 });
  });
});
