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
