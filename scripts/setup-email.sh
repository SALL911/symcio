#!/usr/bin/env bash
#
# One-shot setup for /api/send-email on Microsoft 365 (Microsoft Graph).
#
# This automates the parts that otherwise need clicking around Azure Portal +
# Vercel dashboard: register an Azure AD app, grant it application Mail.Send,
# admin-consent it, create a client secret, then push all env vars to Vercel.
#
# You run this on YOUR machine (it uses your own `az` + `vercel` logins — only
# you can authenticate to your tenant/project; that part can't be delegated).
#
# Prereqs (one-time):
#   - Azure CLI:  https://aka.ms/azure-cli        then:  az login
#   - Vercel CLI: npm i -g vercel                 then:  vercel login && vercel link
#   - You must be a Microsoft 365 / Entra ID admin (for admin-consent).
#
# Usage:
#   ALLOWED_SENDERS="info@symcio.tw,sall@symcio.tw" ./scripts/setup-email.sh
#
set -euo pipefail

APP_NAME="${APP_NAME:-symcio-send-email}"
ALLOWED_SENDERS="${ALLOWED_SENDERS:-info@symcio.tw,sall@symcio.tw}"
VERCEL_ENV="${VERCEL_ENV:-production}"

# Microsoft Graph well-known IDs.
GRAPH_API_ID="00000003-0000-0000-c000-000000000000"
MAIL_SEND_ROLE="b633e1c5-b582-4048-a93e-9f11b44c7e96"  # application permission Mail.Send

need() { command -v "$1" >/dev/null 2>&1 || { echo "❌ missing '$1' — see prereqs at top of this script"; exit 1; }; }
need az
need vercel

echo "▶ Using Azure account:"
az account show --query "{tenant:tenantId, user:user.name}" -o table

TENANT_ID="$(az account show --query tenantId -o tsv)"

echo "▶ Creating / reusing Azure AD app '$APP_NAME'…"
APP_ID="$(az ad app list --display-name "$APP_NAME" --query '[0].appId' -o tsv)"
if [ -z "${APP_ID}" ]; then
  APP_ID="$(az ad app create --display-name "$APP_NAME" --query appId -o tsv)"
  echo "  created appId=$APP_ID"
else
  echo "  found existing appId=$APP_ID"
fi

# Ensure a service principal exists (needed for admin-consent).
az ad sp show --id "$APP_ID" >/dev/null 2>&1 || az ad sp create --id "$APP_ID" >/dev/null

echo "▶ Adding Microsoft Graph application permission Mail.Send…"
az ad app permission add --id "$APP_ID" --api "$GRAPH_API_ID" \
  --api-permissions "${MAIL_SEND_ROLE}=Role" >/dev/null 2>&1 || true

echo "▶ Granting admin consent (requires admin rights)…"
az ad app permission admin-consent --id "$APP_ID"

echo "▶ Creating client secret…"
CLIENT_SECRET="$(az ad app credential reset --id "$APP_ID" --display-name "send-email" --query password -o tsv)"

# Generate a strong API key for the endpoint.
API_KEY="$(openssl rand -hex 32)"

echo "▶ Pushing environment variables to Vercel ($VERCEL_ENV)…"
put_env() {
  # remove existing (ignore errors) then add fresh
  vercel env rm "$1" "$VERCEL_ENV" -y >/dev/null 2>&1 || true
  printf '%s' "$2" | vercel env add "$1" "$VERCEL_ENV" >/dev/null
  echo "  set $1"
}
put_env GRAPH_TENANT_ID          "$TENANT_ID"
put_env GRAPH_CLIENT_ID          "$APP_ID"
put_env GRAPH_CLIENT_SECRET      "$CLIENT_SECRET"
put_env SEND_EMAIL_API_KEY       "$API_KEY"
put_env SEND_EMAIL_ALLOWED_SENDERS "$ALLOWED_SENDERS"

cat <<EOF

✅ Done. Azure AD app + Vercel env are configured.

   Tenant:          $TENANT_ID
   App (client) ID: $APP_ID
   Allowed senders: $ALLOWED_SENDERS

NEXT:
  1) Redeploy so the new env vars take effect:   vercel --prod
  2) Verify it works (sends a real test mail):
       SEND_EMAIL_API_KEY="$API_KEY" \\
       BASE_URL="https://symcio.tw" \\
       TEST_TO="you@example.com" \\
       node scripts/verify-email.mjs
  3) (Recommended) Restrict the app to only your mailboxes with an Exchange
     ApplicationAccessPolicy — see docs/email-gmail-api.md §2.

Keep SEND_EMAIL_API_KEY safe — it is how AI tools authenticate to the endpoint.
EOF
