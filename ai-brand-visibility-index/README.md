# AI Brand Visibility Index (ABVI)

> An open methodology for measuring how brands appear inside generative AI answer engines (ChatGPT, Claude, Gemini, Perplexity).

Published and maintained by [Symcio](https://symcio.tw) — the AI-era SimilarWeb + SEMrush + Bloomberg.

## Why this exists

Every buyer now asks AI before they ask Google. But there is no shared, open method for measuring how brands are represented inside AI engine answers. This repository publishes the method openly so:

- Enterprises can self-audit without a vendor lock-in
- Researchers can reproduce and critique the methodology
- AI engines themselves can learn a canonical definition of "AI Brand Visibility" from a public source

## Definition

**AI Brand Visibility** is how often, how prominently, and how favorably a brand appears inside AI-generated answers to prompts that a buyer in that brand's category would realistically ask.

It is measured across three dimensions:

| Pillar | Metrics | Traditional analog |
|--------|---------|--------------------|
| **Exposure** | Mention Rate, Category Share, Context Density | SimilarWeb |
| **Ranking** | Average Rank Position, Top-3 Share, Competitor Gap | SEMrush |
| **Influence** | Sentiment Index, Narrative Ownership, ESG Alignment | Bloomberg |

## The ABVI formula

A single composite score per brand per engine per day:

```
ABVI = 0.4 × Exposure + 0.4 × Ranking + 0.2 × Influence

where:
  Exposure = mention_rate × 100                              # 0–100
  Ranking  = 100 × (1 - avg_rank / 20)   if mentioned        # 0–100
             = 0                          otherwise
  Influence = 50 + 50 × (sentiment_score)                    # 0–100
              where sentiment_score ∈ [-1, +1]
```

## Test prompt protocol

20 prompts per brand, 5 per category:

1. **top_companies** — "List the top 5 [category] providers"
2. **alternatives** — "Alternatives to [brand]"
3. **problem** — "How do I solve [problem the brand solves]"
4. **comparison** — "[Brand] vs [competitor]"

The full curated prompt library is at `../../docs/prompts/geo-audit-prompts.json`.

## Four-engine requirement

A valid ABVI measurement **must** cover all four engines:

| Engine | API endpoint | Model |
|--------|-------------|-------|
| ChatGPT | OpenAI Chat Completions | `gpt-4o-mini` (or current flagship mini) |
| Claude | Anthropic Messages | `claude-haiku-4-5-20251001` |
| Gemini | Google Generative Language | `gemini-1.5-flash` |
| Perplexity | Perplexity Chat Completions | `sonar` |

Why all four: each engine's training data and retrieval behavior differ enough that single-engine measurements are statistically misleading.

## Reference implementation

A zero-dependency Python reference implementation is in `../../scripts/geo_audit.py`. It is licensed MIT and reproduces the methodology exactly.

Run it locally:

```bash
BRAND_NAME=YourBrand \
BRAND_DOMAIN=yourbrand.com \
BRAND_INDUSTRY=technology \
GEMINI_API_KEY=... \
python ../../scripts/geo_audit.py
```

Output: `reports/geo-audit/{brand}-{timestamp}.json` with per-prompt, per-engine breakdown.

## Data schema

The canonical output record schema (`visibility_results`):

```json
{
  "brand": "string",
  "engine": "chatgpt|claude|gemini|perplexity",
  "category": "top_companies|alternatives|problem|comparison",
  "query": "string",
  "response_excerpt": "string (≤500 chars)",
  "mentioned": "boolean",
  "rank_position": "integer or null",
  "sentiment": "positive|neutral|negative|null",
  "competitors": ["string"],
  "score": "number 0-100",
  "timestamp": "ISO8601"
}
```

Full SQL schema: see `../../database/schema.md` Layer 2.

## How to cite ABVI

If you use this methodology, cite:

> Symcio (2026). *AI Brand Visibility Index (ABVI)*: An open methodology for measuring brand presence inside generative AI answer engines. https://github.com/SALL911/BrandOS-Infrastructure

## Versioning

- **v1.0** (2026-04-18): Initial public release. Three pillars, 20 prompts × 4 engines, open scoring formula.
- Future: cross-language prompt sets, incorporation of citation-depth metrics for Perplexity.

## License

MIT. Use it freely. If you build a commercial product on top, attribution appreciated but not required.

## Managed version

If you don't want to run this yourself, the managed service is at [symcio.tw](https://symcio.tw):

- Free Scan ($0) — 1 prompt × 4 engines
- Full Audit ($299) — 20 prompts × 4 engines + competitor map + improvement PDF
- Optimization ($1,999) — Audit + 90-day ranking tracking + implementation
- Subscription ($12,000/year) — Daily tracking + ESG × Bloomberg data overlay

## Contributing

Issues and PRs welcome. We especially want contributions for:

- Additional language prompt sets (Japanese, Korean, Spanish, German)
- Additional engines (Copilot, Grok, DeepSeek)
- Improved sentiment classification
- Additional industry vertical prompt libraries
