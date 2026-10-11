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
Effective chart values with profile support (.Files.Get variant, no defaults
restructure). When .Values.profile is set, core/profiles/<name>.yaml is read and
merged OVER .Values — so the profile wins over both the chart defaults and the
user's own values ("profile wins"). Returns YAML; consumers do
`fromYaml (include "core.merged" .)`.
*/}}
{{- define "core.merged" -}}
{{- $values := omit (deepCopy .Values) "overrides" -}}
{{- $name := .Values.profile -}}
{{- if $name -}}
{{- $file := .Files.Get (printf "profiles/%s.yaml" $name) -}}
{{- if not $file -}}{{- fail (printf "core: unknown profile %q (expected core/profiles/%s.yaml)" $name $name) -}}{{- end -}}
{{- $values = mergeOverwrite $values (fromYaml $file) -}}
{{- end -}}
{{- /* escape hatch: anything under .Values.overrides is applied LAST, so it
       wins over the profile (and the defaults). Precedence: defaults < profile < overrides. */}}
{{- with .Values.overrides -}}
{{- $values = mergeOverwrite $values (deepCopy .) -}}
{{- end -}}
{{- toYaml $values -}}
{{- end -}}
