import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { google } from "googleapis";
import { buildDigest } from "./digest";
import { renderWeekly, type Stakeholder, type RenderedEmail } from "./render";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DRY_RUN = (process.env.DRY_RUN ?? "true").toLowerCase() !== "false";

function loadStakeholders(): Stakeholder[] {
  const raw = JSON.parse(
    fs.readFileSync(path.join(ROOT, "stakeholders.json"), "utf8"),
  );
  return raw.stakeholders as Stakeholder[];
}

function b64url(s: string): string {
  return Buffer.from(s)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function buildMime(args: {
  to: string;
  from: string;
  subject: string;
  text: string;
}): string {
  const headers = [
    `From: ${args.from}`,
    `To: ${args.to}`,
    `Subject: =?UTF-8?B?${Buffer.from(args.subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
  ];
  return headers.join("\r\n") + "\r\n\r\n" + args.text;
}

function gmailClient() {
  const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN } =
    process.env;
  if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) {
    throw new Error(
      "Missing GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET / GMAIL_REFRESH_TOKEN. " +
        "Set them in .env (or repo Secrets) to create real drafts.",
    );
  }
  const oauth2 = new google.auth.OAuth2(GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });
  return google.gmail({ version: "v1", auth: oauth2 });
}

async function main() {
  const digest = buildDigest();
  const recipients = loadStakeholders().filter(
    (s) => s.weeklyOptIn && s.status !== "暫不接觸",
  );
  const from = process.env.SENDER_FROM ?? "sall@symcio.tw";
  const fallbackTo = process.env.GMAIL_USER ?? "info@symcio.tw";

  const outDir = path.join(ROOT, ".out");
  fs.mkdirSync(outDir, { recursive: true });

  const gmail = DRY_RUN ? null : gmailClient();

  for (const s of recipients) {
    const rendered: RenderedEmail = renderWeekly(s, digest);
    const to = s.email && s.email.trim() ? s.email : fallbackTo;
    const mime = buildMime({ to, from, ...rendered });
    const safeName = s.name.replace(/[^\w一-龥-]+/g, "_");

    if (DRY_RUN) {
      fs.writeFileSync(path.join(outDir, `${safeName}.eml`), mime);
      console.log(`[dry-run] preview written: ${safeName}.eml -> ${to}`);
      continue;
    }

    await gmail!.users.drafts.create({
      userId: "me",
      requestBody: { message: { raw: b64url(mime) } },
    });
    console.log(`[draft created] ${s.name} -> ${to} (NOT sent)`);
  }

  console.log(
    DRY_RUN
      ? `Done (dry-run). ${recipients.length} previews in .out/. Set DRY_RUN=false to create Gmail drafts.`
      : `Done. ${recipients.length} Gmail drafts created in ${fallbackTo} — review and send manually.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
