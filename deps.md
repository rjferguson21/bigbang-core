# Big Bang HelmRelease dependency graph

Extracted from `dependsOn` in `bigbang/chart/templates/*/helmrelease.yaml`.

Conventions:

- `A --> B` means **A depends on B** (B deploys first).
- Many edges are conditional (only rendered when both packages are enabled);
  this graph shows the union of all possible edges.
- **Omitted for readability:** nearly every package also depends on the four
  hubs `gatekeeper`, `kyverno-policies`, `istiod` (+`istio-cni` when enabled,
  via the `istioHelmReleases` helper), and `monitoring`. Only distinctive
  edges are drawn.

```mermaid
graph LR
  subgraph foundation["Foundation (no deps)"]
    gatekeeper
    prometheus-operator-crds
    metrics-server
  end

  subgraph kyverno-group["Kyverno"]
    kyverno
    kyverno-policies
    kyverno-reporter
  end
  kyverno --> gatekeeper
  kyverno --> prometheus-operator-crds
  kyverno-policies --> kyverno
  kyverno-reporter --> kyverno
  kyverno-reporter --> kyverno-policies
  kyverno-reporter --> keycloak

  subgraph istio["Istio"]
    istio-crds
    istiod
    istio-cni
    ztunnel
    istio-gateway
    istio-egress-gateway
  end
  istiod --> istio-crds
  istio-cni --> istiod
  ztunnel --> istiod
  ztunnel --> istio-cni
  istio-gateway --> istiod
  istio-egress-gateway --> istiod

  subgraph monitoring-stack["Monitoring / metrics"]
    cert-manager
    monitoring
    grafana
    thanos
    mimir
    tempo
    kiali
  end
  cert-manager --> prometheus-operator-crds
  monitoring --> cert-manager
  monitoring --> prometheus-operator-crds
  monitoring --> vault
  grafana --> monitoring
  thanos --> monitoring
  mimir --> minio-operator
  tempo --> authservice
  tempo --> monitoring
  kiali --> monitoring
  kiali --> istiod

  subgraph logging["Logging"]
    loki
    alloy
    fluentbit
    eck-operator
    elasticsearch-kibana
  end
  loki --> minio-operator
  alloy --> loki
  fluentbit --> loki
  fluentbit --> elasticsearch-kibana
  fluentbit --> kyverno
  elasticsearch-kibana --> eck-operator

  subgraph storage["Object storage"]
    minio-operator
    minio
  end
  minio --> minio-operator

  subgraph auth["Auth / secrets"]
    keycloak
    authservice
    vault
    external-secrets
  end
  vault --> minio-operator

  subgraph security["Security tools"]
    neuvector
    twistlock
    anchore-enterprise
    fortify
  end
  neuvector --> keycloak
  anchore-enterprise --> keycloak
  anchore-enterprise --> monitoring

  subgraph devtools["Dev tools"]
    gitlab
    gitlab-runner
    sonarqube
    renovate
  end
  gitlab-runner --> gitlab
  gitlab-runner --> kyverno
  renovate --> gitlab
  sonarqube --> keycloak

  subgraph collab["Collaboration"]
    mattermost-operator
    mattermost
  end
  mattermost --> mattermost-operator
  mattermost --> elasticsearch-kibana
  mattermost --> minio-operator

  subgraph other["Standalone (hub deps only)"]
    argocd
    harbor
    headlamp
    velero
    gateway-api
  end
```

## Hub dependencies (omitted above)

| Hub | Depended on by |
|---|---|
| `gatekeeper` | everything (when enabled) |
| `kyverno-policies` | everything (when enabled) |
| `istiod` + `istio-cni` | everything mesh-injected, via `istioHelmReleases` |
| `monitoring` | everything that ships metrics/dashboards |
