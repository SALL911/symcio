/**
 * 共用的 MIME 組裝與 Gmail client。
 * 唯一寫入 Gmail 的呼叫是 users.drafts.create — 這個檔案沒有任何 send 呼叫。
 */
import { google } from "googleapis";

/** 所有外聯草稿的備份收件人。每封信一律 Bcc 到這裡。 */
export const BACKUP_BCC = process.env.BACKUP_BCC ?? "sall@symcio.tw";

export function b64url(s: string): string {
  return Buffer.from(s)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function buildMime(args: {
  to: string;
  from: string;
  subject: string;
  text: string;
  /** 備份收件人。傳空字串可停用（正常情況不要停用）。 */
  bcc?: string;
}): string {
  const headers = [
    `From: ${args.from}`,
    `To: ${args.to}`,
  ];
  const bcc = args.bcc ?? BACKUP_BCC;
  // 備份信箱與收件人相同時不重複 Bcc，避免自己收到兩封。
  if (bcc && bcc.toLowerCase() !== args.to.toLowerCase()) {
    headers.push(`Bcc: ${bcc}`);
  }
  headers.push(
    `Subject: =?UTF-8?B?${Buffer.from(args.subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
  );
  return headers.join("\r\n") + "\r\n\r\n" + args.text;
}

export function gmailClient() {
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
