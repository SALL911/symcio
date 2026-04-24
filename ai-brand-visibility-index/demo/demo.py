"""
ABVI demo — minimal runnable example
====================================
Runs one prompt × four engines (or whichever have API keys set) against a given
brand, prints a per-engine breakdown and the composite ABVI score.

Usage:
  BRAND_NAME=Symcio GEMINI_API_KEY=... python demo.py

This is a thin wrapper over ../../../scripts/geo_audit.py that uses a single
prompt and prints a readable summary — useful for sharing as a Replit / Gist
demo link.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

# Import the reference implementation from the main repo
REPO_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(REPO_ROOT / "scripts"))

try:
    from geo_audit import ENGINES, analyze_mention  # noqa: E402
except ImportError as e:
    print(f"Unable to import reference implementation: {e}")
    print("Make sure scripts/geo_audit.py exists in the repo root.")
    sys.exit(2)


def main() -> int:
    brand = os.environ.get("BRAND_NAME", "").strip()
    domain = os.environ.get("BRAND_DOMAIN", "").strip()

    if not brand:
        print("Set BRAND_NAME to run the demo.")
        print("Example: BRAND_NAME=Symcio GEMINI_API_KEY=... python demo.py")
        return 2

    prompt = f"List the top 5 {os.environ.get('CATEGORY', 'B2B SaaS')} providers in Taiwan."

    active = [
        (name, fn)
        for name, (env_var, fn) in ENGINES.items()
        if os.environ.get(env_var)
    ]
    if not active:
        print("No AI engine API key set. Set at least GEMINI_API_KEY (free).")
        return 2

    print(f"Brand:  {brand}")
    print(f"Domain: {domain or '(none)'}")
    print(f"Prompt: {prompt}")
    print()

    results = []
    for engine, fn in active:
        api_key = os.environ[ENGINES[engine][0]]
        try:
            text = fn(prompt, api_key)
        except RuntimeError as e:
            print(f"[{engine}] ERROR: {e}")
            continue
        analysis = analyze_mention(text, brand, domain)
        results.append({"engine": engine, **analysis})
        print(f"[{engine:12}] mentioned={analysis['mentioned']} "
              f"rank={analysis['rank_position']} "
              f"sentiment={analysis['sentiment']} "
              f"score={analysis['score']}")

    if results:
        composite = sum(r["score"] for r in results) / len(results)
        print()
        print(f"ABVI (composite across {len(results)} engines): {composite:.1f} / 100")
        print()
        print("Raw results (for piping to jq):")
        print(json.dumps(results, indent=2, ensure_ascii=False))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
