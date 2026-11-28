"use client";

/**
 * Typeform embed component for /tools/brand-check.
 *
 * Uses Typeform's official JS embed SDK (loaded via script tag) to render
 * form ID ZZYlfK7A in a full-height iframe. The form submits via Typeform's
 * own infrastructure; we receive results through the webhook at
 * /api/webhooks/typeform.
 *
 * Why iframe over the React SDK: @typeform/embed-react adds ~30kb but doesn't
 * buy us anything we can't do with the vanilla loader.
 */

import { useEffect } from "react";

const FORM_ID = "ZZYlfK7A";

export function TypeformEmbed() {
  useEffect(() => {
    // Typeform's embed loader is idempotent — safe to add even if present
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="embed.typeform.com/next"]',
    );
    if (existing) return;

    const script = document.createElement("script");
    script.src = "//embed.typeform.com/next/embed.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div
      data-tf-live={FORM_ID}
      data-tf-opacity="100"
      data-tf-iframe-props={`title=Symcio Free Scan`}
      data-tf-transitive-search-params
      data-tf-medium="snippet"
      className="min-h-[600px] w-full"
      style={{ height: "70vh" }}
    />
  );
}
