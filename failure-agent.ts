#!/usr/bin/env npx ts-node
/**
 * failure-agent.ts — reads a Playwright JSON or JUnit XML report and explains
 * each test failure in plain English using Claude.
 *
 * Usage:
 *   npx ts-node failure-agent.ts [path/to/report]
 *
 * Supported formats:
 *   Playwright JSON  test-results/results.json  (default)
 *   JUnit XML        test-results/junit.xml      (fallback / explicit)
 *
 * Requires:
 *   ANTHROPIC_API_KEY set in the environment
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import { parseStringPromise } from 'xml2js';

const SYSTEM_PROMPT = `You are a QA engineer who explains Playwright test failures in simple, plain English.

For each failure you receive:
1. State the root cause in one clear sentence.
2. Explain what the test was trying to do and exactly why it broke.
3. Suggest one or two concrete fixes the developer can try.

Be concise and practical. Avoid jargon. The reader wants to understand and fix the issue quickly.`;

interface Failure {
  suite: string;
  name: string;
  project: string;
  durationMs: number;
  message: string;
  stack: string;
  stdout: string;
  stderr: string;
  retry: number;
}

// ── Playwright JSON ──────────────────────────────────────────────────────────

interface PwError { message?: string; stack?: string; }
interface PwResult {
  status: string;
  duration: number;
  retry: number;
  error?: PwError;
  stdout?: { text: string }[];
  stderr?: { text: string }[];
}
interface PwTest { projectName?: string; status: string; results: PwResult[]; }
interface PwSpec { title: string; ok: boolean; tests: PwTest[]; }
interface PwSuite { title: string; suites?: PwSuite[]; specs?: PwSpec[]; }
interface PwReport { suites: PwSuite[]; }

function collectFromSuite(suite: PwSuite, parentTitle: string): Failure[] {
  const title = parentTitle ? `${parentTitle} > ${suite.title}` : suite.title;
  const out: Failure[] = [];

  for (const spec of suite.specs ?? []) {
    if (spec.ok) continue;
    for (const test of spec.tests) {
      for (const result of test.results) {
        if (result.status !== 'failed' && result.status !== 'timedOut') continue;
        out.push({
          suite: title,
          name: spec.title,
          project: test.projectName ?? '',
          durationMs: result.duration,
          message: result.error?.message ?? '',
          stack: result.error?.stack ?? '',
          stdout: (result.stdout ?? []).map(l => l.text).join('').slice(0, 500),
          stderr: (result.stderr ?? []).map(l => l.text).join('').slice(0, 500),
          retry: result.retry,
        });
      }
    }
  }

  for (const child of suite.suites ?? []) {
    out.push(...collectFromSuite(child, title));
  }

  return out;
}

function parseJsonReport(filePath: string): Failure[] {
  const report: PwReport = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return report.suites.flatMap(s => collectFromSuite(s, ''));
}

// ── JUnit XML ────────────────────────────────────────────────────────────────

async function parseJunitReport(filePath: string): Promise<Failure[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc: any = await parseStringPromise(fs.readFileSync(filePath, 'utf-8'), {
    explicitArray: true,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const suites: any[] = doc.testsuites?.testsuite ?? (doc.testsuite ? [doc.testsuite] : []);
  const out: Failure[] = [];

  for (const suite of suites) {
    const suiteName: string = suite.$?.name ?? '';
    for (const tc of suite.testcase ?? []) {
      if (!tc.failure) continue;
      const f = tc.failure[0];
      out.push({
        suite: suiteName,
        name: tc.$?.name ?? '',
        project: '',
        durationMs: Math.round(parseFloat(tc.$?.time ?? '0') * 1000),
        message: f.$?.message ?? '',
        stack: (typeof f === 'string' ? f : (f._ ?? '')).trim(),
        stdout: (tc['system-out']?.[0] ?? '').slice(0, 500),
        stderr: (tc['system-err']?.[0] ?? '').slice(0, 500),
        retry: 0,
      });
    }
  }

  return out;
}

// ── Formatting ───────────────────────────────────────────────────────────────

function formatFailure(f: Failure): string {
  const parts = [
    `Test suite : ${f.suite}`,
    `Test name  : ${f.name}`,
  ];
  if (f.project) parts.push(`Project    : ${f.project}`);
  parts.push(`Duration   : ${(f.durationMs / 1000).toFixed(2)} s`);
  if (f.retry > 0) parts.push(`Retry      : ${f.retry}`);
  if (f.message) parts.push(`\nError message:\n${f.message}`);
  if (f.stack) {
    parts.push(`Stack trace (first 30 lines):\n${f.stack.split('\n').slice(0, 30).join('\n')}`);
  }
  if (f.stdout) parts.push(`\nTest stdout (truncated):\n${f.stdout}`);
  if (f.stderr) parts.push(`\nTest stderr (truncated):\n${f.stderr}`);
  return parts.join('\n');
}

// ── Claude streaming ─────────────────────────────────────────────────────────

async function explainFailure(
  client: Anthropic,
  failure: Failure,
  index: number,
  total: number,
): Promise<void> {
  const divider = '='.repeat(70);
  console.log(divider);
  console.log(`Failure ${index}/${total}: ${failure.suite} > ${failure.name}`);
  console.log(divider);

  // The system prompt is identical for every call in this run, so caching it
  // saves tokens on every request after the first.
  const stream = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      } as Anthropic.TextBlockParam & { cache_control: { type: 'ephemeral' } },
    ],
    messages: [
      {
        role: 'user',
        content: `Explain this Playwright test failure in plain English:\n\n${formatFailure(failure)}`,
      },
    ],
    stream: true,
  });

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      process.stdout.write(event.delta.text);
    }
  }

  console.log('\n');
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const DEFAULT_JSON = 'test-results/results.json';
  const DEFAULT_JUNIT = 'test-results/junit.xml';

  let reportPath = process.argv[2];

  if (!reportPath) {
    if (fs.existsSync(DEFAULT_JSON)) reportPath = DEFAULT_JSON;
    else if (fs.existsSync(DEFAULT_JUNIT)) reportPath = DEFAULT_JUNIT;
    else {
      console.error(
        `Error: no report found. Tried:\n  ${DEFAULT_JSON}\n  ${DEFAULT_JUNIT}\n\n` +
        'Run Playwright with a reporter, e.g.:\n' +
        "  npx playwright test --reporter=json\n" +
        'Or configure in playwright.config.ts:\n' +
        "  ['json', { outputFile: 'test-results/results.json' }]",
      );
      process.exit(1);
    }
  }

  if (!fs.existsSync(reportPath)) {
    console.error(`Error: report not found at '${reportPath}'`);
    process.exit(1);
  }

  const ext = path.extname(reportPath).toLowerCase();
  let failures: Failure[];

  if (ext === '.json') {
    failures = parseJsonReport(reportPath);
  } else if (ext === '.xml') {
    failures = await parseJunitReport(reportPath);
  } else {
    console.error(`Error: unsupported format '${ext}'. Pass a .json or .xml report file.`);
    process.exit(1);
  }

  if (failures.length === 0) {
    console.log('No failures found in the report.');
    return;
  }

  const client = new Anthropic();
  console.log(`\nFound ${failures.length} failure(s). Asking Claude to explain each one...\n`);

  for (let i = 0; i < failures.length; i++) {
    await explainFailure(client, failures[i], i + 1, failures.length);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
