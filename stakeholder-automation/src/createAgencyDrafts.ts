/**
 * 18 家媒體代理商 + MAA 公會 → Gmail 草稿（draft-only，永不自動寄出）。
 *
 * 每封草稿都會 Bcc 到 sall@symcio.tw 作為寄件備份。
 * 名單 SSoT 是 BrandOS-Infrastructure 的 data/crm/agency_partners.csv，
 * 本 repo 的 agencies.json 是它的鏡像。
 *
 * DRY_RUN 預設 true — 只把 .eml 預覽寫到 .out/agencies/，不碰 Gmail API。
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BACKUP_BCC, b64url, buildMime, gmailClient } from "./mime";
import { renderAgencyEmail, type Agency } from "./agencyTemplates";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DRY_RUN = (process.env.DRY_RUN ?? "true").toLowerCase() !== "false";

/** cold-outreach 規範：每日人工寄出上限 20 封。超過就分批。 */
const DAILY_SEND_LIMIT = 20;

function loadAgencies(): Agency[] {
  const raw = JSON.parse(
    fs.readFileSync(path.join(ROOT, "agencies.json"), "utf8"),
  );
  return raw.agencies as Agency[];
}

async function main() {
  const agencies = loadAgencies().filter((a) => a.stage !== "paused");
  const from = process.env.SENDER_FROM ?? "sall@symcio.tw";
  const fallbackTo = process.env.GMAIL_USER ?? BACKUP_BCC;

  const outDir = path.join(ROOT, ".out", "agencies");
  fs.mkdirSync(outDir, { recursive: true });

  const gmail = DRY_RUN ? null : gmailClient();

  let needsWork = 0;
  let noEmail = 0;

  for (const a of agencies) {
    const rendered = renderAgencyEmail(a);
    const hasEmail = !!a.email?.trim();
    if (!hasEmail) noEmail++;
    if (rendered.needsPersonalization) needsWork++;

    const to = hasEmail ? a.email.trim() : fallbackTo;
    const mime = buildMime({
      to,
      from,
      subject: rendered.subject,
      text: rendered.text,
      bcc: BACKUP_BCC,
    });
    const safeName = a.name.replace(/[^\w一-龥-]+/g, "_");
    const flag = rendered.needsPersonalization ? " [需補個人化]" : "";
    // 收件人本身就是備份信箱時 buildMime 會略過 Bcc，log 要如實反映。
    const bccNote =
      to.toLowerCase() === BACKUP_BCC.toLowerCase()
        ? "備份信箱即收件人，未加 Bcc"
        : `Bcc ${BACKUP_BCC}`;

    if (DRY_RUN) {
      fs.writeFileSync(path.join(outDir, `${safeName}.eml`), mime);
      console.log(`[dry-run] ${safeName}.eml -> ${to} (${bccNote})${flag}`);
      continue;
    }

    await gmail!.users.drafts.create({
      userId: "me",
      requestBody: { message: { raw: b64url(mime) } },
    });
    console.log(`[draft created] ${a.name} -> ${to} (${bccNote}, NOT sent)${flag}`);
  }

  console.log("");
  console.log(`總計 ${agencies.length} 封草稿，備份信箱 ${BACKUP_BCC}。`);
  if (noEmail) {
    console.log(`⚠️  ${noEmail} 家無公開 email，草稿已改建到 ${fallbackTo} 作備份。`);
  }
  if (needsWork) {
    console.log(`🔴 ${needsWork} 封尚未填 personalNote — 補齊 agencies.json 後才可寄出。`);
  }
  if (agencies.length > DAILY_SEND_LIMIT) {
    console.log(
      `⚠️  ${agencies.length} 封超過每日 ${DAILY_SEND_LIMIT} 封的人工寄送上限，請分批寄出。`,
    );
  }
  console.log(
    DRY_RUN
      ? `Done (dry-run)。預覽在 .out/agencies/。設 DRY_RUN=false 才會建立 Gmail 草稿。`
      : `Done。草稿已建立在 Gmail，審閱後手動寄出。`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
