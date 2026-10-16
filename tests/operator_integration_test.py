"""Chart contract checks: python3 -m unittest discover -s tests -p '*_test.py'.

Requires Helm and PyYAML; no cluster access is needed.
"""
from pathlib import Path
import subprocess
import tempfile
import unittest

import yaml

ROOT = Path(__file__).resolve().parents[1]


def render(chart, release, namespace, values=None, upgrade=False):
    with tempfile.NamedTemporaryFile(mode="w", suffix=".yaml") as f:
        yaml.safe_dump(values or {}, f)
        f.flush()
        command = ["helm", "template", release, str(ROOT / chart), "-n", namespace, "-f", f.name]
        if upgrade:
            command.append("--is-upgrade")
        result = subprocess.run(command, capture_output=True, text=True)
        if result.returncode:
            raise AssertionError(result.stderr)
    return [doc for doc in yaml.safe_load_all(result.stdout) if doc]


def kind(docs, name):
    return [doc for doc in docs if doc["kind"] == name]


def matches(selector, labels):
    return all(labels.get(key) == value for key, value in selector.get("matchLabels", {}).items())


class OperatorIntegration(unittest.TestCase):
    def test_global_gateway_matches_deployment(self):
        releases = {r["metadata"]["name"]: r["spec"] for r in kind(render("core", "core", "flux-system"), "HelmRelease")}
        operator = releases["bigbang-operator"]
        config = operator["values"]["globalConfig"]
        defaults = config["routes"]["defaults"]["inbound"]["gateways"]
        definitions = config["gateways"]
        gateway = releases["istio-gateway"]
        pods = kind(render(gateway["chart"]["spec"]["chart"], gateway["releaseName"], gateway["targetNamespace"], gateway["values"]), "Deployment")
        pod = pods[0]["spec"]["template"]
        definition = definitions[defaults[0]]
        self.assertEqual(definition["serviceAccountName"], pod["spec"]["serviceAccountName"])
        self.assertTrue(matches(definition["podSelector"], pod["metadata"]["labels"]))
        self.assertEqual(defaults[0].split("/")[0], gateway["targetNamespace"])
        for name in ("monitoring", "grafana", "loki"):
            release = releases[name]
            docs = render(release["chart"]["spec"]["chart"], release["releaseName"], release["targetNamespace"], release["values"])
            package = next(p for p in kind(docs, "Package") if p["metadata"]["name"] == release["releaseName"])
            for route in package["spec"]["routes"]["inbound"].values():
                self.assertNotIn("gateways", route, name)
        reporter = kind(render("packages/kyverno-reporter/chart", "reporter", "reporter"), "Package")[0]
        self.assertTrue(all("gateways" not in r for r in reporter["spec"]["routes"]["inbound"].values()))

    def test_oci_chart_reference_and_bundle(self):
        docs = render("core", "core", "flux-system")
        source = kind(docs, "OCIRepository")[0]
        releases = {r["metadata"]["name"]: r["spec"] for r in kind(docs, "HelmRelease")}
        operator = releases["bigbang-operator"]
        self.assertEqual(operator["chartRef"], {"kind": "OCIRepository", "name": source["metadata"]["name"]})
        self.assertNotIn("chart", operator)
        self.assertEqual(source["metadata"]["namespace"], "flux-system")
        self.assertEqual(source["spec"]["layerSelector"]["operation"], "copy")
        self.assertEqual(operator["releaseName"], "bigbang-operator")
        self.assertEqual(operator["targetNamespace"], "bigbang-operator")
        self.assertIn({"name": "bigbang-operator"}, releases["monitoring"]["dependsOn"])
        self.assertEqual(releases["monitoring"]["chart"]["spec"]["sourceRef"]["kind"], "GitRepository")
        bundle = yaml.safe_load((ROOT / "zarf/zarf.yaml").read_text())
        artifact = source["spec"]["url"].removeprefix("oci://") + ":" + source["spec"]["ref"]["tag"]
        self.assertIn(artifact, bundle["components"][0]["images"])
        self.assertIn("ghcr.io/rjferguson21/bigbang-operator:" + source["spec"]["ref"]["tag"], bundle["components"][0]["images"])
        self.assertFalse((ROOT / "core/bigbang-operator").exists())

    def test_disabled_oci_package_and_profiles(self):
        for values in ({"packages": {"bigbang-operator": {"enabled": False}}},
                       {"packages": {"bigbang-operator": {"group": "external"}}, "groups": {"external": {"enabled": False}}}):
            docs = render("core", "core", "flux-system", values)
            self.assertFalse(kind(docs, "OCIRepository"))
            self.assertNotIn("bigbang-operator", [r["metadata"]["name"] for r in kind(docs, "HelmRelease")])
        minimal = render("core", "core", "flux-system", {"profile": "minimal"})
        self.assertEqual(len(kind(minimal, "OCIRepository")), 1)
        for invalid in ({"chart": "core/other"}, {"oci": {"tag": ""}}, {"oci": {"url": "https://invalid.example"}}):
            with self.assertRaises(AssertionError):
                render("core", "core", "flux-system", {"packages": {"bigbang-operator": invalid}})

    def check_hooks(self, docs, release, expected_jobs):
        policies = kind(docs, "NetworkPolicy")
        packages = kind(docs, "Package")
        regular = next(p for p in packages if p["metadata"]["name"] == release)
        self.assertEqual(len(packages), 1)
        self.assertFalse(any(key.startswith("hooks.bigbang.dev/") for key in regular["metadata"].get("annotations", {})))
        self.assertNotIn("defaultsAsHooks", regular["spec"]["networkPolicies"])
        for rule in regular["spec"]["networkPolicies"]["egress"]["from"].values():
            self.assertNotIn("helm.sh/hook", rule.get("metadata", {}).get("annotations", {}))
        jobs = {j["metadata"]["name"]: j for j in kind(docs, "Job")}
        for name in expected_jobs:
            job = jobs[name]
            annotations = job["metadata"]["annotations"]
            labels = job["spec"]["template"]["metadata"]["labels"]
            for phase in annotations["helm.sh/hook"].split(","):
                allows = [p for p in policies if p["spec"]["podSelector"].get("matchLabels", {}).get("app.kubernetes.io/instance") == release
                          and matches(p["spec"]["podSelector"], labels)
                          and phase in p["metadata"]["annotations"]["helm.sh/hook"].split(",")
                          and any("ipBlock" in peer for rule in p["spec"].get("egress", []) for peer in rule.get("to", []))]
                self.assertEqual(len(allows), 1, (name, phase))
                policy = allows[0]
                metadata = policy["metadata"]
                self.assertLess(int(metadata["annotations"]["helm.sh/hook-weight"]), int(annotations.get("helm.sh/hook-weight", 0)))
                self.assertEqual(metadata["annotations"]["helm.sh/hook-delete-policy"], "before-hook-creation")
                self.assertEqual(metadata["namespace"], job["metadata"].get("namespace", regular["metadata"]["namespace"]))
                self.assertEqual(policy["spec"]["policyTypes"], ["Egress"])
                api_rule, dns_rule, mesh_rule = policy["spec"]["egress"]
                self.assertEqual({p["port"] for p in api_rule["ports"]}, {443, 6443})
                self.assertEqual({p["protocol"] for p in dns_rule["ports"]}, {"TCP", "UDP"})
                self.assertTrue(all(p["port"] == 53 for p in dns_rule["ports"]))
                self.assertEqual(mesh_rule["ports"], [{"port": 15012, "protocol": "TCP"}])
                self.assertNotIn("ownerReferences", metadata)
                self.assertNotIn("bigbang.dev/package", metadata.get("labels", {}))
                other_release = dict(labels, **{"app.kubernetes.io/instance": "unrelated-release"})
                self.assertFalse(matches(policy["spec"]["podSelector"], other_release))

    def test_monitoring_hooks_in_both_mesh_modes(self):
        for ambient in (False, True):
            with self.subTest(ambient=ambient):
                values = {"bigbangPackage": {"networkPolicies": {"enabled": True}, "istio": {"enabled": True, "ambient": {"enabled": ambient}}, "labels": {"team": "observability"}, "annotations": {"example.com/owner": "team"}}, "cleanUpgrade": {"enabled": True}}
                docs = render("core/monitoring/chart", "monitoring-monitoring", "monitoring", values, upgrade=True)
                self.check_hooks(docs, "monitoring-monitoring", ["monitoring-monitoring-kube-admission-create", "monitoring-monitoring-kube-admission-patch", "metrics-clean-upgrade"])
                regular = next(p for p in kind(docs, "Package") if p["metadata"]["name"] == "monitoring-monitoring")
                self.assertEqual(regular["metadata"]["labels"]["team"], "observability")
                self.assertEqual(regular["metadata"]["annotations"]["example.com/owner"], "team")
                self.assertNotIn("prependReleaseName", regular["spec"]["routes"])

    def test_twistlock_volume_upgrade_hook(self):
        docs = render("packages/twistlock/chart", "twistlock", "twistlock", {"console": {"volumeUpgrade": True}}, upgrade=True)
        self.check_hooks(docs, "twistlock", ["volume-upgrade-job"])

    def test_hook_policies_follow_job_switches(self):
        monitoring = "core/monitoring/chart"
        for switches in ({"enabled": False}, {"admissionWebhooks": {"enabled": False}},
                         {"admissionWebhooks": {"patch": {"enabled": False}}},
                         {"admissionWebhooks": {"certManager": {"enabled": True}}}):
            values = {"bigbangPackage": {"networkPolicies": {"enabled": True}},
                      "cleanUpgrade": {"enabled": False}, "upstream": {"prometheusOperator": switches}}
            docs = render(monitoring, "monitoring", "monitoring", values)
            self.assertFalse(kind(docs, "NetworkPolicy"))
        for values, upgrade in (({}, False), ({"console": {"volumeUpgrade": False}}, True),
                                ({"deploymentMode": {"defenderOnly": True}}, True)):
            if values.get("deploymentMode", {}).get("defenderOnly"):
                keys = ("service_parameter", "defender_ca", "defender_client_cert", "defender_client_key",
                        "defender_ca_old", "defender_client_cert_old", "defender_client_key_old",
                        "admission_cert", "admission_key")
                values["defender"] = {"secrets": dict.fromkeys(keys, "dGVzdA=="),
                                      "ws_address": "wss://console.example:8084", "clusterName": "test"}
            docs = render("packages/twistlock/chart", "twistlock", "twistlock", values, upgrade=upgrade)
            self.assertFalse(kind(docs, "NetworkPolicy"))
        docs = render(monitoring, "monitoring", "monitoring", {
            "bigbangPackage": {"networkPolicies": {"enabled": True}},
            "upstream": {"namespaceOverride": "custom-monitoring"}})
        policy = kind(docs, "NetworkPolicy")[0]
        self.assertEqual(policy["metadata"]["namespace"], "custom-monitoring")
        self.assertTrue(all(j["metadata"]["namespace"] == "custom-monitoring" for j in kind(docs, "Job")))

    def test_hook_egress_override(self):
        egress = [{"to": [{"ipBlock": {"cidr": "203.0.113.10/32"}}],
                   "ports": [{"port": 7443, "protocol": "TCP"}]}]
        for chart in ("core/monitoring/chart", "packages/twistlock/chart"):
            values = {"bigbangPackage": {"networkPolicies": {"enabled": True}},
                      "hookNetworkPolicies": {"egress": egress}, "cleanUpgrade": {"enabled": True}}
            policies = kind(render(chart, "example", "example", values, upgrade=True), "NetworkPolicy")
            self.assertTrue(policies)
            self.assertTrue(all(p["spec"]["egress"] == egress for p in policies))

    def test_disabled_integration_and_networking(self):
        for chart in ("core/monitoring/chart", "packages/twistlock/chart"):
            with self.subTest(chart=chart):
                disabled = render(chart, "example", "example", {"bigbangPackage": {"enabled": False}})
                self.assertFalse(kind(disabled, "Package"))
                self.assertFalse(kind(disabled, "NetworkPolicy"))
                no_network = render(chart, "example", "example", {"bigbangPackage": {"networkPolicies": {"enabled": False}}})
                self.assertEqual(len(kind(no_network, "Package")), 1)
                self.assertFalse(kind(no_network, "NetworkPolicy"))


if __name__ == "__main__":
    unittest.main()
