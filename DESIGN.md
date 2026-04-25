# Design System: APJ Battle Map

## 1. Visual Theme & Atmosphere

**Density: 8 / Variance: 6 / Motion: 5**

A cockpit-dense intelligence dashboard built for operators, not audiences. The atmosphere is mission-control dark — like a high-end geopolitical analysis terminal or a Bloomberg terminal that had its corners sanded smooth. Every pixel earns its space. No decorative anything.

The interface reads in one glance: Anthropic orange owns the winning territory; dark charcoal holds the untouched. The rest is typography doing the work.

Operator-grade austerity with one deliberate warmth signal — the ember accent. No gradients. No glows. No gentle pastels. If you squint and it looks like a Slack marketing page, it's wrong.

**Design character:** Geopolitical intelligence terminal × modern SaaS data tool. Think Palantir meets Linear. The map is the hero; every other surface is context for the map.

---

## 2. Color Palette & Roles

### Backgrounds (layered depth system)
- **Void Black** (`#09090B`) — Root canvas, `<html>` and `<body>` background. Zinc-950. Never pure #000.
- **Surface Charcoal** (`#18181B`) — Primary panel and card fill. Zinc-900. Nav bar, drawers, war-room panel.
- **Elevated Zinc** (`#27272A`) — Secondary elevated surfaces. Zinc-800. Nested sections, input backgrounds, timeline rows.
- **Rim Zinc** (`#3F3F46`) — Tertiary depth. Zinc-700. Dividers, borders on elevated components.

### Text
- **Glacier White** (`#FAFAFA`) — Primary text. Zinc-50. Headlines, key data values, company names.
- **Muted Ash** (`#A1A1AA`) — Secondary text. Zinc-400. Labels, metadata, descriptions, placeholder text.
- **Whisper Zinc** (`#71717A`) — Tertiary text. Zinc-500. Disabled states, de-emphasized timestamps.

### Borders & Structure
- **Structural Line** (`rgba(63,63,70,0.6)`) — 1px panel borders, table row separators, drawer edges.
- **Subtle Rim** (`rgba(63,63,70,0.3)`) — De-emphasized separators within panels.

### Accent (ONE — strictly singular)
- **Anthropic Ember** (`#E8681A`) — The single accent. Anthropic brand orange. Used for: Won country fills, active nav indicator, focus rings, primary buttons, progress bars, the wordmark. Saturation is high by intention — it is the territorial signal, the one thing that pops against Void Black.
- **Ember Dim** (`#C4541A`) — Darker ember. Hover state for ember elements, Active Deal country fills (slightly less saturated than Won).
- **Ember Ghost** (`rgba(232,104,26,0.12)`) — Ember at 12% opacity. Subtle backgrounds for ember-state containers, selected row highlight.

### Status Colors (CRM & Deal States)
- **Won Ember** (`#E8681A`) — Won status pill, Won country fill.
- **Active Amber** (`#F59E0B`) — Active Deal status, Contacted CRM status, amber country fill. Zinc-safe warm amber.
- **Targeted Ochre** (`#D97706`) — Targeted status. One step down from Active.
- **Competitor Slate** (`#6B7280`) — Held-by-competitor. Deliberately muted — not alarming, just noted.
- **Untouched Void** (`#3F3F46`) — Untouched territory fill. Almost invisible — appropriately so.
- **Champion Green** (`#22C55E`) — Champion CRM status. One of two greens in the system; use sparingly.
- **At-Risk Red** (`#EF4444`) — Detractor CRM status, at-risk account flag. Reserve for genuine urgency.
- **Meeting Blue** (`#3B82F6`) — MeetingHeld CRM status. Cool and calm.

### Banned Colors
- No purple in any form — no violet, no indigo, no lavender.
- No neon of any kind — no `#00FF00`, no electric blue, no hot pink.
- No pure white (`#FFFFFF`) as a background.
- No pure black (`#000000`).
- No warm grays mixed with cool grays — pick Zinc and stay Zinc.

---

## 3. Typography Rules

### Font Stack
**Display + Body:** `Geist` — already loaded via `next/font/local` in the scaffold. Confident, geometric, premium. Not Inter.

**Mono:** `Geist Mono` — for: all numerical KPI values, percentages, ACV figures, timestamps, CRM engagement counts, map tooltip numbers, table cell numbers. Numbers in this interface are data, not decoration — they get mono.

**Banned:** `Inter` (generic, overused), all serif fonts (wrong register for a data tool), `System UI` fallbacks in styled contexts.

### Scale
```
Display (page titles):   2rem / 700 / tracking -0.04em  — used once per page max
Headline (section):      1.25rem / 600 / tracking -0.02em
Subheading (panel):      0.875rem / 500 / tracking 0.02em / uppercase / muted ash
Body (descriptions):     0.875rem / 400 / leading 1.6 / muted ash
Label (UI labels):       0.75rem / 500 / tracking 0.03em / whisper zinc
Data (KPI values):       1.5–2.5rem / 600 / Geist Mono / glacier white
Micro (badges/pills):    0.6875rem / 500 / tracking 0.04em
```

### Rules
- Section subheadings use ALL CAPS at 0.75rem — the only sanctioned use of uppercase. Indicates category, not hierarchy.
- KPI numbers always in Geist Mono. Non-negotiable.
- Max line length for body copy: 65 characters. Panel descriptions wrap before this limit.
- No gradient text on any element — ever.
- No text shadows.

---

## 4. Component Stylings

### Navigation Bar
- Background: Surface Charcoal (`#18181B`), `border-b` in Structural Line
- Height: 48px
- Wordmark: "APJ Battle Map" in 0.875rem / 600 / Glacier White. "APJ" in Anthropic Ember.
- Nav tabs: 0.8125rem / 500 / Muted Ash. Active tab: Glacier White + 2px Ember bottom border. Hover: Zinc-300.
- Right side: IllustrativeDataBadge — 0.6875rem / 400 / Whisper Zinc, pill with Rim Zinc border.
- No shadow on nav — the border-b is enough.

### Buttons
- **Primary (Ember):** `bg-[#E8681A]` fill, Glacier White text, 0px border-radius (`rounded-sm` — 2px), no shadow, no glow. Active state: `translate-y-px` (1px push down, tactile). Hover: `bg-[#C4541A]`.
- **Secondary (Ghost):** `border border-[rgba(63,63,70,0.6)]` on Elevated Zinc bg. Muted Ash text. Hover: border brightens to Rim Zinc, text goes Glacier White.
- **Destructive / At-Risk:** Same shape as primary but `bg-[#EF4444]`.
- **Disabled:** Elevated Zinc bg, Whisper Zinc text, `cursor-not-allowed`. No opacity tricks — use explicit disabled colors.
- Font: 0.8125rem / 500. Padding: `px-3 py-1.5`. No uppercase on buttons.
- No rounded-full pill buttons. No outer glow on any state.

### Status Pills
- Tiny pill: `px-2 py-0.5`, `rounded-sm`, 0.6875rem / 500.
- Won: Ember Ghost bg + Anthropic Ember text.
- Active Deal: `bg-amber-950/40` + `text-amber-400`.
- Targeted: `bg-yellow-950/30` + `text-yellow-600`.
- HeldByCompetitor: `bg-zinc-800` + `text-zinc-400`.
- Untouched: `bg-zinc-900` + `text-zinc-600`.
- Champion: `bg-green-950/40` + `text-green-400`.
- Detractor: `bg-red-950/40` + `text-red-400`.
- Cold: `bg-zinc-800` + `text-zinc-500`.
- Contacted: `bg-amber-950/30` + `text-amber-500`.
- MeetingHeld: `bg-blue-950/40` + `text-blue-400`.

### Cards & Panels
- **Panels (drawers, war-room):** Surface Charcoal bg, `border-l border-[rgba(63,63,70,0.6)]`. No drop shadows — panels live in z-layers, not floating in space.
- **Data cards (account rows, person cards):** Elevated Zinc bg, 1px Structural Line border, `rounded` (4px). Hover: `bg-zinc-700/30`. No card shadows.
- **Section containers within panels:** `border-t border-[rgba(63,63,70,0.3)]` divider. Padding `pt-4`. No card-inside-card boxing — use negative space + dividers.
- Avoid nesting cards inside cards. Use dividers to separate sections within a panel.

### KPI Strip
- Full-width strip below nav. Background: Surface Charcoal. `border-b` in Structural Line.
- Each metric: label in Subheading style (uppercase, 0.75rem, Muted Ash), value in `1.75rem / 600 / Geist Mono / Glacier White`.
- WoW delta: `0.75rem / Geist Mono` — green (`#22C55E`) for positive, red (`#EF4444`) for negative, Muted Ash for flat (`–`).
- Metrics separated by `border-r border-[rgba(63,63,70,0.4)]`. No divider after the last metric.
- Padding: `py-3 px-6` per metric.

### Data Tables (Exec View)
- Header row: Subheading style. `bg-zinc-900` (same as surface, no contrast with rows).
- Data rows: body text, Geist Mono for all numbers. Hover: `bg-zinc-800/40`.
- Alternating rows: NO alternating row colors — use hover state only. Row borders instead.
- `border-b border-[rgba(63,63,70,0.3)]` between every row.
- Numbers right-aligned. Text left-aligned. No exceptions.
- Progress bars in Capture Rate column: 4px height, `bg-zinc-800` track, Ember fill, `rounded-full`.

### Intel Feed Cards
- `border-l-2 border-[rgba(63,63,70,0.4)]` left accent — upgraded to `border-[#E8681A]` on new/recent notes.
- Padding: `pl-3 py-2`. Background: transparent (inherits panel bg).
- Role badge + date on one line, body text below. No card boxing.

### Lighthouse Rationale Pull-Quote
- Left border: 3px solid `#E8681A`.
- `pl-4 py-2 my-3`. Body: 0.875rem / italic / Muted Ash. No background fill.

### Sparklines
- Recharts LineChart, 80px height max. No axes, no grid lines, no dots.
- ANZ line: `#E8681A` (ember). NEA: `#F59E0B` (amber). SEA: `#3B82F6` (blue). South Asia: `#22C55E` (green).
- Stroke width: 1.5px. No fill area under line.

### Tooltips
- `bg-zinc-800 border border-[rgba(63,63,70,0.8)]`. Geist, 0.75rem. `p-2 rounded`. Max-width 220px.
- Position via React portal to avoid z-index wars.
- No animation on tooltips — instant appear, 100ms ease-out fade.

### Skeleton Loaders
- `bg-zinc-800` base, `bg-zinc-700` shimmer traveling left to right.
- Match the exact layout dimensions of the content they replace.
- No circular spinners anywhere.

### Empty States
- Centered within the panel/canvas. Muted Ash text. Short label + one-sentence description.
- Optional: a simple SVG icon (no emoji). Action button below if applicable.
- Never "No data found." — use contextual messages: "No lighthouse accounts match these filters" + Reset button.

### People Graph Canvas
- Canvas background: `#09090B` (Void Black). Full-bleed.
- Node default fill: CRM status color (see Status Colors).
- Node stroke: `rgba(255,255,255,0.1)`, 1px. Brightens on hover to Glacier White.
- Edge default opacity: 0.4. Hovered edge: 0.9. Faded nodes: opacity 0.08.
- Graph container border: none — the canvas is edge-to-edge.

### Drawers (Account List, Person Panel)
- Slide in from right. Width: 420px (account list), 380px (person detail).
- `bg-[#18181B]` (Surface Charcoal). `border-l border-[rgba(63,63,70,0.6)]`.
- Header: `border-b border-[rgba(63,63,70,0.4)]`, `px-4 py-3`.
- Spring animation: `stiffness: 280, damping: 28` — feels snappy and weighty.
- Close button: top-right, Whisper Zinc ×, hover Glacier White.
- No backdrop blur — no frosted glass effects on any surface.

---

## 5. Layout Principles

### Grid System
- CSS Grid everywhere. No flexbox percentage hacks with `calc()`.
- Root layout: `grid-rows-[48px_auto_1fr]` (nav / KPI strip / content).
- Content area: map takes full remaining height. Panels overlay via absolute positioning (right-anchored).
- Exec View: `grid-cols-[1fr_380px]` on desktop, single column on mobile.
- Max content width: 1440px, `mx-auto`. Map itself bleeds to container edges.

### Spacing Philosophy
- Base unit: 4px. All spacing in multiples of 4.
- Internal panel padding: `p-4` (16px). Dense data sections: `p-3` (12px).
- Section vertical gap: `space-y-6` within panels.
- Between major UI zones: `border` lines, not margin gaps.
- No `margin: auto` tricks. Grid/flex gap only.

### Map Layout
- Full viewport width minus nav. `min-h-[calc(100dvh-48px-52px)]`.
- Countries fill edge-to-edge within the ComposableMap container.
- Account list drawer overlays from the right without shifting map layout.
- No padding on the map canvas — countries should read close to the viewport edges.

### Responsive Collapse (< 768px)
- All multi-column layouts → single column.
- Map stacks full-width; drawer becomes full-screen overlay.
- KPI strip wraps to 2×2 grid.
- Navigation collapses to hamburger (Zinc-600 hamburger icon, opens full-screen menu overlay in Surface Charcoal).
- Exec View table becomes a stacked card list.
- People graph canvas scales to `100vw` with pinch-to-zoom enabled.
- No horizontal scroll at any viewport width.

### Z-Index System
- Base content: `z-0`
- Map tooltip: `z-10`
- Drawers / panels: `z-20`
- Navigation bar: `z-30`
- Modals / overlays: `z-40`
- Toast notifications: `z-50`

---

## 6. Motion & Interaction

### Spring Physics (default for all transitions)
`stiffness: 280, damping: 28` — snappy and confident. Not bouncy. Not elastic.

For heavy drawers: `stiffness: 200, damping: 30` — slightly slower entry for weight.

### Specific Animations
- **Country fill transition:** CSS `transition: fill 300ms ease-out` — the map recolors on filter change, smooth but not dramatic.
- **Drawer entry:** `translateX(100%) → translateX(0)` via spring. Exit: `translateX(0) → translateX(100%)` ease-in 150ms.
- **KPI numbers:** Count-up animation on mount (0 → final value), 600ms duration, ease-out. Geist Mono ensures numbers don't shift width during animation.
- **Graph node hover:** Immediate radius increase (+3px) via canvas redraw on `mouseover`. No spring here — canvas animations are imperative.
- **Champion pulse overlay:** Separate `<canvas>` element. `requestAnimationFrame` loop. Ring radius = `nodeRadius + 4 + 3 * Math.sin(Date.now() / 400)`. Opacity = `0.4 + 0.3 * Math.sin(Date.now() / 400)`. Color: `#22C55E`.
- **Staggered list reveals:** Account rows cascade in with `opacity: 0 → 1` + `translateY(4px → 0)`. Each row delayed by `index * 30ms`. Max stagger: 300ms total (after that, render immediately).
- **Toast notifications:** Slide in from bottom-right. Spring `stiffness: 400, damping: 30`. Auto-dismiss 3s.
- **Skeleton shimmer:** `background: linear-gradient(90deg, #27272A 25%, #3F3F46 50%, #27272A 75%)`. `background-size: 200% 100%`. `animation: shimmer 1.5s infinite`.

### Performance Rules
- Animate ONLY `transform` and `opacity`. Never `top`, `left`, `width`, `height`, `background-color` (exception: map SVG fill via CSS transition is acceptable at this scale).
- Force GPU layer for the graph canvas: `will-change: transform` on the canvas container.
- Drawer and modal animations use `transform: translateX/Y` only.
- The grain/noise pattern (if used) goes on a `::before` pseudo-element with `pointer-events: none`.

---

## 7. Anti-Patterns (Banned)

**Layout:**
- No centered layouts for primary content — left-aligned or split-screen.
- No 3-equal-column feature grids anywhere.
- No overlapping elements. Every element has its own spatial zone.
- No `position: absolute` stacking of content on top of content.
- No `h-screen` — use `min-h-[100dvh]` to prevent iOS Safari viewport jump.
- No horizontal scroll at any viewport.

**Color & Style:**
- No purple, violet, indigo, or lavender in any context.
- No neon or outer glow of any kind.
- No gradient text on headlines or anywhere visible.
- No frosted glass / backdrop blur (`backdrop-filter: blur`).
- No card shadows (`box-shadow`) — use borders and layered backgrounds.
- No pure black (`#000000`) or pure white (`#FFFFFF`).
- No warm gray + cool gray mixing. Zinc only.
- No saturated accent color other than Anthropic Ember.

**Typography:**
- No `Inter` font.
- No serif fonts of any kind.
- No text shadows.
- No all-caps on body text or headlines (only subheading category labels).
- No `LABEL // YEAR` formatting ("SYSTEM // 2024" etc.).
- No AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen", "Game-changing".

**Components:**
- No circular spinners. Skeletal loaders only.
- No outer glow on buttons in any state.
- No pill buttons (`rounded-full`).
- No emojis in UI.
- No generic placeholder names ("John Doe", "Acme Corp").
- No filler text ("Scroll to explore", "Swipe down", bouncing chevrons).
- No custom mouse cursors.
- No Coming Soon buttons — if a feature isn't ready, show a composed preview, not a dead button.
- No fake metrics or invented statistics — use `[metric]` placeholders if real data isn't available.
- No broken image links — use `picsum.photos/{id}` or SVG avatar initials for people.

**Data Display:**
- No round fake numbers (`99.99%`, `50K users`, `$1M ARR`) unless seeded from data.
- Numbers in tables are always right-aligned, in Geist Mono.
- Progress bars are always 4px height, `rounded-full` track.
- Never show a metric without its denominator or unit.
