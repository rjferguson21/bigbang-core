#!/usr/bin/env bats
# Tests for chart/scripts/twistlock-trusted-images.sh.
#
# Strategy: pre-define callapi (and logok) so twistlock-common.sh's body
# is skipped on source. Mock callapi reads its GET response from a fixture
# file and writes any PUT body to a capture file. Then jq-assert on the
# capture file via bats-assert.
#
# Local run:  BATS_LIB_PATH=/opt/lib bats chart/tests/twistlock-trusted-images.bats
# CI:         bb-ci image sets BATS_LIB_PATH=/opt/lib already.

bats_load_library 'bats-support'
bats_load_library 'bats-assert'
bats_load_library 'bats-file'

setup() {
  bats_require_minimum_version 1.5.0

  SCRIPT_PATH="${BATS_TEST_DIRNAME}/../scripts/twistlock-trusted-images.sh"
  PUT_FILE="${BATS_TEST_TMPDIR}/put-data.json"
  GET_FILE="${BATS_TEST_TMPDIR}/get-resp.json"

  # Pre-defined so twistlock-common.sh's
  # `if [ "$(type -t callapi)" != "function" ]` guard skips redefinition.
  callapi() {
    case "$1" in
      GET) RESP="$(cat "$GET_FILE")" ;;
      PUT) printf '%s' "$3" > "$PUT_FILE" ;;
    esac
  }
  logok() { :; }
}

empty_policy() {
  cat > "$GET_FILE" <<'JSON'
{"policy":{"_id":"trust","enabled":true,"rules":[]},"groups":[]}
JSON
}

populated_policy() {
  cat > "$GET_FILE" <<'JSON'
{
  "policy": {
    "_id": "trust",
    "enabled": true,
    "rules": [
      {"name":"unrelated-rule","allowedGroups":["unrelated-group"],"deniedGroups":[],"effect":"alert","collections":[{"name":"All"}]}
    ]
  },
  "groups": [
    {"_id":"unrelated-group","images":["other.example.com/*"]}
  ]
}
JSON
}

# Helper: run jq against PUT_FILE, assert success and exact-string output
assert_jq() {
  local filter="$1" expected="$2"
  run jq -r "$filter" "$PUT_FILE"
  assert_success
  assert_output "$expected"
}

@test "trusted-images script exists and is sourceable" {
  assert_file_exists "$SCRIPT_PATH"
}

@test "multi-group: builds valid policy from empty existing state" {
  empty_policy
  TWISTLOCK_TRUST_POLICY_JSON='{
    "groups": [{"name":"ironbank","registryMatches":["registry1.dso.mil/ironbank/*"]}],
    "rule": {"name":"bigbang-trusted","effect":"alert","collections":["All"]}
  }'
  source "$SCRIPT_PATH"
  assert_file_exists "$PUT_FILE"
  assert_jq '.policy.rules | length' "1"
  assert_jq '.policy.rules[0].name' "bigbang-trusted"
  assert_jq '.policy.rules[0].effect' "alert"
  assert_jq '.groups | length' "1"
  assert_jq '.groups[0]._id' "ironbank"
  assert_jq '.groups[0].images[0]' "registry1.dso.mil/ironbank/*"
}

@test "multi-group: preserves unrelated existing groups and rules" {
  populated_policy
  TWISTLOCK_TRUST_POLICY_JSON='{
    "groups": [{"name":"new-group","registryMatches":["new.example.com/*"]}],
    "rule": {"name":"new-rule","effect":"alert","collections":["All"]}
  }'
  source "$SCRIPT_PATH"
  assert_jq '.groups | length' "2"
  assert_jq '.policy.rules | length' "2"
  assert_jq '.groups | map(._id) | sort | join(",")' "new-group,unrelated-group"
  assert_jq '.policy.rules | map(.name) | sort | join(",")' "new-rule,unrelated-rule"
}

@test "multi-group: same-named existing group is replaced not duplicated" {
  cat > "$GET_FILE" <<'JSON'
{"policy":{"_id":"trust","enabled":true,"rules":[]},"groups":[{"_id":"ironbank","images":["old-stale-registry/*"]}]}
JSON
  TWISTLOCK_TRUST_POLICY_JSON='{
    "groups": [{"name":"ironbank","registryMatches":["registry1.dso.mil/ironbank/*"]}],
    "rule": {"name":"bigbang-trusted","effect":"alert","collections":["All"]}
  }'
  source "$SCRIPT_PATH"
  assert_jq '.groups | length' "1"
  assert_jq '.groups[0].images[0]' "registry1.dso.mil/ironbank/*"
  # Stale registry NOT present
  run jq -r '.groups[0].images | join(",")' "$PUT_FILE"
  refute_output --partial "old-stale-registry"
}

@test "multi-group: same-named existing rule is replaced not duplicated" {
  cat > "$GET_FILE" <<'JSON'
{"policy":{"_id":"trust","enabled":true,"rules":[{"name":"bigbang-trusted","allowedGroups":["stale"],"effect":"block","collections":[{"name":"All"}]}]},"groups":[]}
JSON
  TWISTLOCK_TRUST_POLICY_JSON='{
    "groups": [{"name":"ironbank","registryMatches":["registry1.dso.mil/ironbank/*"]}],
    "rule": {"name":"bigbang-trusted","effect":"alert","collections":["All"]}
  }'
  source "$SCRIPT_PATH"
  assert_jq '.policy.rules | length' "1"
  assert_jq '.policy.rules[0].effect' "alert"
  assert_jq '.policy.rules[0].allowedGroups[0]' "ironbank"
  # Stale group reference NOT present
  run jq -r '.policy.rules[0].allowedGroups | join(",")' "$PUT_FILE"
  refute_output --partial "stale"
}

@test "multi-group: chart rule is prepended to position 0" {
  populated_policy
  TWISTLOCK_TRUST_POLICY_JSON='{
    "groups": [{"name":"new-group","registryMatches":["new.example.com/*"]}],
    "rule": {"name":"chart-managed","effect":"alert","collections":["All"]}
  }'
  source "$SCRIPT_PATH"
  assert_jq '.policy.rules[0].name' "chart-managed"
  assert_jq '.policy.rules[1].name' "unrelated-rule"
}

@test "multi-group: rule allowedGroups derived from groups in YAML order" {
  empty_policy
  TWISTLOCK_TRUST_POLICY_JSON='{
    "groups": [
      {"name":"alpha","registryMatches":["a.example.com/*"]},
      {"name":"beta","registryMatches":["b.example.com/*"]},
      {"name":"gamma","registryMatches":["c.example.com/*"]}
    ],
    "rule": {"name":"r","effect":"alert","collections":["All"]}
  }'
  source "$SCRIPT_PATH"
  assert_jq '.policy.rules[0].allowedGroups | join(",")' "alpha,beta,gamma"
}

@test "multi-group: deniedGroups passed through" {
  empty_policy
  TWISTLOCK_TRUST_POLICY_JSON='{
    "groups": [{"name":"g","registryMatches":["x/*"]}],
    "rule": {"name":"r","effect":"alert","collections":["All"],"deniedGroups":["bad-group"]}
  }'
  source "$SCRIPT_PATH"
  assert_jq '.policy.rules[0].deniedGroups[0]' "bad-group"
}

@test "multi-group: collections default to All when omitted" {
  empty_policy
  TWISTLOCK_TRUST_POLICY_JSON='{
    "groups": [{"name":"g","registryMatches":["x/*"]}],
    "rule": {"name":"r","effect":"alert"}
  }'
  source "$SCRIPT_PATH"
  assert_jq '.policy.rules[0].collections[0].name' "All"
}

@test "multi-group: registryMatches becomes images in API body" {
  empty_policy
  TWISTLOCK_TRUST_POLICY_JSON='{
    "groups": [{"name":"g","registryMatches":["a/*","b/*"]}],
    "rule": {"name":"r","effect":"alert","collections":["All"]}
  }'
  source "$SCRIPT_PATH"
  assert_jq '.groups[0].images | join(",")' "a/*,b/*"
}
