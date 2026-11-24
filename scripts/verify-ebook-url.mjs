#!/usr/bin/env node
// Verify that a URL delivers an actual downloadable PDF (not a preview page).
//
// Usage:
//   node scripts/verify-ebook-url.mjs "https://your-storage/bci.pdf"
//   BCI_EBOOK_DOWNLOAD_URL=... node scripts/verify-ebook-url.mjs
//
// Checks:
//   1. HTTP 200 after redirects
//   2. Content-Type contains "pdf" (not text/html — the Google-Drive-preview trap)
//   3. First bytes are the PDF magic (%PDF-)
//   4. Content-Length looks reasonable (not zero / not a 1KB HTML error page)

const url = process.argv[2] || process.env.BCI_EBOOK_DOWNLOAD_URL;

if (!url) {
  console.error("usage: node scripts/verify-ebook-url.mjs <url>");
  console.error("   or: BCI_EBOOK_DOWNLOAD_URL=<url> node scripts/verify-ebook-url.mjs");
  process.exit(2);
}

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

function pass(msg) { console.log(`${GREEN}✓${RESET} ${msg}`); }
function fail(msg) { console.log(`${RED}✗${RESET} ${msg}`); }
function warn(msg) { console.log(`${YELLOW}!${RESET} ${msg}`); }
function info(msg) { console.log(`${DIM}·${RESET} ${msg}`); }

info(`checking: ${url}`);

let resp;
try {
  // Range request so we only pull a small chunk even if the file is 20 MB.
  resp = await fetch(url, {
    method: "GET",
    redirect: "follow",
    headers: { Range: "bytes=0-4095", "User-Agent": "symcio-ebook-verify/1.0" },
  });
} catch (err) {
  fail(`fetch failed: ${err.message}`);
  process.exit(1);
}

let problems = 0;

if (resp.status === 200 || resp.status === 206) {
  pass(`HTTP ${resp.status}`);
} else {
  fail(`HTTP ${resp.status} — expected 200 or 206 (partial content)`);
  problems++;
}

const finalUrl = resp.url;
if (finalUrl !== url) info(`redirected to: ${finalUrl}`);

const ctype = (resp.headers.get("content-type") || "").toLowerCase();
info(`content-type: ${ctype || "(none)"}`);
if (ctype.includes("pdf")) {
  pass("content-type is a PDF");
} else if (ctype.includes("text/html")) {
  fail("content-type is text/html — this is a preview page, not the file itself");
  if (finalUrl.includes("drive.google.com")) {
    warn("Google Drive tip: use  https://drive.google.com/uc?export=download&id=<FILE_ID>");
  } else if (finalUrl.includes("dropbox.com")) {
    warn("Dropbox tip: change  ?dl=0  to  ?dl=1  at the end of the share URL");
  }
  problems++;
} else {
  warn(`unexpected content-type; buyers may see it named wrong`);
}

const clen = resp.headers.get("content-length");
const crange = resp.headers.get("content-range");
if (crange) {
  const total = crange.split("/").pop();
  if (total && total !== "*") {
    const bytes = Number(total);
    if (bytes < 50_000) fail(`file is only ${bytes} bytes — probably an error page, not a real ebook`), problems++;
    else pass(`total file size: ${(bytes / 1024 / 1024).toFixed(2)} MB`);
  } else {
    info(`partial response: ${crange}`);
  }
} else if (clen) {
  info(`content-length: ${clen}`);
}

const buf = new Uint8Array(await resp.arrayBuffer());
const head = new TextDecoder("latin1").decode(buf.slice(0, 8));
if (head.startsWith("%PDF-")) {
  pass(`file starts with PDF magic (${head.trim()})`);
} else {
  fail(`file does NOT start with %PDF- (got: ${JSON.stringify(head)})`);
  problems++;
}

console.log();
if (problems === 0) {
  console.log(`${GREEN}✅ URL is safe to use as BCI_EBOOK_DOWNLOAD_URL${RESET}`);
  process.exit(0);
} else {
  console.log(`${RED}❌ ${problems} problem(s) — fix before setting this in Vercel${RESET}`);
  process.exit(1);
}
