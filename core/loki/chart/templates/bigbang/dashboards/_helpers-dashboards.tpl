{{/*
dashboards name
*/}}
{{- define "loki.dashboardsName" -}}
{{ .Values.upstream.nameOverride | default .Chart.Name }}-dashboards
{{- end }}
