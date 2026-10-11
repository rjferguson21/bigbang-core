{{/*
Effective enablement of a package: on when enabled, and — for ambient-only
packages (requiresAmbient, e.g. istio-cni/ztunnel) — only when ambient mode is on.
Args: dict "pkg" <package values> "ambient" <bool>
Returns "true" when the package should be rendered, "" otherwise.
*/}}
{{- define "core.pkgEnabled" -}}
{{- $pkg := .pkg -}}
{{- if $pkg.enabled -}}
{{- if $pkg.requiresAmbient -}}{{ if .ambient }}true{{ end }}{{- else -}}true{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Effective chart values with profile support (istio's _internal_defaults pattern).
Chart defaults live under .Values._internal_defaults_do_not_set; a named profile
(.Values.profile -> core/profiles/<name>.yaml) layers on top of them, then the
user's own top-level values win. Precedence: defaults < profile < user.
Returns the merged values as YAML; consumers do `fromYaml (include "core.merged" .)`.
*/}}
{{- define "core.merged" -}}
{{- $defaults := deepCopy (.Values._internal_defaults_do_not_set | default dict) -}}
{{- $user := omit (deepCopy .Values) "_internal_defaults_do_not_set" -}}
{{- $profile := dict -}}
{{- $name := $user.profile -}}
{{- if $name -}}
{{- $file := .Files.Get (printf "profiles/%s.yaml" $name) -}}
{{- if not $file -}}{{- fail (printf "core: unknown profile %q (expected core/profiles/%s.yaml)" $name $name) -}}{{- end -}}
{{- $profile = fromYaml $file -}}
{{- end -}}
{{- mergeOverwrite $defaults $profile $user | toYaml -}}
{{- end -}}
