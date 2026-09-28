# kyverno-reporter-bb-package

Big Bang wrapper chart for the upstream [policy-reporter](https://github.com/kyverno/policy-reporter) Helm chart, structured like the [repo1 kyverno-reporter package](https://repo1.dso.mil/big-bang/product/packages/kyverno-reporter) — but instead of depending on `bb-common` to render Istio, NetworkPolicy, and route resources at template time, it emits a `bigbang.dev/v1alpha1 Package` CR that the bigbang-operator reconciles into the same resources.

## How it works

- The upstream `policy-reporter` chart is a dependency under the `upstream` alias (same as repo1).
- `chart/templates/bigbang/package.yaml` renders the `Package` CR from `bigbangPackage.istio`, `bigbangPackage.networkPolicies`, and `bigbangPackage.routes` — the same value shapes bb-common uses, nested under `bigbangPackage`. Values are passed through `tpl`, so templated values work.
- The SSO ServiceEntry for the policy-reporter-ui OIDC discovery endpoint (`ssoServiceEntry.yaml`) stays a chart template, driven by `upstream.ui.openIDConnect`.

## Prerequisites

- The bigbang-operator (and its `packages.bigbang.dev` CRD) installed in the cluster.

## Values

| Key | Default | Description |
|---|---|---|
| `bigbangPackage.enabled` | `true` | Render the Package CR |
| `bigbangPackage.labels` / `.annotations` | `{}` | Extra metadata on the Package CR |
| `bigbangPackage.istio` | disabled | Istio config, bb-common shape |
| `bigbangPackage.networkPolicies` | disabled | NetworkPolicy config, bb-common shape (kube-api egress, prometheus ingress toggle) |
| `bigbangPackage.routes` | policy-reporter-ui route | Inbound routes, bb-common shape |
| `upstream` | — | Values passed to the upstream policy-reporter chart |

## Testing

```sh
helm template kyverno-reporter chart -n kyverno-reporter \
  --set bigbangPackage.istio.enabled=true --set bigbangPackage.networkPolicies.enabled=true \
  | yq 'select(.kind == "Package")'
```
