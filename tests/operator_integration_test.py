"""Chart contract checks: python3 -m unittest discover -s tests -p '*_test.py'.

Requires Helm 4 and PyYAML; no cluster access is needed.
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
        docs = render(operator["chart"]["spec"]["chart"], operator["releaseName"], operator["targetNamespace"], operator["values"])
        config = kind(docs, "ConfigMap")[0]["data"]
        defaults = yaml.safe_load(config["routes"])["defaults"]["inbound"]["gateways"]
        definitions = yaml.safe_load(config["gateways"])
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
        crd = kind(render("core/bigbang-operator/chart", "operator", "operator"), "CustomResourceDefinition")[0]
        schema = crd["spec"]["versions"][0]["schema"]["openAPIV3Schema"]
        self.assertIn("defaults", schema["properties"]["spec"]["properties"]["routes"]["properties"])

    def check_hooks(self, docs, release, expected_jobs):
        policies = kind(docs, "NetworkPolicy")
        packages = kind(docs, "Package")
        regular = next(p for p in packages if p["metadata"]["name"] == release)
        token = regular["metadata"]["annotations"]["hooks.bigbang.dev/token"]
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
                self.assertEqual(metadata["annotations"]["hooks.bigbang.dev/token"], token)
                self.assertNotIn("ownerReferences", metadata)
                self.assertNotIn("bigbang.dev/package", metadata["labels"])
                other_release = dict(labels, **{"app.kubernetes.io/instance": "unrelated-release"})
                self.assertFalse(matches(policy["spec"]["podSelector"], other_release))
                post_phase = "post-" + phase.split("-", 1)[1]
                marker = next(p for p in packages if p["metadata"]["annotations"].get("helm.sh/hook") == post_phase)
                self.assertGreater(int(marker["metadata"]["annotations"]["helm.sh/hook-weight"]), int(annotations.get("helm.sh/hook-weight", 0)))
                self.assertEqual(marker["metadata"]["annotations"]["hooks.bigbang.dev/token"], token)

    def test_monitoring_hooks_in_both_mesh_modes(self):
        for ambient in (False, True):
            with self.subTest(ambient=ambient):
                values = {"bigbangPackage": {"networkPolicies": {"enabled": True}, "istio": {"enabled": True, "ambient": {"enabled": ambient}}, "labels": {"team": "observability"}, "annotations": {"example.com/owner": "team"}}, "cleanUpgrade": {"enabled": True}}
                docs = render("core/monitoring/chart", "monitoring-monitoring", "monitoring", values, upgrade=True)
                self.check_hooks(docs, "monitoring-monitoring", ["monitoring-monitoring-kube-admission-create", "monitoring-monitoring-kube-admission-patch", "metrics-clean-upgrade"])
                regular = next(p for p in kind(docs, "Package") if p["metadata"]["name"] == "monitoring-monitoring")
                self.assertEqual(regular["metadata"]["labels"]["team"], "observability")
                self.assertEqual(regular["metadata"]["annotations"]["example.com/owner"], "team")
                self.assertFalse(regular["spec"]["routes"]["prependReleaseName"])

    def test_twistlock_volume_upgrade_hook(self):
        docs = render("packages/twistlock/chart", "twistlock", "twistlock", {"console": {"volumeUpgrade": True}}, upgrade=True)
        self.check_hooks(docs, "twistlock", ["volume-upgrade-job"])

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
