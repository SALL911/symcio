import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildDigest } from "./digest";
import { renderWeekly, type Stakeholder, type RenderedEmail } from "./render";
import { BACKUP_BCC, b64url, buildMime, gmailClient } from "./mime";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DRY_RUN = (process.env.DRY_RUN ?? "true").toLowerCase() !== "false";

function loadStakeholders(): Stakeholder[] {
  const raw = JSON.parse(
    fs.readFileSync(path.join(ROOT, "stakeholders.json"), "utf8"),
  );
  return raw.stakeholders as Stakeholder[];
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
    const mime = buildMime({ to, from, bcc: BACKUP_BCC, ...rendered });
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
    console.log(`[draft created] ${s.name} -> ${to} (Bcc ${BACKUP_BCC}, NOT sent)`);
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
