/**
 * 三竹簡訊 Mitake HTTP API 客戶端。
 *
 * 參考：
 *   - 官方企業 endpoint：https://smsapi.mitake.com.tw/api/mtk/SmSend
 *   - 申請：service@mitake.com.tw（企業 API 需公司名 + 統編 + 用途申請）
 *   - 試用：初始帳號通常附 10–30 則試用點數
 *
 * 認證：username + password 以 query string 傳（Mitake 標準方式）。
 * 若 Mitake 要求 IP 白名單而你部署在 Vercel（動態 IP）：
 *   1. 跟 Mitake 客服說明 Vercel 場景 → 要求改帳密認證不鎖 IP
 *   2. 或改從 GitHub Actions 跑（本 repo 的 scripts/sms_send_campaign.py）
 */

export interface MitakeCredentials {
  username: string;
  password: string;
}

export interface MitakeSendInput {
  /** E.164 或本地格式（09xxxxxxxx）。Mitake 兩者都吃。 */
  phone: string;
  /** 純文字 message，中英皆可。UTF-8，Mitake 自動切 70 / 67 chars per segment。 */
  body: string;
  /** 簡訊類型；MTK = 國內簡訊（預設）、MMS 要另接 */
  type?: "MTK";
}

export interface MitakeSendResult {
  ok: boolean;
  providerMsgId?: string;
  accountPoint?: number;
  rawResponse: string;
  errorCode?: string;
  errorMessage?: string;
}

const API_BASE = "https://smsapi.mitake.com.tw";

/**
 * 發一則簡訊。單則送，batch 由上層 caller 自行組 loop（Mitake 也支援 batch endpoint，
 * 但那需要不同的 body 格式；MVP 先走單則，日後量大再切 batch）。
 */
export async function mitakeSend(
  creds: MitakeCredentials,
  input: MitakeSendInput,
): Promise<MitakeSendResult> {
  if (!creds.username || !creds.password) {
    return {
      ok: false,
      rawResponse: "",
      errorCode: "missing-credentials",
      errorMessage: "MITAKE_USERNAME / MITAKE_PASSWORD 未設",
    };
  }

  const url = new URL(`${API_BASE}/api/mtk/SmSend`);
  url.searchParams.set("username", creds.username);
  url.searchParams.set("password", creds.password);
  url.searchParams.set("dstaddr", input.phone);
  url.searchParams.set("smbody", input.body);
  url.searchParams.set("encoding", "UTF8");
  url.searchParams.set("response", ""); // 本 MVP 不做 delivery callback

  const resp = await fetch(url.toString(), { method: "GET" });
  const text = await resp.text();

  // Mitake response 長這樣（成功）：
  //   [1]
  //   msgid=99999999
  //   statuscode=1
  //   AccountPoint=123
  // 失敗可能只有 statuscode=0 + 錯誤行
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const parsed: Record<string, string> = {};
  for (const line of lines) {
    const m = line.match(/^([^=]+)=(.*)$/);
    if (m) parsed[m[1].trim()] = m[2].trim();
  }

  const status = parsed.statuscode;
  const isSuccess = status === "1" || status === "2" || status === "4"; // 1=成功排隊、2=已送達、4=delayed send 接受
  return {
    ok: isSuccess,
    providerMsgId: parsed.msgid,
    accountPoint: parsed.AccountPoint ? Number(parsed.AccountPoint) : undefined,
    rawResponse: text,
    errorCode: isSuccess ? undefined : status || "unknown",
    errorMessage: isSuccess ? undefined : interpretMitakeError(status),
  };
}

/** Mitake 的 statuscode 對照（摘錄常見的；完整見官方文件）*/
export function interpretMitakeError(code: string | undefined): string {
  switch (code) {
    case "0": return "訊息參數錯誤";
    case "a": return "帳號或密碼錯誤";
    case "b": return "帳號已被停用";
    case "c": return "無發送權限";
    case "d": return "帳號已過期";
    case "e": return "IP 不在白名單";
    case "f": return "參數不正確";
    case "h": return "簡訊長度超限";
    case "k": return "無發送時間參數";
    case "m": return "必須變更密碼";
    case "n": return "密碼已過期";
    case "p": return "不得發送的門號（黑名單）";
    case "r": return "系統發送失敗";
    case "s": return "帳號已停用";
    case "t": return "此帳號不可使用";
    case "u": return "無此電信網路";
    case "v": return "無發送點數";
    default:  return `未知錯誤 (statuscode=${code ?? "?"})`;
  }
}

/** 從 env 讀憑證的 helper。 */
export function mitakeCredentialsFromEnv(): MitakeCredentials | null {
  const username = process.env.MITAKE_USERNAME;
  const password = process.env.MITAKE_PASSWORD;
  if (!username || !password) return null;
  return { username, password };
}
