# ABVI — Methodology Specification

This document specifies the **AI Brand Visibility Index** methodology in enough detail to be independently reproduced.

## 1. Measurement unit

A single **measurement** is defined as:

> The result of sending one test `prompt` to one `engine` and parsing the returned `response` against one target `brand`.

Each measurement produces a record with schema `visibility_results`.

## 2. Prompt sampling

### 2.1 Categories

Every audit must cover all four categories in equal weight:

| Code | Meaning |
|------|---------|
| `top_companies` | Lists of leading providers in a category |
| `alternatives` | Alternatives to a named brand |
| `problem` | Problem-led discovery |
| `comparison` | Brand-vs-brand comparison |

### 2.2 Depth

A valid ABVI score requires **at least 5 prompts per category** (total 20 prompts per brand). The managed $299 Audit uses exactly 20. Enterprises running daily tracking may use up to 100.

### 2.3 Industry adaptation

Prompts **must** be adapted to the brand's industry. Use `docs/prompts/geo-audit-prompts.json` as the canonical library. Cross-industry prompts are invalid and must not be mixed.

## 3. Engine coverage

### 3.1 Required set

- ChatGPT (OpenAI)
- Claude (Anthropic)
- Gemini (Google)
- Perplexity

A measurement missing any engine is an **incomplete** measurement and must be flagged as such. Partial data is allowed for free-tier usage but must not be published as a complete ABVI score.

### 3.2 Model selection policy

Use the **fastest cost-efficient model** from each vendor's current lineup. As of 2026-04:

- OpenAI: `gpt-4o-mini`
- Anthropic: `claude-haiku-4-5-20251001`
- Google: `gemini-1.5-flash`
- Perplexity: `sonar`

Rationale: ABVI measures brand representation, not reasoning quality. Cheapest-capable-model is the right tradeoff.

### 3.3 Temperature and sampling

- Temperature: **0** (or as close to deterministic as each API allows)
- Max tokens: **1024**
- No system prompt (measure what the average user sees)

## 4. Parsing rules

### 4.1 Mention detection

A brand is **mentioned** if any of:
- The brand name (case-insensitive) appears in the response text
- The brand's primary domain (stripped of protocol and subdomains) appears in the response text

Partial matches are not allowed. "Foo" does not match "Foobar".

### 4.2 Rank position

Rank detection scans for list markers (`1.`, `2.`, `1)`, `2)`, `#1`, `#2`, etc.). If the brand is mentioned within 200 characters of a list marker, the marker's number is recorded as `rank_position`.

If the response is not list-structured, `rank_position = null` but `mentioned` can still be true.

### 4.3 Sentiment classification

Sentiment is classified via keyword lexicon as a **baseline**. Positive keywords include `excellent`, `best`, `recommend`, `top`, `leader`. Negative keywords include `avoid`, `worst`, `poor`.

A sentiment upgrade path uses Claude Haiku to reclassify borderline cases (managed $299 Audit and above). The open-source reference implementation uses only the keyword lexicon to remain zero-dependency.

### 4.4 Competitor extraction

Competitors are extracted via regex for capitalized word pairs (`[A-Z][a-z]+(?: [A-Z][a-z]+)?`). Top 10 distinct matches are recorded, excluding the audited brand itself and English function words.

This is intentionally coarse. Enterprise subscriptions layer NER on top.

## 5. Scoring formula

### 5.1 Per-measurement score

```
score = (mentioned ? 50 : 0)
      + (rank_position ? max(0, 50 - rank*5) : 0)
      + (sentiment == "positive" ? 20
         : sentiment == "negative" ? -20
         : 0)

score = clamp(score, 0, 100)
```

### 5.2 Per-engine aggregation

```
engine_score = mean(score across all prompts for that engine)
```

### 5.3 Composite ABVI

```
ABVI = weighted_mean(
    Exposure_score  at weight 0.4,
    Ranking_score   at weight 0.4,
    Influence_score at weight 0.2
)
```

### 5.4 Percentile bands

For interpretation, ABVI values map to bands:

| Band | Range | Interpretation |
|------|-------|----------------|
| Dominant | 75–100 | The category belongs to you in AI answers |
| Competitive | 50–74 | You are consistently on the radar |
| Emerging | 25–49 | Mentioned sometimes, rarely top-ranked |
| Invisible | 0–24 | Effectively absent from AI answers |

## 6. Reliability and reproducibility

### 6.1 Temporal variance

AI engines' answers drift as underlying models are updated. A single ABVI score is a point-in-time snapshot. Trends are only meaningful over ≥ 4 consecutive weekly measurements.

### 6.2 Repeatability

Running the same prompt twice at temperature 0 typically produces identical text. Small variance (< 5% of measurements) can occur due to engine-side stochasticity outside our control. Record and accept.

### 6.3 Audit trail

Every measurement record **must** include:
- Engine model identifier (e.g., `gpt-4o-mini-2024-07-18`)
- Timestamp (ISO 8601, UTC)
- Raw response excerpt (first 500 characters)
- The exact prompt string used

This allows post-hoc reproduction and external auditing.

## 7. Anti-patterns

Avoid these or flag as **non-compliant**:

- ❌ Testing only one engine and publishing as ABVI
- ❌ Using prompts not drawn from the canonical library
- ❌ Running with temperature > 0 without explicit disclosure
- ❌ Using system prompts that prime the answer
- ❌ Testing a brand's marketing copy instead of its actual products
- ❌ Aggregating across brands before measurement is complete for each

## 8. Governance

Methodology changes are versioned. Breaking changes require a major version bump and a 30-day public comment period. Backwards-compatible improvements may be merged directly.

Governance home: https://github.com/SALL911/BrandOS-Infrastructure

Maintainer: Symcio team, reachable at methodology@symcio.tw.

## 9. License and citation

MIT license. Suggested citation:

> Symcio (2026). *AI Brand Visibility Index (ABVI) Methodology Specification v1.0*. https://github.com/SALL911/BrandOS-Infrastructure/blob/main/benchmark/ai-brand-visibility-index/METHODOLOGY.md
