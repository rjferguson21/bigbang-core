#!/usr/bin/env python3

import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from typing import Optional, Tuple


FLUENT_TIMEOUT = 6 * 60
RETRY_INTERVAL = 2

FLUENT_HOST = os.environ["fluent_host"]
DESIRED_VERSION = os.environ["desired_version"]


def fetch_endpoint(url: str) -> Tuple[int, str]:
    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            return response.status, response.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        return error.code, body
    except Exception as error:
        return 0, str(error)


def wait_for_http_200(url: str, description: str) -> str:
    start_time = time.monotonic()
    last_logged_code: Optional[int] = None
    last_log_time = 0.0
    last_body = ""

    while True:
        http_code, body = fetch_endpoint(url)
        last_body = body
        elapsed = time.monotonic() - start_time

        if http_code != last_logged_code or elapsed - last_log_time >= 30:
            print(f"Fluentbit {description} endpoint returned HTTP {http_code}")
            last_logged_code = http_code
            last_log_time = elapsed

        if http_code == 200:
            return body

        if elapsed >= FLUENT_TIMEOUT:
            print(
                f"Failure: {description} endpoint did not return HTTP 200 after {FLUENT_TIMEOUT}s."
            )
            print(f"Debug information ({description} endpoint response):")
            print(last_body)
            sys.exit(1)

        time.sleep(RETRY_INTERVAL)


def load_build_info(response_body: str) -> dict:
    try:
        return json.loads(response_body)
    except json.JSONDecodeError:
        print("Failure: build info did not return valid JSON.")
        print("Debug information (build info response):")
        print(response_body)
        sys.exit(1)


def normalize_version(version: str) -> str:
    return version.removeprefix("v")


def sum_metric(metrics_body: str, metric_name: str) -> int:
    total = 0.0
    found = False
    metric_pattern = re.compile(rf"(^|\s){re.escape(metric_name)}($|\{{)")

    for line in metrics_body.splitlines():
        if not metric_pattern.search(line):
            continue

        value = line.rsplit(maxsplit=1)[-1]
        try:
            total += float(value)
        except ValueError:
            continue
        found = True

    if not found:
        print(f"Failure: metric {metric_name} was not found in Fluentbit metrics.")
        print("Debug information (metrics response):")
        print(metrics_body)
        sys.exit(1)

    return int(total)


def require_positive(value: int, failure_message: str, metrics_body: str) -> None:
    if value <= 0:
        print(failure_message)
        print("Debug information (metrics response):")
        print(metrics_body)
        sys.exit(1)


def main() -> None:
    print("Hitting Fluentbit endpoint...")
    build_info_body = wait_for_http_200(FLUENT_HOST, "build info")
    print("Test 1 Success: Fluentbit endpoint is up.")

    print("Checking Fluentbit version...")
    build_info = load_build_info(build_info_body)
    current_version = build_info.get("fluent-bit", {}).get("version", "")
    if not current_version:
        print("Test 2 Failure: Fluentbit build info did not include fluent-bit version metadata.")
        print("Debug information (deployed build info):")
        print(json.dumps(build_info, indent=2))
        sys.exit(1)

    if normalize_version(DESIRED_VERSION) != normalize_version(current_version):
        print("Test 2 Failure: Fluentbit version does not match.")
        print(f"Expected version: {DESIRED_VERSION}")
        print(f"Current version: {current_version}")
        print("Debug information (deployed build info):")
        print(json.dumps(build_info, indent=2))
        sys.exit(1)
    print("Test 2 Success: Fluentbit version matches.")

    print("Waiting 15 seconds to allow Fluentbit to collect some records...")
    time.sleep(15)

    print("Fetching Fluentbit metrics...")
    metrics_body = wait_for_http_200(f"{FLUENT_HOST}/api/v2/metrics", "metrics")

    print("Checking Fluentbit records input...")
    records_in = sum_metric(metrics_body, "fluentbit_input_records_total")
    require_positive(
        records_in,
        "Test 3 Failure: Fluentbit has not collected any records.",
        metrics_body,
    )
    print(f"Test 3 Success: Fluentbit has received {records_in} records.")

    print("Checking Fluentbit records processed...")
    records_out = sum_metric(metrics_body, "fluentbit_output_proc_records_total")
    require_positive(
        records_out,
        "Test 4 Failure: Fluentbit has not processed any records.",
        metrics_body,
    )
    print(f"Test 4 Success: Fluentbit has processed {records_out} records.")

    print("Checking Fluentbit processing errors...")
    processing_errors = sum_metric(metrics_body, "fluentbit_output_errors_total")
    if processing_errors > 0:
        print(f"Test 5 Failure: Fluentbit has {processing_errors} processing errors.")
        print("Debug information (metrics response):")
        print(metrics_body)
        sys.exit(1)
    print("Test 5 Success: Fluentbit has had 0 processing errors.")


if __name__ == "__main__":
    main()
