# fluentbit

Big Bang wrapper chart for the upstream [fluent-bit](https://github.com/fluent/helm-charts) Helm chart, structured like the [repo1 fluentbit package](https://repo1.dso.mil/big-bang/product/packages/fluentbit) — but instead of depending on `bb-common` to render Istio and NetworkPolicy resources at template time, it emits a `bigbang.dev/v1alpha1 Package` CR that the bigbang-operator reconciles into the same resources.

## How it works

- The upstream `fluent-bit` chart is a dependency under the `upstream` alias (same as repo1), deployed as a DaemonSet that tails `/var/log` on each node.
- `chart/templates/bigbang/package.yaml` renders the `Package` CR from `bigbangPackage.istio` and `bigbangPackage.networkPolicies` — the same value shapes bb-common uses, nested under `bigbangPackage`. Values are passed through `tpl`, so templated values work.
- `chart/templates/bigbang/policy-exception.yaml` renders a kyverno `PolicyException` for the fluent-bit pods, which need hostPath access to `/var/log` and to run as root. Under bb-common these exceptions came from the Big Bang umbrella chart's kyverno-policies values; here the chart manages them directly.

## Prerequisites

- The bigbang-operator (and its `packages.bigbang.dev` CRD) installed in the cluster.
- Kyverno installed with `kyverno` configured as the exceptionNamespace (or disable `kyvernoPolicyException`).

## Values

| Key | Default | Description |
|---|---|---|
| `bigbangPackage.enabled` | `true` | Render the Package CR |
| `bigbangPackage.labels` / `.annotations` | `{}` | Extra metadata on the Package CR |
| `bigbangPackage.istio` | disabled | Istio config, bb-common shape |
| `bigbangPackage.networkPolicies` | disabled | NetworkPolicy config, bb-common shape (external output egress definitions, elastic/loki/tempo toggles, prometheus ingress) |
| `kyvernoPolicyException.enabled` | `true` | Render the kyverno PolicyException for the fluent-bit pods |
| `kyvernoPolicyException.namespace` | `kyverno` | kyverno's configured exceptionNamespace |
| `kyvernoPolicyException.policies` | host-path/securitycontext policies | Policies the exception covers |
| `additionalOutputs` | disabled | Big Bang wrappers for elastic, fluentd, loki, and s3 outputs |
| `upstream` | — | Values passed to the upstream fluent-bit chart |

## Testing

```sh
helm template fluentbit chart -n fluentbit \
  --set bigbangPackage.istio.enabled=true --set bigbangPackage.networkPolicies.enabled=true \
  | yq 'select(.kind == "Package" or .kind == "PolicyException")'
```
