#!/usr/bin/env node
/**
 * CLI for the Press Release Toolkit schema generator.
 *
 * Usage:
 *   node src/cli.js examples/sample-release.json            # print JSON-LD
 *   node src/cli.js examples/sample-release.json --tag      # print <script> tag
 *   node src/cli.js examples/sample-release.json --validate # only run validation
 *   cat release.json | node src/cli.js                      # read from stdin
 *
 * Maintained by TS Newswire — https://tsnewswire.com
 */

import { readFileSync } from 'node:fs';
import { generateSchema, generateScriptTag, validate } from './schema-generator.js';

function readStdin() {
  try {
    return readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function main(argv) {
  const args = argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith('--')));
  const file = args.find((a) => !a.startsWith('--'));

  let raw;
  if (file) {
    raw = readFileSync(file, 'utf8');
  } else {
    raw = readStdin();
  }

  if (!raw || !raw.trim()) {
    process.stderr.write(
      'Error: no input. Pass a JSON file path or pipe JSON via stdin.\n' +
        'Example: node src/cli.js examples/sample-release.json\n',
    );
    process.exit(2);
  }

  let input;
  try {
    input = JSON.parse(raw);
  } catch (err) {
    process.stderr.write(`Error: input is not valid JSON — ${err.message}\n`);
    process.exit(2);
  }

  const problems = validate(input);
  const blocking = problems.filter((p) => p.startsWith('Missing required') || p.includes('not a parseable'));

  if (flags.has('--validate')) {
    if (problems.length === 0) {
      process.stdout.write('OK — no issues found.\n');
    } else {
      process.stdout.write(`${problems.length} issue(s):\n`);
      for (const p of problems) process.stdout.write(`  - ${p}\n`);
    }
    process.exit(blocking.length ? 1 : 0);
  }

  if (blocking.length) {
    process.stderr.write('Cannot generate schema — fix these first:\n');
    for (const p of blocking) process.stderr.write(`  - ${p}\n`);
    process.exit(1);
  }

  // Non-blocking recommendations go to stderr so stdout stays clean/pipeable.
  const advisories = problems.filter((p) => !blocking.includes(p));
  for (const p of advisories) process.stderr.write(`  warning: ${p}\n`);

  const out = flags.has('--tag') ? generateScriptTag(input) : JSON.stringify(generateSchema(input), null, 2);
  process.stdout.write(`${out}\n`);
}

main(process.argv);
