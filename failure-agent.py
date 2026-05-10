#!/usr/bin/env python3
"""
failure-agent.py — reads a Playwright JSON report and explains each test failure
in plain English using Claude.

Usage:
    python failure-agent.py [path/to/results.json]

Default report path: test-results/results.json

Requires:
    pip install anthropic
    ANTHROPIC_API_KEY set in the environment
"""

import argparse
import json
import sys
from pathlib import Path

import anthropic

SYSTEM_PROMPT = """You are a QA engineer who explains Playwright test failures in simple, plain English.

For each failure you receive:
1. State the root cause in one clear sentence.
2. Explain what the test was trying to do and exactly why it broke.
3. Suggest one or two concrete fixes the developer can try.

Be concise and practical. Avoid jargon. The reader wants to understand and fix the issue quickly."""


def collect_failures(suites: list, parent_title: str = "") -> list[dict]:
    """Recursively walk the Playwright JSON suite tree and collect failed tests."""
    failures = []
    for suite in suites:
        title = f"{parent_title} > {suite['title']}".lstrip(" > ")

        if suite.get("suites"):
            failures.extend(collect_failures(suite["suites"], title))

        for spec in suite.get("specs", []):
            for test in spec.get("tests", []):
                if test.get("status") == "unexpected":
                    for result in test.get("results", []):
                        if result.get("status") in ("failed", "timedOut"):
                            failures.append(
                                {
                                    "suite": title,
                                    "spec": spec["title"],
                                    "project": test.get("projectName", ""),
                                    "status": result.get("status", "failed"),
                                    "duration_ms": result.get("duration", 0),
                                    "retry": result.get("retry", 0),
                                    "error": result.get("error") or {},
                                    "stdout": result.get("stdout") or [],
                                    "stderr": result.get("stderr") or [],
                                }
                            )
    return failures


def build_failure_context(failure: dict) -> str:
    """Format a failure dict into a prompt-friendly block of text."""
    parts = [
        f"Test suite : {failure['suite']}",
        f"Test name  : {failure['spec']}",
        f"Browser    : {failure['project'] or 'unknown'}",
        f"Status     : {failure['status']}",
        f"Duration   : {failure['duration_ms']} ms",
    ]
    if failure["retry"]:
        parts.append(f"Retry      : #{failure['retry']}")

    error = failure["error"]
    if error.get("message"):
        parts.append(f"\nError message:\n{error['message']}")

    if error.get("stack"):
        stack_lines = error["stack"].splitlines()[:30]
        parts.append("Stack trace (first 30 lines):\n" + "\n".join(stack_lines))

    stdout_text = "".join(
        chunk.get("text", "")
        for chunk in failure["stdout"]
        if isinstance(chunk, dict)
    )
    if stdout_text.strip():
        parts.append(f"\nTest stdout (truncated):\n{stdout_text[:500]}")

    return "\n".join(parts)


def explain_failure(client: anthropic.Anthropic, failure: dict, index: int, total: int) -> None:
    """Stream Claude's explanation for a single test failure to stdout."""
    header = f"Failure {index}/{total}: {failure['suite']} > {failure['spec']}"
    if failure["project"]:
        header += f"  [{failure['project']}]"

    print("=" * 70)
    print(header)
    print("=" * 70)

    context = build_failure_context(failure)

    # The system prompt is identical for every failure in this run, so
    # cache_control on the system block lets Claude reuse the cached prefix
    # after the first request — saving tokens across multiple failures.
    with client.messages.stream(
        model="claude-opus-4-7",
        max_tokens=1024,
        thinking={"type": "adaptive"},
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=[
            {
                "role": "user",
                "content": (
                    "Explain this Playwright test failure in plain English:\n\n"
                    + context
                ),
            }
        ],
    ) as stream:
        for delta in stream.text_stream:
            print(delta, end="", flush=True)

    print("\n")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Explain Playwright test failures using Claude."
    )
    parser.add_argument(
        "report",
        nargs="?",
        default="test-results/results.json",
        help="Path to the Playwright JSON report (default: test-results/results.json)",
    )
    args = parser.parse_args()

    report_path = Path(args.report)
    if not report_path.exists():
        print(f"Error: report not found at '{report_path}'", file=sys.stderr)
        print(
            "Run Playwright with the JSON reporter, e.g.:\n"
            "  npx playwright test --reporter=json\n"
            "Or add the JSON reporter to playwright.config.ts.",
            file=sys.stderr,
        )
        sys.exit(1)

    try:
        report = json.loads(report_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        print(f"Error: could not parse JSON report: {exc}", file=sys.stderr)
        sys.exit(1)

    failures = collect_failures(report.get("suites", []))
    if not failures:
        stats = report.get("stats", {})
        print(
            f"No failures found in the report. "
            f"({stats.get('expected', 0)} passed, "
            f"{stats.get('skipped', 0)} skipped)"
        )
        return

    client = anthropic.Anthropic()

    print(f"\nFound {len(failures)} failure(s). Asking Claude to explain each one...\n")

    for i, failure in enumerate(failures, 1):
        explain_failure(client, failure, i, len(failures))


if __name__ == "__main__":
    main()
