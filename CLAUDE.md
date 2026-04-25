# CLAUDE.md — APJ Battle Map

## Mission

This is an interactive demo built for a Anthropic ANZ Revenue Strategy & Operations Lead application. It proves a single thesis: APJ enterprise sales is won through relationship capital, not feature wars. Whoever captures the lighthouse account in each country wins the long tail. RevOps' job is to make that war legible to leadership and orchestrate a full-court press across the small set of decision-makers who matter.

The demo is a hosted Next.js app — the **APJ Battle Map** — giving APJ leadership a live view of where Anthropic stands country-by-country and telling the sales team exactly which humans to surround next.

Linear project: https://linear.app/nigel-hobby/project/apj-battle-map-9ee32dfcee5b
GitHub repo: https://github.com/nigelwlee/apj-battle-map

---

## Workflow rules

- Every change starts from a Linear issue (NIG-XX). No work outside the active issue.
- One PR per Linear issue. PR title format: `NIG-XX: short description`. PR body must include `Closes NIG-XX`.
- Conventional commits: `feat(scope): …`, `fix(scope): …`, `chore: …`, `data: …`.
- Run `pnpm typecheck && pnpm lint` before opening a PR — fix all errors, no suppression.
- Never commit `.env*` files. Never log API keys. All Claude API calls go through server route handlers only.

---

## Stack constraints

- **Next.js App Router only** — no Pages Router, no getServerSideProps.
- **TypeScript strict mode** — no `any`, no `@ts-ignore` without a comment explaining why.
- **Tailwind + shadcn/ui primitives** — no raw CSS files, no additional UI libraries without justification in the PR.
- **No new dependencies** without a one-line justification in the PR description.
- **pnpm** as the package manager.

---

## Claude usage in the app

- Model: `claude-sonnet-4-6`
- Prompt caching: always enabled on the system prompt + seed-data context block (they're large and reused across requests).
- All API calls: server-side only via `app/api/` route handlers. Never call the Anthropic SDK from client components.
- Streaming: use for any response the user waits on (court-press playbook, ask-the-map).
- The Full-Court Press Playbook feature is currently **Coming Soon** — the UI shows a placeholder and the route handler is scaffolded but not wired to a live API key.

---

## Data discipline

- All synthetic seed data lives in `data/` as JSON files (`countries.json`, `accounts.json`, `people.json`, `edges.json`, `intel.json`).
- Real APJ company names are used to make the demo legible. Synthetic people have plausible-but-invented names — never real individual names.
- Never include synthetic personal phone numbers or email addresses in seed data.
- The on-screen disclaimer **"Data shown is illustrative — with CRM + LinkedIn + earnings-call data, this populates itself."** must remain visible on every data surface.
- To regenerate seed data: `pnpm run seed` (runs `scripts/generate-seed.ts`).

---

## UI tone

Operator-grade, terse, RevOps-native. Think Salesforce dashboard copy, not marketing landing page copy. No fluff, no emojis in UI, no exclamation marks. Numbers are the heroes.
