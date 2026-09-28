#!/usr/bin/env bats
# Tests for chart/scripts/twistlock-defenders.sh SA-token hardening.
# Strategy mirrors twistlock-trusted-images.bats: pre-define callapi/kubectl/logok
# so twistlock-common.sh's `type -t` guard skips them, capture the applied manifest,
# then yq-assert on it.
# Local run: BATS_LIB_PATH=/opt/lib bats chart/tests/twistlock-defenders-hardening.bats

bats_load_library 'bats-support'
bats_load_library 'bats-assert'
bats_load_library 'bats-file'

setup() {
  bats_require_minimum_version 1.5.0
  SCRIPT_PATH="${BATS_TEST_DIRNAME}/../scripts/twistlock-defenders.sh"
  APPLIED="${BATS_TEST_TMPDIR}/applied.yaml"

  # Required env for the script's top half.
  export TWISTLOCK_ORCHESTRATION="kubernetes"
  export TWISTLOCK_NAMESPACE="twistlock"
  export TWISTLOCK_CONSOLE_SERVICE="https://console:8083"
  export TWISTLOCK_DEFENDER_WAIT_FOR_ROLLOUT="false"
  export TWISTLOCK_DEFENDER_SA_AUTOMOUNT="false"

  # Mock the API + kubectl so twistlock-common.sh guards skip real definitions.
  callapi() {
    case "$2" in
      "defenders/daemonset.yaml") RESP="$(cat <<'YAML'
apiVersion: v1
kind: ServiceAccount
metadata:
  name: twistlock-service
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: twistlock-defender-ds
spec:
  template:
    spec:
      containers:
        - name: twistlock-defender
YAML
)" ;;
      "version") RESP='"34.04.160"' ;;
    esac
  }
  kubectl() { if [ "$1" = "apply" ]; then cat > "$APPLIED"; else return 0; fi; }
  logok() { :; }
  logerror() { :; }
}

@test "SA automount is set false in the applied manifest" {
  source "$SCRIPT_PATH"
  run yq e 'select(.kind=="ServiceAccount").automountServiceAccountToken' "$APPLIED"
  assert_output --partial "false"
}

@test "DaemonSet gets the projected token volume" {
  source "$SCRIPT_PATH"
  run yq e 'select(.kind=="DaemonSet").spec.template.spec.volumes[0].name' "$APPLIED"
  assert_output "kube-api-access"
}

@test "defender container gets the token mount at the standard path" {
  source "$SCRIPT_PATH"
  run yq e 'select(.kind=="DaemonSet").spec.template.spec.containers[0].volumeMounts[0].mountPath' "$APPLIED"
  assert_output "/var/run/secrets/kubernetes.io/serviceaccount"
}
