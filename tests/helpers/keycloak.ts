// Shared Keycloak SSO login helper. Playwright navigates cross-origin
// transparently, so the old per-package cy.origin() helpers collapse to:
// fill the credentials form, then handle the optional terms (#kc-accept) and
// consent (#kc-login) pages in a loop until back on the app origin.

import type { Page } from '@playwright/test';

// Handle whichever Keycloak page is currently shown. Returns true if a form
// was submitted, false if no known Keycloak form is present (e.g. mid-redirect
// or an auto-submitting SAML response page).
export async function submitKeycloakForm(page: Page, username: string, password: string): Promise<boolean> {
  const usernameInput = page.locator('input#username');
  if (await usernameInput.isVisible().catch(() => false)) {
    await usernameInput.fill(username);
    await page.locator('input#password').fill(password);
    await page.locator('#kc-login').click();
    return true;
  }

  // Terms and conditions page
  const accept = page.locator('#kc-accept');
  if (await accept.isVisible().catch(() => false)) {
    await accept.click();
    return true;
  }

  // Consent page (a #kc-login button without a credentials form)
  const consent = page.locator('#kc-login');
  if (await consent.isVisible().catch(() => false)) {
    await consent.click();
    return true;
  }

  return false;
}

// Complete a Keycloak login flow after the caller has triggered the redirect
// to Keycloak (e.g. by clicking an SSO button). Loops through credential,
// terms, and consent pages until navigation returns to the app.
// The check is hostname-based so a scheme rewrite by the app (e.g. the
// Twistlock SAML callback returning an http location) still terminates.
export async function completeKeycloakLogin(
  page: Page,
  appOrigin: string,
  username: string,
  password: string
): Promise<void> {
  const appHost = new URL(appOrigin).hostname;

  for (let attempt = 0; attempt < 15; attempt++) {
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    if (new URL(page.url()).hostname === appHost) return;

    const submitted = await submitKeycloakForm(page, username, password);
    if (!submitted) {
      // Page is still redirecting (or auto-submitting a SAML response)
      await page.waitForTimeout(1000);
    }
  }

  throw new Error(`Keycloak login did not return to ${appOrigin}; still at ${page.url()}`);
}
