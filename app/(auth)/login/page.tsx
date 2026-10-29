import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "登入 — Symcio BrandOS",
  description: "登入你的 Symcio BrandOS 帳號，查看 BCI 診斷歷史。",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm mode="login" />
    </Suspense>
  );
}
