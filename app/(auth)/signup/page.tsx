import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "註冊 — Symcio BrandOS",
  description: "免費註冊 Symcio BrandOS，BCI 診斷歷史自動儲存。",
};

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm mode="signup" />
    </Suspense>
  );
}
