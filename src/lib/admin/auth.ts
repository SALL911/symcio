import { headers } from "next/headers";

/**
 * Server Action 內的二次驗證。
 * Server Action 是可被直接 POST 的公開端點，middleware 的路徑比對不足以保護，
 * 所以每個會寫入資料的 action 都要自己再驗一次 Basic Auth。
 */
export function assertAdmin(): void {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) throw new Error("admin-not-configured");
  const header = headers().get("authorization") || "";
  const expected = `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
  if (header.length !== expected.length) throw new Error("unauthorized");
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= header.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) throw new Error("unauthorized");
}
