import { defineConfig } from '@playwright/test';
import { discover } from './helpers/cluster';

// Fill unset env vars from .env and the current kubectl context (gateway LB
// IPs, elastic/neuvector passwords). Workers inherit the resolved values.
discover();

export default defineConfig({
  testDir: './tests',
  timeout: 60 * 1000,
  expect: {
    timeout: 15 * 1000,
  },
  retries: process.env.RETRIES !== undefined ? Number(process.env.RETRIES) : 2,
  reporter: 'list',
  use: {
    // Dev/CI clusters use self-signed certs
    ignoreHTTPSErrors: true,
    // Resolve *.$DOMAIN inside the browser without /etc/hosts entries.
    // Keycloak is served by the TLS-passthrough gateway, which has its own
    // LB IP; map it separately (or fall back to the system resolver).
    ...(process.env.GATEWAY_IP
      ? {
          launchOptions: {
            args: [
              // Chromium applies the first matching rule, so the
              // keycloak-specific mapping must precede the wildcard.
              `--host-resolver-rules=${
                process.env.PASSTHROUGH_GATEWAY_IP
                  ? `MAP keycloak.${process.env.DOMAIN || 'dev.bigbang.mil'} ${process.env.PASSTHROUGH_GATEWAY_IP}`
                  : `EXCLUDE keycloak.${process.env.DOMAIN || 'dev.bigbang.mil'}`
              }, MAP *.${process.env.DOMAIN || 'dev.bigbang.mil'} ${process.env.GATEWAY_IP}`,
            ],
          },
        }
      : {}),
    trace: 'on-first-retry',
    viewport: { width: 1920, height: 1080 },
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
