<!-- Warning: Do not manually edit this file. See notes on gluon + helm-docs at the end of this file for more information. -->
# twistlock

![Version: 0.30.0-bb.7](https://img.shields.io/badge/Version-0.30.0--bb.7-informational?style=flat-square) ![AppVersion: 34.05.157](https://img.shields.io/badge/AppVersion-34.05.157-informational?style=flat-square) ![Maintenance Track: bb_integrated](https://img.shields.io/badge/Maintenance_Track-bb_integrated-green?style=flat-square)

Twistlock (Prisma Cloud Compute Edition) for Big Bang. This variant delegates Istio and NetworkPolicy configuration to the Big Bang operator via a Package CR instead of bb-common.

## Upstream References

- <https://github.com/PaloAltoNetworks/pcs-metrics-monitoring>

## Upstream Release Notes

- [Find upstream chart's release notes and CHANGELOG here](https://docs.prismacloud.io/en/compute-edition)

## Learn More

- [Application Overview](docs/overview.md)
- [Other Documentation](docs/)

## Pre-Requisites

- Kubernetes Cluster deployed
- Kubernetes config installed in `~/.kube/config`
- Helm installed

Install Helm

https://helm.sh/docs/intro/install/

## Deployment

- Clone down the repository
- cd into directory

```bash
helm install twistlock chart/
```

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| domain | string | `"dev.bigbang.mil"` | domain to use for virtual service |
| monitoring.enabled | bool | `false` | Toggle monitoring integration, only used if init job is enabled, creates required metrics user, serviceMonitor, networkPolicy, etc |
| monitoring.serviceMonitor.scheme | string | `""` |  |
| monitoring.serviceMonitor.tlsConfig | object | `{}` |  |
| sso | object | `{"cert":"","client_id":"","console_url":"","enabled":false,"groups":"","idp_url":"","issuer_uri":"","provider_name":"","provider_type":"shibboleth"}` | Configuration of Twistlock's SAML SSO capability.  This requires `init.enabled`=`true`, valid credentials, and a valid license. Refer to docs/KEYCLOAK.md for additional information. |
| sso.enabled | bool | `false` | Toggle SAML SSO |
| sso.client_id | string | `""` | SAML client ID |
| sso.provider_name | string | `""` | SAML Povider Alias (optional) |
| sso.provider_type | string | `"shibboleth"` | SAML Identity Provider. `shibboleth` is recommended by Twistlock support for Keycloak |
| sso.issuer_uri | string | `""` | Identity Provider url with path to realm, example: `https://keycloak.bigbang.dev/auth/realms/baby-yoda` |
| sso.idp_url | string | `""` | SAML Identity Provider SSO URL, example: `https://keycloak.bigbang.dev/auth/realms/baby-yoda/protocol/saml` |
| sso.console_url | string | `""` | Console URL of the Twistlock app. Example: `https://twistlock.bigbang.dev` (optional) |
| sso.groups | string | `""` | Groups attribute (optional) |
| sso.cert | string | `""` | X.509 Certificate from Identity Provider (i.e. Keycloak). See docs/KEYCLOAK.md for format. Use the `\|-` syntax for multiline string |
| bigbangPackage.enabled | bool | `true` |  |
| bigbangPackage.labels | object | `{}` |  |
| bigbangPackage.annotations | object | `{}` |  |
| bigbangPackage.istio.enabled | bool | `false` | Toggle istio integration |
| bigbangPackage.istio.ambient | object | `{"enabled":false}` | Toggle istio ambient mode (no sidecar) |
| bigbangPackage.istio.mtls | object | `{"mode":"STRICT"}` | Mutual TLS configuration |
| bigbangPackage.istio.mtls.mode | string | `"STRICT"` | STRICT = Allow only mutual TLS traffic, PERMISSIVE = Allow both plain text and mutual TLS traffic |
| bigbangPackage.istio.authorizationPolicies | object | `{"additionalPolicies":{"allow-defender-to-console-port":{"spec":{"action":"ALLOW","rules":[{"to":[{"operation":{"ports":["8084"]}}]}],"selector":{"matchLabels":{"app.kubernetes.io/name":"twistlock-console"}}}}},"enabled":true,"generateFromNetpol":true}` | Authorization policies configuration |
| bigbangPackage.routes.inbound.console.enabled | bool | `true` |  |
| bigbangPackage.routes.inbound.console.gateways[0] | string | `"istio-gateway/public-ingressgateway"` |  |
| bigbangPackage.routes.inbound.console.hosts[0] | string | `"twistlock.{{ .Values.domain }}"` |  |
| bigbangPackage.routes.inbound.console.service | string | `"twistlock-console"` |  |
| bigbangPackage.routes.inbound.console.port | int | `8081` |  |
| bigbangPackage.routes.inbound.console.selector."app.kubernetes.io/name" | string | `"twistlock-console"` |  |
| bigbangPackage.routes.outbound.twistlock-intelligence.enabled | bool | `true` |  |
| bigbangPackage.routes.outbound.twistlock-intelligence.hosts[0] | string | `"intelligence.twistlock.com"` |  |
| bigbangPackage.routes.outbound.twistlock-intelligence.ports[0].number | int | `443` |  |
| bigbangPackage.routes.outbound.twistlock-intelligence.ports[0].name | string | `"https"` |  |
| bigbangPackage.routes.outbound.twistlock-intelligence.ports[0].protocol | string | `"TLS"` |  |
| bigbangPackage.routes.outbound.twistlock-intelligence.location | string | `"MESH_EXTERNAL"` |  |
| bigbangPackage.routes.outbound.twistlock-intelligence.resolution | string | `"DNS"` |  |
| bigbangPackage.networkPolicies.enabled | bool | `true` | Toggle network policies |
| bigbangPackage.networkPolicies.ingress.defaults.enabled | bool | `true` |  |
| bigbangPackage.networkPolicies.ingress.definitions.nodeCidrs.from[0].ipBlock.cidr | string | `"10.0.0.0/8"` |  |
| bigbangPackage.networkPolicies.ingress.definitions.nodeCidrs.from[1].ipBlock.cidr | string | `"172.16.0.0/12"` |  |
| bigbangPackage.networkPolicies.ingress.definitions.nodeCidrs.from[2].ipBlock.cidr | string | `"192.168.0.0/16"` |  |
| bigbangPackage.networkPolicies.ingress.definitions.nodeCidrs.from[3].ipBlock.cidr | string | `"100.64.0.0/10"` |  |
| bigbangPackage.networkPolicies.ingress.definitions.nodeCidrs.ports[0].port | int | `8084` |  |
| bigbangPackage.networkPolicies.ingress.definitions.nodeCidrs.ports[0].protocol | string | `"TCP"` |  |
| bigbangPackage.networkPolicies.ingress.to.twistlock-console:8081.from.k8s.monitoring-monitoring-kube-prometheus@monitoring/prometheus | bool | `false` |  |
| bigbangPackage.networkPolicies.ingress.to.twistlock-console:8081.from.definition.gateway | bool | `true` |  |
| bigbangPackage.networkPolicies.ingress.to.twistlock-console:8084.from.k8s.twistlock/twistlock-defender | bool | `true` |  |
| bigbangPackage.networkPolicies.ingress.to.twistlock-console:8084.from.definition.nodeCidrs | bool | `true` |  |
| bigbangPackage.networkPolicies.egress.defaults.enabled | bool | `true` |  |
| bigbangPackage.networkPolicies.egress.from.*.to.k8s.tempo-tempo@tempo/tempo:9411 | bool | `false` |  |
| bigbangPackage.networkPolicies.egress.from.twistlock-init.to.definition.kubeAPI | bool | `true` |  |
| bigbangPackage.networkPolicies.egress.from.twistlock-console.to.cidr."0.0.0.0/0:443" | bool | `true` |  |
| kyvernoPolicyException.enabled | bool | `true` |  |
| kyvernoPolicyException.namespace | string | `"kyverno"` |  |
| kyvernoPolicyException.policies[0] | string | `"add-default-capability-drop"` |  |
| kyvernoPolicyException.policies[1] | string | `"add-default-securitycontext"` |  |
| kyvernoPolicyException.policies[2] | string | `"disallow-host-namespaces"` |  |
| kyvernoPolicyException.policies[3] | string | `"disallow-tolerations"` |  |
| kyvernoPolicyException.policies[4] | string | `"require-drop-all-capabilities"` |  |
| kyvernoPolicyException.policies[5] | string | `"require-non-root-group"` |  |
| kyvernoPolicyException.policies[6] | string | `"require-non-root-user"` |  |
| kyvernoPolicyException.policies[7] | string | `"restrict-apparmor"` |  |
| kyvernoPolicyException.policies[8] | string | `"restrict-capabilities"` |  |
| kyvernoPolicyException.policies[9] | string | `"restrict-host-path-mount"` |  |
| kyvernoPolicyException.policies[10] | string | `"restrict-host-path-write"` |  |
| kyvernoPolicyException.policies[11] | string | `"restrict-selinux-type"` |  |
| kyvernoPolicyException.policies[12] | string | `"restrict-volume-types"` |  |
| imagePullSecretName | string | `"private-registry"` | Defines the secret to use when pulling the container images |
| selinuxLabel | string | `"disable"` | Run Twistlock Console and Defender with a dedicated SELinux label. See https://docs.docker.com/engine/reference/run/#security-configuration |
| systemd | object | `{"enabled":false}` | systemd configuration |
| systemd.enabled | bool | `false` | option to install Twistlock as systemd service. true or false |
| console.dataRecovery | bool | `true` | Enables or Disables data recovery. Values: true or false. |
| console.image.repository | string | `"registry1.dso.mil/ironbank/twistlock/console/console"` | Full image name for console |
| console.image.tag | string | `"34.05.157"` | Full image tag for console |
| console.image.imagePullPolicy | string | `"IfNotPresent"` | Pull policy for console image |
| console.ports.managementHttp | int | `8081` | Enables the management HTTP listener. |
| console.ports.managementHttps | int | `8083` | Enables the management HTTPS listener. |
| console.ports.communication | int | `8084` | Sets the port for communication between the Defender(s) and the Console |
| console.securityContext | object | `{"capabilities":{"drop":["ALL"]},"readOnlyRootFilesystem":true,"runAsGroup":2674,"runAsNonRoot":true,"runAsUser":2674}` | Sets the container security context for the console |
| console.persistence.size | string | `"100Gi"` | Size of Twistlock PVC |
| console.persistence.accessMode | string | `"ReadWriteOnce"` | Access mode for Twistlock PVC |
| console.extraEnv | list | `[]` | Additional environment variables for the console container. Use this to set Prisma-specific env vars (e.g., CORE_MIN_LOG_LEVEL) without a post-renderer. Example:   extraEnv:     - name: CORE_MIN_LOG_LEVEL       value: "WARNING" |
| console.syslogAuditIntegration | object | `{"enabled":false}` | Enable syslog audit feature When integrating with BigBang, make sure to include an exception to Gatekeeper and/or Kyverno for Volume Types. |
| console.disableCgroupLimits | bool | `false` | Controls console container's resource constraints. Set to "true" to run without limits. See https://docs.docker.com/engine/reference/run/#runtime-constraints-on-resources |
| console.license | string | `""` | The license key to use.  If not specified, the license must be installed manually. |
| console.runAsRoot | bool | `false` | Run Twistlock Console processes as root (default false, twistlock user account). Values: true or false |
| console.credentials | object | `{"password":"change_this_password","username":"admin"}` | Required if init is enabled.  Admin account to use for configuration through API.  Will create account if Twistlock is a new install.  Otherwise, an existing account needs to be provided. |
| console.credentials.username | string | `"admin"` | Username of account |
| console.credentials.password | string | `"change_this_password"` | Password of account |
| console.additionalUsers | list | `[]` | Additional users to setup.  This requires `init.enabled`=`true`, valid credentials, and a valid license. |
| console.updateUsers | bool | `false` | Toggles whether to update the `additionalUsers` if the user is already created (e.g. on upgrades).  This would overwrite the existing user configuration. |
| console.groups | list | `[]` | Additional users to setup.  This requires `init.enabled`=`true`, valid credentials, and a valid license. |
| console.options.enabled | bool | `true` | Toggle setting all options in this section |
| console.options.network | object | `{"container":false,"host":true}` | Network monitoring options |
| console.options.network.container | bool | `false` | Toggle network monitoring of containers. Deprecated upstream (CNNS network-firewall enforcement, see https://docs.prismacloud.io/ce-release-notes/prisma-tm-cloud-compute-edition-release-information/release-notes-34-01#deprecation-notices); defaults to false as it is incompatible with Istio ambient (HBONE/ztunnel). |
| console.options.network.host | bool | `true` | Toggle network monitoring of hosts |
| console.options.logging | bool | `true` | Toggle logging Prisma Cloud events to standard output |
| console.options.telemetry | bool | `false` | Toggle sending product usage data to Palo Alto Networks |
| console.options.intelligence | object | `{"uploadDisabled":true}` | Toggle intelligence settings |
| console.options.intelligence.uploadDisabled | bool | `true` | Disables allowing admins/operators to upload logs to Customer Support directly from the Console UI |
| console.options.scan | object | `{"scanRunningImages":false}` | Toggle scan settings |
| console.options.scan.scanRunningImages | bool | `false` | Only scan images with running containers |
| console.options.logon | object | `{"basicAuthDisabled":false,"requireStrongPassword":true,"useSupportCredentials":false}` | Toggle logon settings |
| console.options.logon.useSupportCredentials | bool | `false` | Enable SSO to Prisma Cloud Support |
| console.options.logon.requireStrongPassword | bool | `true` | Require strong passwords for local accounts |
| console.options.logon.basicAuthDisabled | bool | `false` | Disables basic authentication. Note: Setting to true will prevent metrics scraping |
| console.volumeUpgrade | bool | `true` | This value should be enabled when upgrading from a version <=0.10.0-bb.1 in order to allow the console to run as non-root |
| console.trustedImages | object | `{"enabled":true,"extraGroups":[],"groups":[{"name":"BigBang-Trusted","registryMatches":["registry1.dso.mil/ironbank/*"]}],"rule":{"collections":["All"],"deniedGroups":[],"effect":"alert","name":"BigBang-Trusted"}}` | Trusted images allowlist policy. Despite the name, this is an evaluation policy, not a flat list. The chart manages one rule that allows the declared groups; deniedGroups takes precedence over allowedGroups. |
| console.trustedImages.enabled | bool | `true` | Toggle chart management of the trust policy. When false, existing console state is left alone. |
| console.trustedImages.groups | list | `[{"name":"BigBang-Trusted","registryMatches":["registry1.dso.mil/ironbank/*"]}]` | Trust groups (allowlist bundles) managed by the chart. Each group's name is auto-included in `rule.allowedGroups`. |
| console.trustedImages.extraGroups | list | `[]` | Trust groups appended to `groups` at template time. For overlays (kustomize SMP, subchart values) that need to add without replacing the base list. |
| console.trustedImages.rule | object | `{"collections":["All"],"deniedGroups":[],"effect":"alert","name":"BigBang-Trusted"}` | The single chart-managed rule, prepended to the policy so it evaluates first. |
| console.serviceAccount.automountServiceAccountToken | bool | `false` | Auto-mount the API token on the console ServiceAccount. Default false: the console SA needs no token. Kyverno disallow-auto-mount-service-account-token compliance. |
| deploymentMode | object | `{"defenderOnly":false}` | Deployment mode configuration |
| deploymentMode.defenderOnly | bool | `false` | defender_client_cert_old, defender_client_key_old, admission_cert, admission_key) |
| defender | object | `{"certCn":"","clusterName":"","collectLabels":true,"collect_pod_labels":true,"containerRuntime":"containerd","dockerListenerType":"","dockerSocket":"","enabled":true,"image":{"repository":"registry1.dso.mil/ironbank/twistlock/defender/defender","tag":"34.05.157"},"monitorIstio":true,"monitorServiceAccounts":true,"podLabels":{},"priorityClassName":"","privileged":false,"proxy":{},"readOnlyRootFilesystem":true,"resources":{"limits":{"cpu":"1","memory":"1Gi"},"requests":{"cpu":"256m","memory":"512Mi"}},"secrets":{"admission_cert":"","admission_key":"","defender_ca":"","defender_ca_old":"","defender_client_cert":"","defender_client_cert_old":"","defender_client_key":"","defender_client_key_old":"","service_parameter":""},"securityCapabilitiesAdd":["NET_ADMIN","NET_RAW","SYS_ADMIN","SYS_PTRACE","SYS_CHROOT","MKNOD","SETFCAP","IPC_LOCK"],"securityCapabilitiesDrop":["ALL"],"selinux":true,"serviceAccount":{"automountServiceAccountToken":false},"servicePort":443,"serviceTargetPort":9998,"tolerations":[{"operator":"Exists"}],"uniqueHostName":false,"waitForRollout":true,"ws_address":""}` | Configuration of Twistlock's container defenders.  This requires `init.enabled`=`true`, valid credentials, and a valid license. |
| defender.image | object | `{"repository":"registry1.dso.mil/ironbank/twistlock/defender/defender","tag":"34.05.157"}` | Image for Twistlock defender.  Leave blank to use twistlock official repo. |
| defender.image.repository | string | `"registry1.dso.mil/ironbank/twistlock/defender/defender"` | Repository and path for defender image |
| defender.image.tag | string | `"34.05.157"` | Image tag for defender |
| defender.waitForRollout | bool | `true` | Wait for defender DaemonSet rollout to complete during init |
| defender.clusterName | string | `""` | Name of cluster |
| defender.collectLabels | bool | `true` | Collect Deployment and Namespace labels |
| defender.containerRuntime | string | `"containerd"` | Set containerRuntime option for Defenders ("docker", "containerd", or "crio") |
| defender.dockerSocket | string | `""` | Path to Docker socket.  Leave blank to use /var/run/docker.sock |
| defender.tolerations | list | `[{"operator":"Exists"}]` | List of tolerations to be added to the Defender DaemonSet. |
| defender.podLabels | object | `{}` | Additional labels for Defender pods. When istio ambient mode is enabled, `istio.io/dataplane-mode: none` is added automatically to exclude the hostNetwork Defender from ambient capture (override here if needed) |
| defender.securityCapabilitiesDrop | list | `["ALL"]` | Sets the container security context dropped capabilities for the defenders |
| defender.securityCapabilitiesAdd | list | `["NET_ADMIN","NET_RAW","SYS_ADMIN","SYS_PTRACE","SYS_CHROOT","MKNOD","SETFCAP","IPC_LOCK"]` | Sets the container security context added capabilities for the defenders |
| defender.dockerListenerType | string | `""` | Sets the type of the Docker listener (TCP or NONE) |
| defender.monitorServiceAccounts | bool | `true` | Monitor service accounts |
| defender.monitorIstio | bool | `true` | Monitor Istio |
| defender.readOnlyRootFilesystem | bool | `true` | Security Context: readOnlyRootFileSystem |
| defender.privileged | bool | `false` | Run as privileged.  If `selinux` is `true`, this automatically gets set to `false` |
| defender.proxy | object | `{}` | Proxy settings |
| defender.selinux | bool | `true` | Deploy with SELinux Policy |
| defender.uniqueHostName | bool | `false` | Assign globally unique names to hosts |
| defender.resources | object | `{"limits":{"cpu":"1","memory":"1Gi"},"requests":{"cpu":"256m","memory":"512Mi"}}` | Define resource limits and requests for the Defender DaemonSet |
| defender.priorityClassName | string | `""` | Priority Class Name to prioritize pod scheduling |
| defender.ws_address | string | `""` | Websocket address of the console the defender intends to connect to, generally in the format wss://URL:8084 |
| defender.secrets | object | `{"admission_cert":"","admission_key":"","defender_ca":"","defender_ca_old":"","defender_client_cert":"","defender_client_cert_old":"","defender_client_key":"","defender_client_key_old":"","service_parameter":""}` | These can be obtained from the Twistlock UI or contrib/defenders.sh script.  |
| defender.serviceAccount.automountServiceAccountToken | bool | `false` | Auto-mount the API token on the defender ServiceAccount (both defenderOnly Helm and init-script API paths). Default false: the defender still gets its token via an explicit projected volume (it queries the k8s API for MONITOR_SERVICE_ACCOUNTS / MONITOR_ISTIO / COLLECT_POD_LABELS). |
| policies | object | `{"compliance":{"alertThreshold":"medium","enabled":true,"templates":["DISA STIG","NIST SP 800-190"]},"enabled":true,"name":"Default","runtime":{"enabled":true},"vulnerabilities":{"alertThreshold":"medium","enabled":true}}` | Configures defender policies.  This requires `init.enabled`=`true`, valid credentials, and a valid license. |
| policies.enabled | bool | `true` | Toggles configuration of defender policies |
| policies.name | string | `"Default"` | Name to use as prefix to policy rules. NOTE: If you change the name after the initial deployment, you may end up with duplicate policy sets and need to manually cleanup old policies. |
| policies.vulnerabilities | object | `{"alertThreshold":"medium","enabled":true}` | Vulnerability policies |
| policies.vulnerabilities.enabled | bool | `true` | Toggle deployment and updating of vulnerability policies |
| policies.vulnerabilities.alertThreshold | string | `"medium"` | The minimum severity to alert on |
| policies.compliance | object | `{"alertThreshold":"medium","enabled":true,"templates":["DISA STIG","NIST SP 800-190"]}` | Compliance policies |
| policies.compliance.enabled | bool | `true` | Toggle deployment and updating of compliance policies |
| policies.compliance.templates | list | `["DISA STIG","NIST SP 800-190"]` | The policy templates to use.  Valid values are 'GDPR', 'DISA STIG', 'PCI', 'NIST SP 800-190', or 'HIPAA' |
| policies.compliance.alertThreshold | string | `"medium"` | If template does not apply, set policy to alert using this severity or higher.  Valid values are 'low', 'medium', 'high', or 'critical'. |
| policies.runtime | object | `{"enabled":true}` | Runtime policies |
| policies.runtime.enabled | bool | `true` | Toggle deployment and updating of runtime policies |
| init | object | `{"enabled":true,"image":{"imagePullPolicy":"IfNotPresent","repository":"registry1.dso.mil/ironbank/big-bang/base","tag":"2.1.0"},"resources":{"limits":{"cpu":0.5,"memory":"256Mi"},"requests":{"cpu":0.5,"memory":"256Mi"}},"serviceAccount":{"automountServiceAccountToken":false}}` | Initialization job.  Sets up users, license, container defenders, default policies, and other settings. |
| init.enabled | bool | `true` | Toggles the initialization on or off |
| init.image | object | `{"imagePullPolicy":"IfNotPresent","repository":"registry1.dso.mil/ironbank/big-bang/base","tag":"2.1.0"}` | Initialization job image configuration |
| init.image.repository | string | `"registry1.dso.mil/ironbank/big-bang/base"` | Repository and path to initialization image.  Image must contain `jq` and `kubectl` |
| init.image.tag | string | `"2.1.0"` | Initialization image tag |
| init.image.imagePullPolicy | string | `"IfNotPresent"` | Initialization image pull policy |
| init.serviceAccount.automountServiceAccountToken | bool | `false` | Auto-mount the API token on the init ServiceAccount. Default false: the init Job still gets its token via an explicit projected volume (it kubectl-applies the defender DaemonSet). Set true to fall back to k8s default automount. |
| affinity | object | `{}` | affinity for console pod |
| nodeSelector | object | `{}` | nodeSelector for console pod |
| tolerations | list | `[]` | tolerations for console pod |
| podLabels | object | `{}` | labels for console pod |
| annotations | object | `{}` | annotations for console pod |
| resources | object | `{"limits":{"cpu":"250m","memory":"3Gi"},"requests":{"cpu":"250m","memory":"3Gi"}}` | resources for console pod |
| bbtests.enabled | bool | `false` | Toggle bbtests on/off for CI/Dev |
| bbtests.scripts.image | string | `"registry1.dso.mil/ironbank/big-bang/base:2.1.0"` | Image to use for script tests |
| bbtests.scripts.envs | object | `{"cypress_password":"{{ .Values.console.credentials.password }}","cypress_user":"{{ .Values.console.credentials.username }}","desired_version":"{{ .Values.console.image.tag }}","twistlock_host":"http://twistlock-console.twistlock.svc.cluster.local:8081"}` | Set envs for use in script tests |
| waitJob.image | string | `"registry1.dso.mil/ironbank/opensource/kubernetes/kubectl:v1.36"` |  |
| waitJob.enabled | bool | `true` |  |
| waitJob.permissions.apiGroups[0] | string | `""` |  |
| waitJob.permissions.resources[0] | string | `"pods"` |  |
| waitJob.permissions.resources[1] | string | `"namespaces"` |  |
| waitJob.permissions.verbs[0] | string | `"get"` |  |
| waitJob.permissions.verbs[1] | string | `"list"` |  |
| waitJob.permissions.verbs[2] | string | `"watch"` |  |
| hookNetworkPolicies | object | `{"egress":[{"ports":[{"port":443,"protocol":"TCP"},{"port":6443,"protocol":"TCP"}],"to":[{"ipBlock":{"cidr":"10.0.0.0/8"}},{"ipBlock":{"cidr":"172.16.0.0/12"}},{"ipBlock":{"cidr":"192.168.0.0/16"}}]},{"ports":[{"port":53,"protocol":"UDP"},{"port":53,"protocol":"TCP"}],"to":[{"namespaceSelector":{"matchLabels":{"kubernetes.io/metadata.name":"kube-system"}},"podSelector":{"matchLabels":{"k8s-app":"kube-dns"}}}]},{"ports":[{"port":15012,"protocol":"TCP"}],"to":[{"namespaceSelector":{"matchLabels":{"kubernetes.io/metadata.name":"istio-system"}},"podSelector":{"matchLabels":{"app":"istiod"}}}]}]}` | Egress rules for the chart's hook Jobs. Override for your API endpoints, DNS, or mesh control plane. |

## Contributing

Please see the [contributing guide](./CONTRIBUTING.md) if you are interested in contributing.

---

_This file is programatically generated using `helm-docs` and some BigBang-specific templates. The `gluon` repository has [instructions for regenerating package READMEs](https://repo1.dso.mil/big-bang/product/packages/gluon/-/blob/master/docs/bb-package-readme.md)._
