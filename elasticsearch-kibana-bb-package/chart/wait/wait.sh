#!/bin/bash
set -euo pipefail

namespace=${K8S_NAMESPACE}
release=${K8S_POD_NAME%-wait-job-*}

for resource in elasticsearch kibana; do
  generation=$(kubectl get "$resource" "$release" -n "$namespace" -o jsonpath='{.metadata.generation}')

  kubectl wait "$resource/$release" -n "$namespace" \
    --for=jsonpath='{.status.observedGeneration}'="$generation" \
    --timeout=700s

  if [[ $resource == elasticsearch ]]; then
    kubectl wait "$resource/$release" -n "$namespace" \
      --for=jsonpath='{.status.phase}'=Ready \
      --timeout=700s
  else
    kubectl wait "$resource/$release" -n "$namespace" \
      --for=jsonpath='{.status.health}'=green \
      --timeout=700s
  fi
done
