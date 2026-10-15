#!/usr/bin/env node
// Live check (after deploy) that the API's rate limiter sees YOUR real IP,
// not the hosting proxy's, and that a fake X-Forwarded-For header is ignored.
// Needs IP_DEBUG=true on the API while you check. No secrets needed.
//
//   pnpm check-ip https://<your-api>.onrender.com           (steps 1-2)
//   pnpm check-ip https://<your-api>.onrender.com --burst   (also step 3: uses up
//        this computer's code-request limit on the demo for 15 minutes)
const [apiUrl, flag] = process.argv.slice(2);
if (!apiUrl?.startsWith('https://')) {
  console.error('Usage: pnpm check-ip https://<your-api>.onrender.com [--burst]');
  process.exit(1);
}
const base = apiUrl.replace(/\/$/, '');
const ok = (pass, text) => console.log(`${pass ? '✓' : '✗'} ${text}`);
let failures = 0;
const check = (pass, text) => {
  ok(pass, text);
  if (!pass) failures++;
};

async function seenIp(headers = {}) {
  const res = await fetch(`${base}/health/ip`, { headers, signal: AbortSignal.timeout(90_000) });
  if (res.status === 404) throw new Error('GET /health/ip is off. Set IP_DEBUG=true on Render while checking.');
  return res.json();
}

console.log('Waking the API (can take up to a minute)…');
await fetch(`${base}/health/live`, { signal: AbortSignal.timeout(90_000) });

// 1. Does the API see the same IP as the rest of the internet?
const myIp = (await (await fetch('https://api.ipify.org?format=json')).json()).ip;
const seen = await seenIp();
console.log(`\nYour public IP: ${myIp}`);
console.log('What the API sees:', JSON.stringify(seen, null, 2));
check(seen.detectedIp === myIp, `1. The API sees your real IP (${seen.detectedIp})`);

// 2. Writing a fake IP into the headers must not change what the API sees.
const spoofed = await seenIp({ 'X-Forwarded-For': '6.6.6.6', 'CF-Connecting-IP': '6.6.6.6', 'True-Client-IP': '6.6.6.6' });
check(spoofed.detectedIp === seen.detectedIp, `2. A fake IP header is ignored (still ${spoofed.detectedIp})`);

// 3. Burst: the 11th code request from this IP within 15 minutes is refused.
if (flag === '--burst') {
  const statuses = [];
  for (let i = 0; i < 11; i++) {
    // An invalid number: rejected by the API, but it still counts towards the IP limit.
    const res = await fetch(`${base}/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': `10.0.0.${i}` },
      body: JSON.stringify({ phone: '000' }),
    });
    statuses.push(res.status);
  }
  console.log(`\nCode requests from this computer: ${statuses.join(' ')}`);
  check(statuses.slice(0, 10).every((s) => s === 400) && statuses[10] === 429, '3. The 11th request is refused (429), even with fake IP headers');
  console.log('\nNow on your PHONE using MOBILE DATA (a different IP), open the web or app and request a code.');
  console.log('It should still work: that proves each visitor has their own limit.');
}

console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed. See docs/PHASES.md (Phase 2b, IP check).`);
process.exit(failures === 0 ? 0 : 1);
