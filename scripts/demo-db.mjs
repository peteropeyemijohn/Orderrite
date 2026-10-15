#!/usr/bin/env node
// Prepares the PUBLIC DEMO database (the Neon "demo" branch).
//
//   pnpm demo:db:reset    wipe the demo branch, rebuild the tables, seed demo data
//   pnpm demo:db:seed     seed demo data again without wiping
//
// Reads ONLY apps/api/.env.demo (never your private apps/api/.env values),
// refuses to run if the demo address is the same database as your private one,
// forces DEMO_MODE=true, and never seeds a real ADMIN_PHONE.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const apiDir = path.join(root, 'apps/api');
const demoEnvPath = path.join(apiDir, '.env.demo');
const privateEnvPath = path.join(apiDir, '.env');
const mode = process.argv[2];

if (mode !== 'reset' && mode !== 'seed') {
  console.error('Usage: node scripts/demo-db.mjs reset|seed');
  process.exit(1);
}

/** Minimal .env reader (KEY="value" lines), so this script needs no packages. */
function readEnvFile(file) {
  if (!existsSync(file)) return {};
  const values = {};
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    values[match[1]] = match[2].replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
  }
  return values;
}

/** The Neon endpoint id, e.g. "ep-cool-name-123456" (same for pooled and direct). */
function endpointOf(url) {
  try {
    return new URL(url).hostname.split('.')[0].replace(/-pooler$/, '');
  } catch {
    return null;
  }
}

function fail(message) {
  console.error(`\n✋ ${message}\n`);
  process.exit(1);
}

const demo = readEnvFile(demoEnvPath);
const priv = readEnvFile(privateEnvPath);

if (!existsSync(demoEnvPath)) fail('apps/api/.env.demo not found. Create it first (see docs/PHASES.md, Phase 2b).');
for (const key of ['DATABASE_URL', 'DIRECT_URL']) {
  if (!demo[key] || demo[key].includes('ep-example')) fail(`${key} is missing in apps/api/.env.demo`);
}

const demoEndpoints = new Set([endpointOf(demo.DATABASE_URL), endpointOf(demo.DIRECT_URL)]);
const privateEndpoints = new Set([endpointOf(priv.DATABASE_URL), endpointOf(priv.DIRECT_URL)].filter(Boolean));
if (demoEndpoints.has(null)) fail('A URL in apps/api/.env.demo is not a valid database address.');
if (demoEndpoints.size !== 1) fail('DATABASE_URL and DIRECT_URL in .env.demo point at different branches. Copy both from the demo branch.');
if ([...demoEndpoints].some((ep) => privateEndpoints.has(ep))) {
  fail('STOPPED: .env.demo points at the SAME database as your private apps/api/.env. Copy the strings from the "demo" branch in Neon.');
}

// Only the demo values reach Prisma. DOTENV_CONFIG_PATH makes `dotenv/config`
// (used by prisma.config.ts and the seed) load .env.demo instead of .env, and
// values already set here are never overridden by any file.
const childEnv = {
  ...process.env,
  DOTENV_CONFIG_PATH: demoEnvPath,
  DATABASE_URL: demo.DATABASE_URL,
  DIRECT_URL: demo.DIRECT_URL,
  DEMO_MODE: 'true',
  ADMIN_PHONE: '',
};

const run = (args) => execFileSync('pnpm', ['exec', ...args], { cwd: apiDir, env: childEnv, stdio: 'inherit' });

console.log(`Demo database: ${[...demoEndpoints][0]} (your private database is not touched)`);

if (mode === 'reset') {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question('This ERASES everything in the demo branch and rebuilds it. Type "demo" to continue: ');
  rl.close();
  if (answer.trim() !== 'demo') fail('Cancelled. Nothing was changed.');
  run(['prisma', 'migrate', 'reset', '--force']);
}
run(['prisma', 'db', 'seed']);
console.log('\n✓ Demo database ready.');
