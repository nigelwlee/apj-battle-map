# APJ Battle Map

**Live demo:** https://apj-battle-map.vercel.app

An interactive territory intelligence tool built for the Anthropic APJ Revenue Strategy & Operations Lead application. Proves a single thesis: **APJ enterprise sales is won through relationship capital, not feature wars**. Whoever captures the lighthouse account in each country wins the long tail.

---

## The thesis

Every APJ country has 10–20 "lighthouse accounts" — the companies every local CIO benchmarks against. Win them and the long tail follows. RevOps' job is to make that war legible to leadership and orchestrate a full-court press across the small set of decision-makers who matter.

This demo shows exactly that: a live map of where Anthropic stands, who the humans are, how they connect, and what to do next.

---

## Five surfaces

### 1. Territory War Map
APJ map shaded by **Lighthouse Capture Rate** per country. Click any country to open the account drilldown. Filters by vertical, size, and status. Reads like a Risk board at a glance.

### 2. Account War-Room
Click a country → ranked lighthouse list. Click an account → a full war-room panel:
- Account header (revenue, AI maturity, incumbent, ACV potential)
- Lighthouse rationale (why this account sets the benchmark)
- Competitive posture (who's incumbent, where the opening is)
- **MEDDPICC** (metrics, economic buyer, decision criteria, champion, competition)
- Stakeholder roster with CRM status and influence scores
- Field intelligence feed with inline note-posting
- **Full-Court Press Playbook** (Telstra, DBS, Toyota) with target people, warm paths, 30-90 day timeline, and draft exec-sponsor email

### 3. People & Influence Graph
Force-directed graph of 30 key decision-makers across APJ:
- Nodes: color = CRM status, size = influence score
- Edges: trust links (co-worked, alumni, board, co-author, co-panelist)
- Click a node → profile with **warm-intro paths** (BFS over trust graph, ranked by score)
- Filter by country and CRM status

### 4. Full-Court Press Playbook (pre-baked)
For Telstra, DBS, and Toyota: a concrete plan showing the 3 humans to win, the best warm-intro paths, the objection-handling angle for each, a 30–90 day campaign with measurable milestones, and a draft exec-sponsor email.

### 5. APJ Leadership Exec View
What an APJ VP screenshots for the Monday review:
- Lighthouse capture rate by country with WoW delta and sparklines
- Pipeline coverage vs. quota bar chart
- Territory design panel (TAM/rep ratio, rep capacity gaps)
- Top at-risk accounts (no touch in 45+ days)
- Quarterly forecast (Commit / Best Case / Pipeline Model)
- Claude-generated country narratives

---

## RevOps design choices

| Choice | Why it matters |
|--------|---------------|
| Lighthouse-first framing | APJ is relationship-driven. Logo volume = vanity. Capture rate in benchmark accounts = signal. |
| Trust-edge graph vs. org chart | Org charts show hierarchy. This shows who can actually get you in the room. |
| Capture rate as north star | Not pipeline, not logo count — the % of lighthouse accounts in Won/Active status. |
| Champion density | Avg # mapped champions per active deal. Drops → deals stall. Tracked at exec level. |
| Pre-baked Claude playbooks | Not a "Coming Soon" button. Three real playbooks for real accounts, showing what the AI layer produces. |
| MEDDPICC in every account | This is how enterprise deals get qualified and closed. Not optional. |
| Territory design panel | TAM/rep ratio makes the rep capacity gap visible. JD-aligned signal. |

---

## Stack

- **Next.js 16.2.4** App Router + TypeScript strict
- **react-simple-maps** — APJ TopoJSON (Natural Earth 110m)
- **react-force-graph-2d** — canvas force-directed graph
- **Recharts** — sparklines and coverage bar chart
- **Anthropic SDK** — server-side only (Full-Court Press playbooks pre-baked as JSON; live route handler scaffolded)
- **Tailwind CSS v4** + design system in `DESIGN.md`
- Deployed on **Vercel** · Linear project: [APJ Battle Map](https://linear.app/nigel-hobby/project/apj-battle-map-9ee32dfcee5b)

---

## Local setup

```bash
npm install
npm run dev        # http://localhost:3000
npm run seed       # Regenerate data/
npm run typecheck  # tsc --noEmit
npm run build      # Production build
```

---

## Data note

All accounts, people, and relationships are **illustrative**. Real APJ company names are used to make the demo legible — the architecture, the data model, and the GTM thesis are what's real. With a live CRM, LinkedIn Sales Navigator export, and earnings-call pipeline, this populates itself.

---

## What this proves

- **APJ market fluency** — naming the right lighthouse accounts and explaining why they matter
- **RevOps craft** — capture rate, pipeline coverage with correct definitions, champion density, quota visibility
- **GTM imagination** — relationship-first lighthouse strategy, not logo-count volume metrics
- **Builds with Claude** — hybrid live/baked approach, server-side API calls, grounded outputs
- **Exec communication** — exec view with narratives, the "so what" layer on top of the data
