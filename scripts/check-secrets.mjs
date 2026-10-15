#!/usr/bin/env node
// Secret scanner. Stops a commit if it looks like a real key, password or
// .env file is about to be committed. The repo may become public, so this
// runs automatically before every commit (see .githooks/pre-commit).
//
//   pnpm check-secrets          scan files staged for commit
//   pnpm check-secrets --all    scan every file in the project (not ignored ones)
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const scanAll = process.argv.includes('--all');

const files = execFileSync(
  'git',
  scanAll
    ? ['ls-files', '--cached', '--others', '--exclude-standard']
    : ['diff', '--cached', '--name-only', '--diff-filter=ACMR'],
  { encoding: 'utf8' },
)
  .split('\n')
  .filter(Boolean);

// Placeholder passwords that are allowed in example files and docs.
const FAKE_PASSWORD = /^(PASSWORD|password|YOUR_PASSWORD|<[^>]*>|\*+|fake[\w-]*|example[\w-]*)$/;

const rules = [
  { name: 'Paystack secret key', regex: /\bsk_(live|test)_[A-Za-z0-9]{16,}/ },
  { name: 'Paystack live public key', regex: /\bpk_live_[A-Za-z0-9]{16,}/ },
  { name: 'Google API key', regex: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { name: 'Private key', regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: 'AWS access key', regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'GitHub token', regex: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/ },
  { name: 'Cloudinary URL with secret', regex: /cloudinary:\/\/\d+:[A-Za-z0-9_-]{10,}@/ },
  {
    name: 'Database URL with a real password',
    regex: /postgres(?:ql)?:\/\/[^:\s/@]+:([^@\s]+)@/g,
    // Only a problem if the password is not an obvious placeholder.
    check: (match) => !FAKE_PASSWORD.test(match[1]),
  },
];

const SKIP = [/(^|\/)pnpm-lock\.yaml$/, /\.(png|jpe?g|gif|webp|ico|icon|ttf|otf|woff2?|hbc|apk|aab)$/i];

const problems = [];

for (const file of files) {
  const base = path.basename(file);
  if (/^\.env(\..+)?$/.test(base) && base !== '.env.example') {
    problems.push(`${file}: .env files must never be committed`);
    continue;
  }
  if (SKIP.some((pattern) => pattern.test(file)) || !existsSync(file)) continue;

  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, index) => {
    for (const rule of rules) {
      const matches = rule.regex.global ? [...line.matchAll(rule.regex)] : [line.match(rule.regex)].filter(Boolean);
      if (matches.some((match) => !rule.check || rule.check(match))) {
        problems.push(`${file}:${index + 1}: possible ${rule.name}`);
      }
    }
  });
}

if (problems.length > 0) {
  console.error('\n✋ Secret scan FAILED. Nothing was committed.\n');
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error('\nRemove the secret (move it to a .env file), then try again.\n');
  process.exit(1);
}
console.log(`✓ Secret scan passed (${files.length} file${files.length === 1 ? '' : 's'} checked)`);
