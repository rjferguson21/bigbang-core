// Ported from gitlab/chart/tests/cypress/e2e/01-gitlab-health-spec.cy.js

import { test, expect, type Page } from '@playwright/test';
import env from '../helpers/env';
import { completeKeycloakLogin } from '../helpers/keycloak';

const url = env.GITLAB_URL.replace(/\/$/, '');

// The old cypress flow is stateful: signup -> root approves -> user creates a
// project -> root deletes the user. Keep the ordering and stop on failure.
test.describe.configure({ mode: 'serial' });

const projectOwner = (): string => (env.KEYCLOAK_TEST_ENABLE ? env.TNR_USERNAME : env.GITLAB_USERNAME);

const csrfToken = async (page: Page): Promise<string> =>
  (await page.locator('meta[name="csrf-token"]').getAttribute('content')) || '';

// Same-origin fetch from inside the page: inherits the browser's session
// cookies AND its host-resolver-rules (GATEWAY_IP); a Node-side request
// context would resolve through system DNS instead.
async function apiCall(
  page: Page,
  method: string,
  path: string,
  form?: Record<string, string>
): Promise<number> {
  const token = await csrfToken(page);
  return page.evaluate(
    async ({ method, path, form, token }) => {
      const body = form ? new URLSearchParams(form) : undefined;
      const res = await fetch(path, {
        method,
        headers: { 'X-CSRF-Token': token },
        body,
        credentials: 'same-origin',
      });
      return res.status;
    },
    { method, path, form, token }
  );
}

// Close the welcome/redesign popup when GitLab shows one after login
async function dismissWelcomePopup(page: Page): Promise<void> {
  const close = page.locator('button[aria-label="Close"]');
  if (await close.first().isVisible().catch(() => false)) {
    await close.first().click();
    return;
  }
  const getStarted = page.locator('button', { hasText: 'Get started' });
  if (await getStarted.first().isVisible().catch(() => false)) {
    await getStarted.first().click();
  }
}

// First SSO login lands on a /welcome role form before the dashboard
async function completeWelcomeRoleForm(page: Page): Promise<void> {
  if (!page.url().includes('welcome')) return;
  await page.locator('select#user_role').selectOption('software_developer');
  await page.locator('select#user_registration_objective').selectOption('code_storage');
  await page.locator('button[type="submit"]').click();
}

async function gitlabLogin(page: Page, username: string, password: string): Promise<void> {
  await page.goto(`${url}/users/sign_in`);
  await page
    .locator('input[data-testid="username-field"], input#user_login, input[name="user[login]"]')
    .first()
    .fill(username);
  await page
    .locator('input[data-testid="password-field"], input#user_password, input[name="user[password]"]')
    .first()
    .fill(password);
  const submit = page.locator('button[data-testid="sign-in-button"], form#sign-in-form button[type="submit"]');
  if (await submit.first().isVisible().catch(() => false)) {
    await submit.first().click();
  } else {
    await page.locator('form[action="/users/sign_in"] input[type="submit"], form[action="/users/sign_in"] button').first().click();
  }
  await dismissWelcomePopup(page);
}

async function assertGitlabAuthenticated(page: Page): Promise<void> {
  await expect(page).not.toHaveURL(/\/users\/sign_in/, { timeout: 30000 });
  await expect
    .poll(async () => {
      const hasAvatar = (await page.locator('[data-testid="user-avatar-content"]').count()) > 0;
      const text = await page.locator('body').innerText();
      return (
        hasAvatar ||
        text.includes('Welcome to GitLab') ||
        text.includes('Create your first project') ||
        text.includes('Check the restrictions for new users') ||
        text.includes('Web IDE single origin fallback is enabled')
      );
    }, { message: 'authenticated GitLab page markers' })
    .toBe(true);
}

test.describe('GitLab', () => {
  test.skip(!env.GITLAB_ADMIN_PASSWORD, 'GITLAB_ADMIN_PASSWORD unset (gitlab-gitlab-initial-root-password secret not found)');

  test('user can sign up', async ({ page }) => {
    await page.goto(`${url}/users/sign_up`);

    await page.locator('input#new_user_first_name').fill(env.GITLAB_FIRST_NAME);
    await page.locator('input#new_user_last_name').fill(env.GITLAB_LAST_NAME);
    await page.locator('input#new_user_username').fill(env.GITLAB_USERNAME);
    await page.locator('input#new_user_email').fill(env.GITLAB_EMAIL);

    // Give the async username-exists check time to flag an existing user;
    // when it does, the account is already there and signup is a no-op.
    await page.waitForTimeout(3000);
    if ((await page.locator('.validation-error:not(.hide):visible').count()) === 0) {
      await page
        .locator(
          [
            'input[data-testid="new-user-password-field"]',
            'input:not([type="hidden"])#new_user_password',
            'input:not([type="hidden"])[name="new_user[password]"]',
            'input[type="password"]',
          ].join(', ')
        )
        .first()
        .fill(env.GITLAB_PASSWORD);
      await page
        .locator('button[data-testid="new-user-register-button"], button[type="submit"]')
        .first()
        .click();
      await page.waitForLoadState('domcontentloaded');
    }
  });

  test('root can log in and approve the user', async ({ page }) => {
    await gitlabLogin(page, 'root', env.GITLAB_ADMIN_PASSWORD);
    await assertGitlabAuthenticated(page);

    await page.goto(`${url}/admin/users/${env.GITLAB_USERNAME}`);
    if ((await page.locator('body').innerText()).includes('Pending approval')) {
      // Assert the outcome rather than the response code — the endpoint
      // occasionally returns a transient 400 even though a retry succeeds.
      await expect
        .poll(
          async () => {
            await apiCall(page, 'PUT', `/admin/users/${env.GITLAB_USERNAME}/approve`);
            await page.reload();
            return (await page.locator('body').innerText()).includes('Pending approval');
          },
          { message: 'user approved', timeout: 30000 }
        )
        .toBe(false);
    }
  });

  test('user can create and delete a project', async ({ page }) => {
    await page.goto(`${url}/users/sign_in`);
    if (env.KEYCLOAK_TEST_ENABLE) {
      await page.locator('form.js-omniauth-form button[data-testid="oidc-login-button"]').click();
      await completeKeycloakLogin(page, url, env.TNR_USERNAME, env.TNR_PASSWORD);
    } else {
      await gitlabLogin(page, env.GITLAB_USERNAME, env.GITLAB_PASSWORD);
    }
    await dismissWelcomePopup(page);
    await completeWelcomeRoleForm(page);

    // Create the project when it does not exist yet
    if ((await page.locator('.project-row').count()) === 0) {
      await page.goto(url);
      const create = await apiCall(page, 'POST', '/projects', {
        'project[name]': env.GITLAB_PROJECT,
        'project[path]': env.GITLAB_PROJECT,
        'project[visibility_level]': '20',
      });
      expect([200, 302]).toContain(create);

      const project = await page.goto(`${url}/${projectOwner()}/${env.GITLAB_PROJECT}`);
      expect(project?.status(), 'created project is reachable').toBe(200);
    }

    // Cleanup: delete the project
    await page.goto(`${url}/${projectOwner()}/${env.GITLAB_PROJECT}`);
    const remove = await apiCall(page, 'DELETE', `/${projectOwner()}/${env.GITLAB_PROJECT}`);
    expect([200, 202, 204, 302, 404]).toContain(remove);
  });

  test('root can delete the test user', async ({ page }) => {
    await gitlabLogin(page, 'root', env.GITLAB_ADMIN_PASSWORD);
    await dismissWelcomePopup(page);

    await page.goto(`${url}/admin/users/${env.GITLAB_USERNAME}`);
    if (!(await page.locator('body').innerText()).includes('404 - Not Found')) {
      const status = await apiCall(page, 'DELETE', `/admin/users/${env.GITLAB_USERNAME}`);
      expect([200, 202, 204, 302, 404]).toContain(status);
    }
  });
});
