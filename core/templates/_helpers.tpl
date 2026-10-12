{{/*
Effective enablement of a package. On when ALL hold:
  - the package's own `enabled` is true;
  - it isn't gated out of a disabled `group` (group enabled defaults true);
  - if ambient-only (`requiresAmbient`, e.g. istio-cni/ztunnel), ambient is on.
Args: dict "pkg" <package values> "ambient" <bool> "groups" <groups map>
Returns "true" when the package should be rendered, "" otherwise.
*/}}
{{- define "core.pkgEnabled" -}}
{{- $pkg := .pkg -}}
{{- $groups := .groups | default dict -}}
{{- $groupOn := true -}}
{{- with $pkg.group -}}{{- $groupOn = ne (dig . "enabled" true $groups) false -}}{{- end -}}
{{- if and $pkg.enabled $groupOn -}}
{{- if $pkg.requiresAmbient -}}{{ if .ambient }}true{{ end }}{{- else -}}true{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Effective chart values with profile support. When .Values.profile is set,
core/profiles/<name>.yaml is read via .Files.Get and merged OVER .Values — so
the profile wins over both the chart defaults and the user's values on the keys
it sets. Keys the profile doesn't mention stay as-is (deep merge), so they
remain user-customizable. Returns YAML; consumers do
`fromYaml (include "core.merged" .)`.
*/}}
{{- define "core.merged" -}}
{{- $values := deepCopy .Values -}}
{{- $name := .Values.profile -}}
{{- if $name -}}
{{- $file := .Files.Get (printf "profiles/%s.yaml" $name) -}}
{{- if not $file -}}{{- fail (printf "core: unknown profile %q (expected core/profiles/%s.yaml)" $name $name) -}}{{- end -}}
{{- $values = mergeOverwrite $values (fromYaml $file) -}}
{{- end -}}
{{- toYaml $values -}}
{{- end -}}
