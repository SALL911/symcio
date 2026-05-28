#!/usr/bin/env node
// Checkout speed test tool.
// Measures the wall-clock response time of the /api/checkout endpoint and the
// static /checkout/success + /checkout/cancel pages against a running server.
// Goal gate: median latency of /api/checkout must be < 200ms (0.2s).
//
// Usage:
//   BASE_URL=http://localhost:3000 node scripts/checkout-speed-test.mjs
//
// Exit code 0 if the checkout endpoint median is under the threshold, 1 otherwise.

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const THRESHOLD_MS = Number(process.env.THRESHOLD_MS || 200);
const SAMPLES = Number(process.env.SAMPLES || 50);
const WARMUP = Number(process.env.WARMUP || 5);

async function timeRequest(path) {
  const start = performance.now();
  const res = await fetch(`${BASE_URL}${path}`, { redirect: "manual" });
  // Drain body so the timing reflects a full response, not just headers.
  await res.arrayBuffer();
  const ms = performance.now() - start;
  return { ms, status: res.status };
}

function stats(samples) {
  const sorted = [...samples].sort((a, b) => a - b);
  const pct = (p) => sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
  const sum = sorted.reduce((a, b) => a + b, 0);
  return {
    min: sorted[0],
    median: pct(50),
    p95: pct(95),
    max: sorted[sorted.length - 1],
    mean: sum / sorted.length,
  };
}

async function bench(path) {
  for (let i = 0; i < WARMUP; i++) await timeRequest(path);
  const samples = [];
  let lastStatus = 0;
  for (let i = 0; i < SAMPLES; i++) {
    const { ms, status } = await timeRequest(path);
    samples.push(ms);
    lastStatus = status;
  }
  return { path, status: lastStatus, ...stats(samples) };
}

function fmt(n) {
  return `${n.toFixed(1)}ms`;
}

async function main() {
  const targets = [
    "/api/checkout?product=audit",
    "/checkout/success",
    "/checkout/cancel",
  ];
  console.log(`Checkout speed test → ${BASE_URL}`);
  console.log(`samples=${SAMPLES} warmup=${WARMUP} threshold=${THRESHOLD_MS}ms\n`);

  const results = [];
  for (const t of targets) {
    results.push(await bench(t));
  }

  for (const r of results) {
    console.log(
      `${r.path}\n  status=${r.status} min=${fmt(r.min)} median=${fmt(r.median)} p95=${fmt(r.p95)} max=${fmt(r.max)} mean=${fmt(r.mean)}`,
    );
  }

  const checkout = results.find((r) => r.path.startsWith("/api/checkout"));
  const pass = checkout.median < THRESHOLD_MS;
  console.log(
    `\n${pass ? "PASS" : "FAIL"}: /api/checkout median ${fmt(checkout.median)} ${pass ? "<" : ">="} ${THRESHOLD_MS}ms`,
  );
  process.exit(pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
