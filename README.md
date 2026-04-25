# APJ Battle Map

An interactive territory war map for Anthropic APJ revenue leadership — built as a demo for the Revenue Strategy & Operations Lead (ANZ) application.

**Live demo:** https://apj-battle-map.vercel.app

---

## The thesis

APJ enterprise sales is won through relationship capital, not feature wars. The company that captures the lighthouse account in each country — the reference that every local CIO benchmarks against — wins the long tail. RevOps' job is to make that war legible to leadership and orchestrate a full-court press across the small set of decision-makers who matter.

This tool operationalises that thesis.

---

## What it shows

### Territory War Map
The entry view. Each APJ country (AU, NZ, JP, KR, SG, ID, IN, MY, PH, TH, VN) is shaded by **Lighthouse Capture Rate** — the percentage of that country's top ~15 reference accounts that Anthropic has Won, has in Active Deal, is Targeting, has lost to a Competitor, or hasn't touched. Reads like a Risk board. Filterable by vertical, account size, and status.

### Lighthouse Account Drilldown
Click a country → ranked lighthouse list. Click an account → a war-room panel: AI maturity score, incumbent vendor, ACV potential, competitive posture, stakeholder roster, and a crowd-sourced intel feed the field team can post to.

### People & Influence Graph
A force-directed graph of the ~300 most important humans across APJ for Anthropic's ICP — CIOs, CDOs, CTOs, Heads of AI/Data, board members. Nodes are colored by CRM status and sized by influence score. Edges are trust links: co-worked, alumni, board overlap, public co-authorship. Click a person to see their three best warm-intro paths from existing Anthropic champions.

This view answers the question APJ leadership actually asks: _"Who do we need to surround this quarter, and who in our network gets us in the room?"_

### Full-Court Press Playbook _(coming soon)_
Select a target lighthouse account → Claude generates a grounded, account-specific full-court press plan: the five humans to win, the best warm path to each, next-best-action per person, a 30-60-90 day campaign, and a draft exec-sponsor email. Currently displayed as a coming-soon placeholder — the architecture is live, the API key is not wired.

### APJ Leadership Exec View
What an APJ VP screenshots for the Monday review: capture rate by country with WoW deltas, top-10 at-risk accounts, top-10 newly discovered warm paths, and coverage-vs-quota by territory with the quota assumptions visible.

---

## Design choices, in RevOps terms

| Choice | Rationale |
|--------|-----------|
| Lighthouse-first framing | APJ sales cycles are long and relationship-driven. One reference win cascades. Tracking 15 accounts per country is tractable; tracking all TAM is noise. |
| Trust-edge graph over org chart | Org charts show who approves. Trust graphs show who influences. In APJ, the person who shapes the CIO's view often isn't in the room. |
| Capture rate as the north star metric | It's binary (we won the lighthouse or we didn't), directional (rising = momentum), and executive-legible. Pipeline coverage is a lag indicator; capture rate is a lead indicator. |
| Champion density in the KPI strip | Number of mapped champions per target account predicts deal velocity better than deal stage alone. Low champion density on a late-stage deal is a red flag. |
| Hybrid live/pre-baked Claude | Pre-bake static rationales (cheap, instant, deterministic for reviewers). Live API for reasoning tasks that need current context (court-press playbook). |
| Prompt caching on seed data | The seed data context is ~50K tokens, reused on every Claude call. Caching cuts latency and cost by ~90% on cache hits. |

---

## Tech stack

- **Next.js 14** (App Router) + TypeScript + Tailwind + shadcn/ui
- **react-simple-maps** — APJ TopoJSON, no Mapbox token required
- **react-force-graph-2d** — renders 300 nodes / 600 edges smoothly
- **Recharts** — exec view sparklines
- **Anthropic SDK** (`@anthropic-ai/sdk`) — server-side only, prompt caching enabled
- **Vercel** — production deploy, preview deploys per PR

---

## Running locally

```bash
pnpm install
pnpm run seed          # generates data/*.json
pnpm dev               # http://localhost:3000
```

Environment variables (create `.env.local`):
```
ANTHROPIC_API_KEY=sk-ant-...   # optional — playbook feature shows Coming Soon without it
```

---

## Data note

All data shown is illustrative. Real APJ company names are used to make the demo legible; individual people are synthetic composites. With a live CRM, LinkedIn Sales Navigator export, and earnings-call transcript pipeline, this populates itself.

---

## Linear project

Work tracked in [APJ Battle Map on Linear](https://linear.app/nigel-hobby/project/apj-battle-map-9ee32dfcee5b) (NIG-48 through NIG-55).
