// Ported from alloy-bb-package/chart/tests/cypress/e2e/01-validate-service-monitors.cy.js

import { test } from '@playwright/test';
import env from '../helpers/env';
import { validatePromTarget } from '../helpers/prometheus';

test.describe('Alloy Targets', () => {
  test('Validate Alloy Logs service monitors are running', async ({ page }) => {
    const monitor = env.BIGBANG_INTEGRATION
      ? 'serviceMonitor/alloy/alloy-logs/0'
      : 'serviceMonitor/alloy/alloy-alloy-logs/0';

    await page.goto(`${env.PROMETHEUS_URL}/targets`);
    await validatePromTarget(page, monitor);
  });
});
