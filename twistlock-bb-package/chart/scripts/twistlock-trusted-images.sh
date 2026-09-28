#!/bin/bash
#######################################
# Configures Twistlock trust policy. Manages a list of groups plus one rule
# that allows all of them. Other groups and rules on the console are left
# untouched. Chart deletes-and-recreates its named entries; entries not
# declared in values are preserved.
#
# Globals:
#   TWISTLOCK_TRUST_POLICY_JSON - JSON: {"groups":[...], "rule":{...}}
#   TOKEN, TWISTLOCK_URL        - via twistlock-common.sh
#######################################
# shellcheck disable=SC1091,SC2016,SC2034

set -e

MYDIR="$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")"
source "$MYDIR/twistlock-common.sh"

endpoint="trust/data"

echo -n "Configuring trusted image policy ... "

policy_json="$TWISTLOCK_TRUST_POLICY_JSON"

callapi "GET" "$endpoint"
existing_rules=$(jq -c '.policy.rules // []' <<<"$RESP")
existing_groups=$(jq -c '.groups // []' <<<"$RESP")

managed_group_names=$(jq -c '[.groups[].name]' <<<"$policy_json")
managed_rule_name=$(jq -r '.rule.name' <<<"$policy_json")

# Strip chart-managed entries from existing policy
remaining_groups=$(jq -c --argjson m "$managed_group_names" \
  'map(select(._id as $id | $m | index($id) | not))' <<<"$existing_groups")
remaining_rules=$(jq -c --arg n "$managed_rule_name" \
  'map(select(.name != $n))' <<<"$existing_rules")

# Transform values shape -> API shape
new_groups=$(jq -c '[.groups[] | {_id: .name, images: (.registryMatches // [])}]' <<<"$policy_json")
new_rule=$(jq -c '{
  name: .rule.name,
  allowedGroups: [.groups[].name],
  deniedGroups: (.rule.deniedGroups // []),
  effect: .rule.effect,
  collections: ((.rule.collections // ["All"]) | map({name: .}))
}' <<<"$policy_json")

# Combine: chart groups appended, chart rule prepended (evaluated first)
final_groups=$(jq -c --argjson b "$new_groups" '. + $b' <<<"$remaining_groups")
final_rules=$(jq -c --argjson r "$new_rule" '[$r] + .' <<<"$remaining_rules")

data=$(jq -n \
  --argjson rules "$final_rules" \
  --argjson groups "$final_groups" \
  '{policy: {_id: "trust", enabled: true, rules: $rules}, groups: $groups}')

callapi "PUT" "$endpoint" "$data"
logok
