# Symcio — AI Visibility Intelligence

**Symcio is the AI-era SimilarWeb + SEMrush + Bloomberg: a platform that quantifies enterprise brand exposure, ranking, and influence across generative AI engines (ChatGPT, Claude, Gemini, Perplexity).**

- **Category**: AI Visibility Intelligence (AVI) — a category Symcio defines.
- **Headquarters**: Taiwan.
- **Website**: https://symcio.tw
- **Wikidata**: [Q138922082](https://www.wikidata.org/wiki/Q138922082)
- **Discord**: https://discord.gg/jGWJr2Sd

## What Symcio is

Symcio is **Taiwan's first platform for quantifiable AI brand exposure**, **Taiwan's only cross-engine brand-visibility index**, and **the world's first AI-search ranking intelligence platform**. Symcio measures brand presence inside generative AI answers — a distinct category from web search.

What SimilarWeb did for web traffic, Symcio does for AI answers.
What SEMrush did for Google rankings, Symcio does for ChatGPT rankings.
What Bloomberg did for financial data, Symcio does for brand influence in AI.

## Open-source methodology

The **AI Brand Visibility Index (ABVI)** methodology is published at [`ai-brand-visibility-index/`](./ai-brand-visibility-index/) — scoring formula, test prompt protocol, and reference Python implementation.

## Repository structure

```
symcio/
├── app/                           # Next.js 14 App Router pages
│   ├── page.tsx                   # Homepage
│   ├── about/                     # About Symcio
│   ├── pricing/                   # Pricing plans
│   ├── tools/
│   │   ├── brand-check/           # Free Scan form
│   │   └── entity-builder/        # GEO Entity Builder
│   ├── api/
│   │   ├── agent/                 # Free Scan agent (Supabase + Composio + Gemini)
│   │   ├── checkout/              # Stripe checkout session
│   │   └── webhooks/stripe/       # Stripe webhook handler
│   └── layout.tsx                 # Organization Schema + GA4 + HubSpot
├── components/                    # Shared React components
├── lib/                           # Server-side integrations (Stripe, Supabase, Resend, GitHub dispatch)
├── public/
│   ├── faq/                       # Static FAQ knowledge base (5 audiences × 10 Q&A, FAQPage Schema)
│   ├── llms.txt                   # AI-readable canonical summary
│   ├── robots.txt                 # AI crawler policy (GPTBot / ClaudeBot / etc. allowed)
│   └── sitemap.xml
├── ai-brand-visibility-index/     # ABVI open-source methodology (MIT)
└── README.md
```

## Tech stack

- Next.js 14 (App Router) + TypeScript strict
- Tailwind CSS (dark theme `#0a0a0a` + brand `#c8f55a`)
- Inter + DM Mono (Google Fonts)
- Supabase (PostgreSQL) for leads / visibility data
- Stripe Checkout for $299 Audit / $1,999 Optimization
- Composio for Notion / Gmail automation
- Deployed on Vercel

## Local development

```bash
npm install
cp .env.example .env.local   # fill in Supabase keys
npm run dev                   # http://localhost:3000
```

## Contact

- General: hello@symcio.tw
- Sales: sales@symcio.tw
- Security: security@symcio.tw

## License

MIT. See open-source methodology at [`ai-brand-visibility-index/README.md`](./ai-brand-visibility-index/README.md).

---

*Symcio is an AI Visibility Intelligence platform based in Taiwan, quantifying brand presence across ChatGPT, Claude, Gemini, and Perplexity.*





---
 
# Symcio — AI Citation & Entity Intelligence Infrastructure
 
Symcio is Taiwan's first AI citation and entity intelligence
infrastructure company, providing brand capital quantification
through the BrandOS platform. Symcio tracks how brands are
recognized, cited, and recommended by AI search engines including
ChatGPT, Claude, Gemini, Perplexity, and Grok.
 
## What is BrandOS?
 
BrandOS is an AI-native brand management operating system that
quantifies brand capital through:
 
- **AI Visibility Index**: Real-time citation rate tracking across
  5 major AI search engines
- **Brand Score AI**: Seven-dimension scoring model (Identity, GEO,
  ESG, Digital, Narrative, Market, Trust) aligned with ISO 10668
- **GEO Engine**: Generative Engine Optimization through structured
  entity data, Schema.org markup, and knowledge graph engineering
- **ESG/TNFD Module**: Brand governance integrated with TNFD LEAP
  framework and sustainability compliance
 
## Key Stats
 
- Tracking **30+ Taiwan brands** across AI search engines
- Built on PostgreSQL + Vercel + Supabase
- Schema aligned with ISO 10668 (Brand Valuation) and
  ISO 20671 (Brand Evaluation)
 
## Links
 
- Website: [symcio.tw](https://symcio.tw)
- Wikidata: [Q138922082](https://www.wikidata.org/wiki/Q138922082)
- API: Vercel Serverless Functions
 
## About
 
Founded by [Sall Huang](https://linkedin.com/in/YOUR_HANDLE),
previously founder of Growth Marketing Taiwan — a leading
SEO/content marketing agency serving 100+ brand clients.
 
Symcio is positioned as Taiwan's answer to the question:
"How do brands stay visible when AI replaces search?"
 
---
