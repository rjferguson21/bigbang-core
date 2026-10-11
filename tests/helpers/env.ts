// Central env handling for the shared Big Bang Playwright suite.
// Every URL the old in-chart cypress envs supplied becomes an env var with a
// default pointing at the in-cluster-external (VirtualService) route.

const DOMAIN = process.env.DOMAIN || 'dev.bigbang.mil';

const serviceUrl = (name: string, host: string): string => process.env[name] || `https://${host}.${DOMAIN}`;

const bool = (name: string, def = false): boolean => {
  const value = process.env[name];
  if (value === undefined || value === '') return def;
  return String(value).toLowerCase() === 'true';
};

export interface Env {
  DOMAIN: string;

  // Service URLs
  GRAFANA_URL: string;
  PROMETHEUS_URL: string;
  ALERTMANAGER_URL: string;
  KIALI_URL: string;
  KIBANA_URL: string;
  KEYCLOAK_URL: string;
  NEUVECTOR_URL: string;
  TWISTLOCK_URL: string;
  POLICYREPORTER_URL: string;
  GITLAB_URL: string;
  TEMPO_DATASOURCE: string;
  SAML_METADATA_URL: string;

  // Feature toggles
  BIGBANG_INTEGRATION: boolean;
  TWISTLOCK_LICENSE_TEST: boolean;
  EXPECT_LOGS: boolean;
  CHECK_DATASOURCE: boolean;
  CHECK_DATA: boolean;
  KEYCLOAK_TEST_ENABLE: boolean;

  // Credentials
  GRAFANA_USERNAME: string;
  GRAFANA_PASSWORD: string;
  ELASTIC_PASSWORD: string;
  KEYCLOAK_USERNAME: string;
  KEYCLOAK_PASSWORD: string;
  TNR_USERNAME: string;
  TNR_PASSWORD: string;
  NEUVECTOR_PASSWORD: string;
  TWISTLOCK_USERNAME: string;
  TWISTLOCK_PASSWORD: string;
  GITLAB_FIRST_NAME: string;
  GITLAB_LAST_NAME: string;
  GITLAB_USERNAME: string;
  GITLAB_PASSWORD: string;
  GITLAB_EMAIL: string;
  GITLAB_PROJECT: string;
  GITLAB_ADMIN_PASSWORD: string;
}

const env: Env = {
  DOMAIN,

  // Service URLs
  GRAFANA_URL: serviceUrl('GRAFANA_URL', 'grafana'),
  PROMETHEUS_URL: serviceUrl('PROMETHEUS_URL', 'prometheus'),
  ALERTMANAGER_URL: serviceUrl('ALERTMANAGER_URL', 'alertmanager'),
  KIALI_URL: serviceUrl('KIALI_URL', 'kiali'),
  KIBANA_URL: serviceUrl('KIBANA_URL', 'kibana'),
  KEYCLOAK_URL: serviceUrl('KEYCLOAK_URL', 'keycloak'),
  NEUVECTOR_URL: serviceUrl('NEUVECTOR_URL', 'neuvector'),
  TWISTLOCK_URL: serviceUrl('TWISTLOCK_URL', 'twistlock'),
  POLICYREPORTER_URL: serviceUrl('POLICYREPORTER_URL', 'policyreporter'),
  GITLAB_URL: serviceUrl('GITLAB_URL', 'gitlab'),
  // Loki and Tempo are validated through Grafana; the Tempo datasource address
  // is kept for parity with the old cypress envs (cypress_tempo_datasource).
  TEMPO_DATASOURCE: process.env.TEMPO_DATASOURCE || 'http://tempo-tempo.tempo.svc:3200',
  // Keycloak SAML descriptor for the Twistlock SSO test; unset skips the
  // certificate sync (matches the old cypress_saml_metadata_url behavior).
  SAML_METADATA_URL: process.env.SAML_METADATA_URL || '',

  // Feature toggles
  BIGBANG_INTEGRATION: bool('BIGBANG_INTEGRATION', true), // bb-package releases use Big Bang naming
  TWISTLOCK_LICENSE_TEST: bool('TWISTLOCK_LICENSE_TEST'),
  EXPECT_LOGS: bool('EXPECT_LOGS'),
  CHECK_DATASOURCE: bool('CHECK_DATASOURCE'),
  CHECK_DATA: bool('CHECK_DATA'), // checks that need the monitoring stack (kiali's cypress check_data)
  KEYCLOAK_TEST_ENABLE: bool('KEYCLOAK_TEST_ENABLE'),

  // Credentials (defaults match the old cypress envs)
  GRAFANA_USERNAME: process.env.GRAFANA_USERNAME || 'admin',
  GRAFANA_PASSWORD: process.env.GRAFANA_PASSWORD || 'prom-operator',
  ELASTIC_PASSWORD: process.env.ELASTIC_PASSWORD || '',
  KEYCLOAK_USERNAME: process.env.KEYCLOAK_USERNAME || 'admin',
  KEYCLOAK_PASSWORD: process.env.KEYCLOAK_PASSWORD || 'password',
  TNR_USERNAME: process.env.TNR_USERNAME || 'cypress',
  TNR_PASSWORD: process.env.TNR_PASSWORD || 'tnr_w!G33ZyAt@C8',
  NEUVECTOR_PASSWORD: process.env.NEUVECTOR_PASSWORD || 'admin', // fresh consoles: factory default + forced reset modal
  TWISTLOCK_USERNAME: process.env.TWISTLOCK_USERNAME || 'admin',
  TWISTLOCK_PASSWORD: process.env.TWISTLOCK_PASSWORD || 'change_this_password',
  GITLAB_FIRST_NAME: process.env.GITLAB_FIRST_NAME || 'test',
  GITLAB_LAST_NAME: process.env.GITLAB_LAST_NAME || 'user',
  GITLAB_USERNAME: process.env.GITLAB_USERNAME || 'testuser',
  GITLAB_PASSWORD: process.env.GITLAB_PASSWORD || 'Password123h56a78',
  GITLAB_EMAIL: process.env.GITLAB_EMAIL || 'testuser@example.com',
  GITLAB_PROJECT: process.env.GITLAB_PROJECT || 'my-awesome-project',
  GITLAB_ADMIN_PASSWORD: process.env.GITLAB_ADMIN_PASSWORD || '', // root password; discovered from the cluster secret
};

export default env;
