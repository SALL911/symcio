import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "忘記密碼 — Symcio BrandOS",
  description: "輸入註冊 email，寄送 Symcio BrandOS 密碼重設連結。",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
