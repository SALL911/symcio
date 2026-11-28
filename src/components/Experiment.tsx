"use client";

import { ReactElement, useEffect, useState } from "react";
import {
  ExperimentKey,
  ExperimentVariantOf,
  EXPERIMENTS,
} from "@/lib/posthog/experiments";
import { ensurePostHog, trackExperimentExposure, posthog } from "@/lib/posthog/client";

/**
 * Experiment render-prop。
 *
 * 使用：
 *   <Experiment name="primary_cta">
 *     {(variant) => variant === "book_demo" ? <Demo/> : <FreeScan/>}
 *   </Experiment>
 *
 * 行為：
 *   - Flag 未載入時：用 EXPERIMENTS[name].defaultVariant（避免閃爍到錯誤變體）
 *   - Flag 載入後：按 PostHog 分配的變體重渲染 + 自動送曝光事件（GA4 + PostHog）
 *   - 每個使用者在每個 experiment 只送一次曝光，避免重複計數
 */
export function Experiment<K extends ExperimentKey>({
  name,
  children,
}: {
  name: K;
  children: (variant: ExperimentVariantOf<K>) => ReactElement | null;
}) {
  const def = EXPERIMENTS[name];
  const [variant, setVariant] = useState<ExperimentVariantOf<K>>(
    def.defaultVariant as ExperimentVariantOf<K>,
  );
  const [exposed, setExposed] = useState(false);

  useEffect(() => {
    const ph = ensurePostHog();
    if (!ph) return;

    function resolve() {
      try {
        const flag = posthog.getFeatureFlag(name);
        if (typeof flag === "string" && (def.variants as readonly string[]).includes(flag)) {
          setVariant(flag as ExperimentVariantOf<K>);
          if (!exposed) {
            trackExperimentExposure(name, flag);
            setExposed(true);
          }
        } else if (!exposed) {
          // 即使 fallback 到預設，也記一筆曝光（分析 default segment 的轉換率）
          trackExperimentExposure(name, def.defaultVariant);
          setExposed(true);
        }
      } catch {
        /* ignore */
      }
    }

    // 先試一次（flags 可能已 cached）
    resolve();

    // 保險：flag 之後才載入的情境
    try {
      ph.onFeatureFlags(resolve);
    } catch {
      /* ignore */
    }
    // 不回傳 cleanup：onFeatureFlags 的 subscribe 官方沒提供 unsubscribe API，
    // 組件卸載會由 closure 作廢（resolve 內 setState 會在卸載後 noop）。
  }, [name, exposed, def.defaultVariant, def.variants]);

  return children(variant);
}
