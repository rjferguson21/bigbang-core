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

    def check_cr_egress(self, docs, release, job_keys):
        # The chart ships no NetworkPolicies itself — the operator derives them
        # from the Package CR egress declarations below.
        self.assertFalse(kind(docs, "NetworkPolicy"))
        packages = kind(docs, "Package")
        self.assertEqual(len(packages), 1)
        regular = packages[0]
        self.assertEqual(regular["metadata"]["name"], release)
        egress = regular["spec"]["networkPolicies"]["egress"]["from"]
        for rule in egress.values():
            self.assertNotIn("helm.sh/hook", rule.get("metadata", {}).get("annotations", {}))
        jobs = {j["metadata"]["name"]: j for j in kind(docs, "Job")}
        for job_name, key in job_keys.items():
            self.assertIn(key, egress, key)
            rule = egress[key]
            self.assertTrue(rule["to"]["definition"]["kubeAPI"], key)
            selector = rule["podSelector"] if "podSelector" in rule else {"matchLabels": {"app.kubernetes.io/name": key}}
            labels = jobs[job_name]["spec"]["template"]["metadata"]["labels"]
            self.assertTrue(matches(selector, labels), (job_name, key))

    def test_monitoring_cr_egress_in_both_mesh_modes(self):
        for ambient in (False, True):
            with self.subTest(ambient=ambient):
                values = {"bigbangPackage": {"networkPolicies": {"enabled": True}, "istio": {"enabled": True, "ambient": {"enabled": ambient}}, "labels": {"team": "observability"}, "annotations": {"example.com/owner": "team"}}, "cleanUpgrade": {"enabled": True}}
                docs = render("core/monitoring/chart", "monitoring-monitoring", "monitoring", values, upgrade=True)
                self.check_cr_egress(docs, "monitoring-monitoring", {
                    "monitoring-monitoring-kube-admission-create": "admission-webhook-job",
                    "monitoring-monitoring-kube-admission-patch": "admission-webhook-job",
                    "metrics-clean-upgrade": "metrics-upgrade-job"})
                regular = next(p for p in kind(docs, "Package") if p["metadata"]["name"] == "monitoring-monitoring")
                self.assertEqual(regular["metadata"]["labels"]["team"], "observability")
                self.assertEqual(regular["metadata"]["annotations"]["example.com/owner"], "team")
                self.assertNotIn("prependReleaseName", regular["spec"]["routes"])

    def test_twistlock_volume_upgrade_cr_egress(self):
        docs = render("packages/twistlock/chart", "twistlock", "twistlock", {"console": {"volumeUpgrade": True}}, upgrade=True)
        self.check_cr_egress(docs, "twistlock", {"volume-upgrade-job": "twistlock-volume-upgrade-job"})

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
