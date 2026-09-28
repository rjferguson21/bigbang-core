// Config-time defaults discovered from the current kubectl context.
//
// Explicit environment variables always win. A `.env` file in the suite root
// is loaded first (KEY=value lines, no expansion). Anything still unset is
// looked up from the cluster with kubectl; lookups are best-effort and
// silently skipped when kubectl or the cluster is unavailable, or when
// SKIP_CLUSTER_DISCOVERY is set.

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

function loadDotEnv(): void {
  const file = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  }
}

function kubectl(cmd: string): string {
  try {
    return execSync(`kubectl ${cmd}`, { timeout: 5000, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return '';
  }
}

function secret(ns: string, name: string, key: string): string {
  const b64 = kubectl(`get secret ${name} -n ${ns} -o jsonpath='{.data.${key}}'`).replace(/^'|'$/g, '');
  if (!b64) return '';
  try {
    return Buffer.from(b64, 'base64').toString();
  } catch {
    return '';
  }
}

function svcLbIp(ns: string, name: string): string {
  return kubectl(`get svc ${name} -n ${ns} -o jsonpath='{.status.loadBalancer.ingress[0].ip}'`).replace(/^'|'$/g, '');
}

export function discover(): void {
  loadDotEnv();
  if (process.env.SKIP_CLUSTER_DISCOVERY) return;

  const defaults: Record<string, () => string> = {
    GATEWAY_IP: () => svcLbIp('istio-gateway', 'public-ingressgateway'),
    PASSTHROUGH_GATEWAY_IP: () => svcLbIp('istio-gateway', 'passthrough-ingressgateway'),
    ELASTIC_PASSWORD: () => secret('logging', 'logging-ek-es-elastic-user', 'elastic'),
    // Fresh consoles use the generated bootstrap password; once the reset
    // modal has run, the spec's fallback password takes over.
    NEUVECTOR_PASSWORD: () => secret('neuvector', 'neuvector-bootstrap-secret', 'bootstrapPassword'),
  };

  for (const [name, lookup] of Object.entries(defaults)) {
    if (process.env[name] === undefined || process.env[name] === '') {
      const value = lookup();
      if (value) process.env[name] = value;
    }
  }
}
