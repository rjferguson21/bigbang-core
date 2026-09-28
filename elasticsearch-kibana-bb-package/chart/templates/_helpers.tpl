{{- /*
This should be used with the $ scope
*/}}
{{- define "redirect_url" }}
  {{- if .Values.sso.redirect_url -}}
    {{ tpl .Values.sso.redirect_url . }}
  {{- else -}}
    {{ tpl (index .Values.bigbangPackage.routes.inbound.kibana.hosts 0) .}}
  {{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "elasticsearch.labels" -}}
helm.sh/chart: {{ include "elasticsearch.chart" . }}
{{ include "elasticsearch.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "elasticsearch.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}


{{/*
Selector labels
*/}}
{{- define "elasticsearch.selectorLabels" -}}
app.kubernetes.io/name: {{ include "elasticsearch.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Expand the name of the chart.
*/}}
{{- define "elasticsearch.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create the name of the service used to access the UI
*/}}
{{- define "elasticsearch.serviceName" -}}
{{- .Release.Name }}
{{- end }}

{{- define "elasticsearch.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{- define "oidc" }}
{{- with .Values.sso }}
xpack.security.authc.realms.oidc.{{ .oidc.realm }}:
  order: 2
  rp.client_id: {{ .client_id }}
  rp.response_type: code
  rp.requested_scopes:
    {{- range .requested_scopes }}
    - {{ . | quote }}
    {{- end }}
  rp.redirect_uri: "https://{{ template "redirect_url" $ }}/api/security/oidc/callback"
  rp.post_logout_redirect_uri: "https://{{ template "redirect_url" $ }}/login"
  op.issuer: {{ tpl .issuer $ }}
  op.authorization_endpoint: {{ tpl .auth_url $ }}
  op.token_endpoint: {{ tpl .token_url $ }}
  op.userinfo_endpoint: {{ tpl .userinfo_url $ }}
  op.jwkset_path: {{ tpl .jwkset_url $ }}
  claims.principal: {{ .claims_principal }}
  {{- /*Optional values should be nil checked*/ -}}
  {{- if .claims_principal_pattern }}
  claim_patterns.principal: {{ .claims_principal_pattern }}
  {{- end }}
  {{- if .signature_algorithm }}
  rp.signature_algorithm: {{ .signature_algorithm }}
  {{- end }}
  {{- if .endsession_url }}
  op.endsession_endpoint: {{ tpl .endsession_url $ }}
  {{- end }}
  {{- if .claims_group }}
  claims.groups: {{ .claims_group }}
  {{- end }}
  {{- if .claims_mail }}
  claims.mail: {{ .claims_mail }}
  {{- end }}
  {{- if .cert_authorities }}
  ssl.certificate_authorities:
    {{- range .cert_authorities }}
    - {{ . | quote }}
    {{- end }}
  {{- end }}
{{- /* Additional OIDC providers - keyed by realm name for proper values merge */ -}}
{{- if .additional_oidc }}
{{- $redirectUrl := (include "redirect_url" $) }}
{{- range $idx, $realm := (keys .additional_oidc | sortAlpha) }}
{{- $oidc := index $.Values.sso.additional_oidc $realm }}
xpack.security.authc.realms.oidc.{{ $realm }}:
  order: {{ add 3 $idx }}
  rp.client_id: {{ $oidc.client_id }}
  rp.response_type: code
  rp.requested_scopes:
    {{- range ($oidc.requested_scopes | default (list "openid" "profile" "email" "groups")) }}
    - {{ . | quote }}
    {{- end }}
  rp.redirect_uri: "https://{{ $redirectUrl }}/api/security/oidc/callback"
  rp.post_logout_redirect_uri: "https://{{ $redirectUrl }}/login"
  op.issuer: {{ $oidc.issuer }}
  op.authorization_endpoint: {{ $oidc.auth_url }}
  op.token_endpoint: {{ $oidc.token_url }}
  op.userinfo_endpoint: {{ $oidc.userinfo_url }}
  op.jwkset_path: {{ $oidc.jwkset_url }}
  claims.principal: {{ $oidc.claims_principal | default "preferred_username" }}
  {{- if $oidc.claims_principal_pattern }}
  claim_patterns.principal: {{ $oidc.claims_principal_pattern }}
  {{- end }}
  {{- if $oidc.signature_algorithm }}
  rp.signature_algorithm: {{ $oidc.signature_algorithm }}
  {{- end }}
  {{- if $oidc.endsession_url }}
  op.endsession_endpoint: {{ $oidc.endsession_url }}
  {{- end }}
  {{- if $oidc.claims_group }}
  claims.groups: {{ $oidc.claims_group }}
  {{- end }}
  {{- if $oidc.claims_mail }}
  claims.mail: {{ $oidc.claims_mail }}
  {{- end }}
  {{- if $oidc.cert_authorities }}
  ssl.certificate_authorities:
    {{- range $oidc.cert_authorities }}
    - {{ . | quote }}
    {{- end }}
  {{- end }}
{{- end }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Render a custom ECK-managed cluster PDB spec. ECK copies a non-empty spec
verbatim, so the chart injects the exact cluster selector. Because the selector
spans multiple nodeSet StatefulSets, only an integer minAvailable is supported;
maxUnavailable is reserved for per-nodeSet PDBs.

Arguments: list of (spec dict, Elasticsearch cluster name, values path string)
*/}}
{{- define "elasticsearch.clusterPDBSpec" -}}
{{- $spec := default dict (index . 0) -}}
{{- $clusterName := index . 1 -}}
{{- $valuesPath := index . 2 -}}
{{- if and (hasKey $spec "minAvailable") (hasKey $spec "maxUnavailable") -}}
  {{- fail (printf "%s.spec cannot define both minAvailable and maxUnavailable" $valuesPath) -}}
{{- end -}}
{{- if hasKey $spec "selector" -}}
  {{- fail (printf "%s.spec.selector is managed by the chart and cannot be set" $valuesPath) -}}
{{- end -}}
{{- if hasKey $spec "maxUnavailable" -}}
  {{- fail (printf "%s.spec.maxUnavailable is unsupported for a cluster-wide selector; use a nodeSet podDisruptionBudget instead" $valuesPath) -}}
{{- end -}}
{{- if not (hasKey $spec "minAvailable") -}}
  {{- fail (printf "%s.spec.minAvailable is required when spec is not empty" $valuesPath) -}}
{{- end -}}
{{- $minAvailable := get $spec "minAvailable" -}}
{{- $numericKinds := list "int" "int8" "int16" "int32" "int64" "uint" "uint8" "uint16" "uint32" "uint64" "float32" "float64" -}}
{{- if or (not (has (kindOf $minAvailable) $numericKinds)) (not (regexMatch "^[0-9]+$" (toString $minAvailable))) -}}
  {{- fail (printf "%s.spec.minAvailable must be a non-negative integer" $valuesPath) -}}
{{- end -}}
{{- $renderedSpec := deepCopy $spec -}}
{{- $_ := set $renderedSpec "selector" (dict "matchLabels" (dict "elasticsearch.k8s.elastic.co/cluster-name" $clusterName)) -}}
{{- toYaml $renderedSpec }}
{{- end -}}

