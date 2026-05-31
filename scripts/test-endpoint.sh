#!/usr/bin/env bash
#
# Contract tests for /api/send-email — verifies the endpoint's behaviour WITHOUT
# any real provider credentials (auth gate, validation, anti-spoofing, dispatch).
# The one "failure" it asserts is the 503 you get until GRAPH_*/GMAIL_* are set.
#
# Usage:
#   SEND_EMAIL_API_KEY=test-key-123 PORT=3939 npm run dev &   # in one shell
#   BASE_URL=http://localhost:3939 API_KEY=test-key-123 ./scripts/test-endpoint.sh
#
set -uo pipefail

BASE_URL="${BASE_URL:-http://localhost:3939}"
API_KEY="${API_KEY:-test-key-123}"
B="${BASE_URL%/}/api/send-email"
pass=0; fail=0
check() { if [ "$2" = "$3" ]; then echo "✅ $1 (HTTP $3)"; pass=$((pass+1)); else echo "❌ $1 — expected $2 got $3"; fail=$((fail+1)); fi; }

code=$(curl -s -o /dev/null -w '%{http_code}' "$B"); check "GET health -> 200" 200 "$code"

code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$B" -H 'Content-Type: application/json' \
  -d '{"from":"info@symcio.tw","to":"a@b.com","subject":"x","text":"y"}'); check "POST no key -> 401" 401 "$code"

code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$B" -H 'Content-Type: application/json' -H 'x-api-key: wrong' \
  -d '{"from":"info@symcio.tw","to":"a@b.com","subject":"x","text":"y"}'); check "POST wrong key -> 401" 401 "$code"

code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$B" -H 'Content-Type: application/json' -H "x-api-key: $API_KEY" \
  -d '{"from":"info@symcio.tw","to":"a@b.com","subject":"x"}'); check "POST missing html/text -> 400" 400 "$code"

code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$B" -H 'Content-Type: application/json' -H "x-api-key: $API_KEY" \
  -d '{"from":"evil@attacker.com","to":"a@b.com","subject":"x","text":"y"}'); check "POST spoofed sender -> 403" 403 "$code"

code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$B" -H 'Content-Type: application/json' -H "x-api-key: $API_KEY" \
  -d '{"from":"info@symcio.tw","to":"a@b.com","subject":"x","html":"<p>y</p>"}'); check "POST allowed sender, no creds -> 503" 503 "$code"

echo "----"; echo "PASS=$pass FAIL=$fail"
[ "$fail" -eq 0 ]
