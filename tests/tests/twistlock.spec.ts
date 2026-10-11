// Ported from twistlock-bb-package/chart/tests/cypress/e2e/twistlock-health.cy.js

import { test, expect, type Page, type APIRequestContext } from '@playwright/test';
import env from '../helpers/env';
import { completeKeycloakLogin } from '../helpers/keycloak';

// Match the disposable CI realm's signing certificate without replacing other
// SAML settings. Skipped when SAML_METADATA_URL is unset.
async function configureTestSamlCertificate(
  request: APIRequestContext,
  url: string,
  user: string,
  password: string
): Promise<void> {
  if (!env.SAML_METADATA_URL) return;

  const metadata = await (await request.get(env.SAML_METADATA_URL)).text();
  const signingBlock = metadata.match(/<[^>]*KeyDescriptor[^>]*use="signing"[\s\S]*?<\/[^>]*KeyDescriptor\s*>/)?.[0];
  const certificate = signingBlock
    ?.match(/<[^>]*X509Certificate[^>]*>([\s\S]*?)<\//)?.[1]
    ?.replace(/\s/g, '');
  expect(Boolean(certificate), 'Keycloak SAML signing certificate').toBe(true);

  const auth = await (await request.post(`${url}/api/v1/authenticate`, {
    data: { username: user, password },
  })).json();
  const headers = { Authorization: `Bearer ${auth.token}` };

  const settings = await (await request.get(`${url}/api/v1/settings/saml`, { headers })).json();
  expect(settings.enabled, 'SAML configured by the chart').toBe(true);

  const configured = (settings.cert || '').replace(/-----[^-]+-----|\s/g, '');
  if (configured === certificate) return;
  const update = await request.post(`${url}/api/v1/settings/saml`, {
    headers,
    data: { ...settings, cert: `-----BEGIN CERTIFICATE-----\n${certificate}\n-----END CERTIFICATE-----` },
  });
  expect(update.status()).toBe(200);
}

async function completeTwistlockKeycloakLogin(page: Page, appUrl: string): Promise<void> {
  // The SAML callback POST returns a 303 to the console
  const samlCallback = page.waitForResponse(
    (res) => res.url().startsWith(`${appUrl}/api/v1/authenticate`) && res.request().method() === 'POST',
    { timeout: 60000 }
  );

  // Select the SAML auth method if the console defaults to Local / LDAP
  const authButton = page.locator('button').filter({ hasText: /Local\s*\/\s*LDAP|SAML/ }).first();
  await authButton.waitFor({ timeout: 30000 });
  if ((await authButton.innerText()).trim() !== 'SAML') {
    await authButton.click();
    await page.locator('a').filter({ hasText: 'SAML' }).click();
  }
  await expect(page.locator('button').filter({ hasText: 'SAML' }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Log in' }).click();

  await completeKeycloakLogin(page, appUrl, env.TNR_USERNAME, env.TNR_PASSWORD);

  const response = await samlCallback;
  expect(response.status(), 'SAML callback').toBe(303);
  // Console emits the backend HTTP scheme when TLS terminates at the public gateway.
  // Use the configured external scheme after verifying that the callback host is unchanged.
  const expected = new URL(appUrl);
  const returned = new URL(response.headers()['location'], appUrl);
  expect(returned.hostname, 'SAML return host').toBe(expected.hostname);
  if (returned.protocol !== expected.protocol) {
    returned.protocol = expected.protocol;
    await page.goto(returned.href);
  }

  expect(new URL(page.url()).hostname, 'returned to Twistlock').toBe(expected.hostname);
  await expect(page.getByText('Manage').first()).toBeVisible({ timeout: 60000 });
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
}

test.describe('Check TL', () => {
  test('Log in and verify the authenticated console license', async ({ page, request }) => {
    test.slow(); // SAML round-trips and console startup can be slow

    const url = env.TWISTLOCK_URL.replace(/\/$/, '');
    const ssoEnabled = env.KEYCLOAK_TEST_ENABLE;

    if (ssoEnabled) {
      await configureTestSamlCertificate(request, url, env.TWISTLOCK_USERNAME, env.TWISTLOCK_PASSWORD);
    }

    // License verification needs an installed Twistlock license (CI installs
    // one via init.license); skip the capture on unlicensed dev consoles.
    const licenseExpected = env.TWISTLOCK_LICENSE_TEST;
    // Capture the license API call made with the authenticated session
    const licensePromise = licenseExpected && page.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/settings/license') &&
        (res.request().headers()['authorization'] || '').startsWith('Bearer eyJ'),
      { timeout: 120000 }
    );

    await page.goto(`${url}/#!/manage/system/license`);

    if (ssoEnabled) {
      await completeTwistlockKeycloakLogin(page, url);
    } else {
      await page.locator('input[type="text"]').first().fill(env.TWISTLOCK_USERNAME);
      await page.locator('input[type="password"]').first().fill(env.TWISTLOCK_PASSWORD);
      await page.locator('button[type="submit"]').first().click();
      await expect(page.getByText('Manage').first()).toBeVisible({ timeout: 60000 });
    }

    if (!licenseExpected || !licensePromise) return;
    const licenseResponse = await licensePromise;
    expect(licenseResponse.status(), 'authenticated license API').toBe(200);
    const license = await licenseResponse.json();
    expect(typeof license, 'license').toBe('object');
    expect(typeof license.expiration_date, 'license expiration').toBe('string');
    expect(license.expiration_date).not.toBe('');

    if (ssoEnabled) {
      const authorization = licenseResponse.request().headers()['authorization'] || '';
      const token = authorization.replace(/^Bearer /i, '');
      expect(Boolean(token), 'SSO session used by the console').toBe(true);
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const session = JSON.parse(Buffer.from(payload, 'base64').toString());
      expect(session.user, 'authenticated SSO user').toBe(env.TNR_USERNAME);

      const users = await (await page.request.get(`${url}/api/v1/users`, {
        headers: { Authorization: authorization },
      })).json();
      const account = users.find((u: { username: string }) => u.username === session.user);
      expect(account?.authType, 'authenticated SAML account type').toBe('saml');
    }

    await page.goto(`${url}/#!/manage/system/license`);
    await expect(page.getByText('Manage').first()).toBeVisible();
    await expect(page.getByText('Prisma Cloud license').first()).toBeVisible();
    const tourDismiss = page.locator('button.tw-tour-dismiss');
    if (await tourDismiss.first().isVisible().catch(() => false)) {
      await tourDismiss.first().click();
    }
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
  });
});
