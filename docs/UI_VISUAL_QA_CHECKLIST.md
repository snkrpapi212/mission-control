# Mission Control V2 — Visual QA Checklist

Reference: `docs/design-reference/mission-control-target-ui.jpg`

## Blocker status log

### Fix Pack 1 — `js7eyr02y3bc00cc9sykjcrzk180x57p`

1) Typography scale — **PASS**
- Evidence: `src/components/DashboardShell.tsx` brand `text-[31px]`, KPI numerals `text-[50px]`; larger editorial scale retained in `TaskCard`.

2) 3-pane proportions — **PASS**
- Evidence: `src/app/globals.css` width tokens `--w-left` and `--w-right`; shell grid uses `xl:grid-cols-[var(--w-left)_minmax(0,1fr)_var(--w-right)]`.

3) Header hierarchy — **PASS**
- Evidence: `--h-topbar: 72px`; 3-zone header composition in `DashboardShell.tsx` (brand | KPI | controls/time/status).

4) Card density/rhythm — **PASS**
- Evidence: `TaskCard.tsx` uses large editorial stack (title/body/meta), denser spacing, and warm-neutral card primitive rhythm.

5) Chip/tag styling — **PASS**
- Evidence: shared `Chip` primitive (`MissionControlPrimitives.tsx`) used across board/feed/sidebar with pill radius and muted hierarchy.

6) Accent semantics — **PASS**
- Evidence: semantic 3px left rails in `TaskCard.tsx` map priority to green/amber/red/neutral tokens; status accents use semantic token set.

7) Theme token parity + CSS pipeline — **PASS**
- Evidence: `src/app/globals.css` defines full `:root` + `[data-theme="dark"]` semantic token map; updated UI components consume variables (no hardcoded hex values in component classes).
- Evidence: CSS pipeline parses cleanly in lint/typecheck flows after dependency sync (`npm install`, `npm run lint`, `npm run typecheck`).

## Screenshot evidence
- Before: `docs/design-reference/before-after/before-dashboard.png`
- After Pack 1: `docs/design-reference/before-after/after-pack1.png`
- After Pack 2: `docs/design-reference/before-after/after-pack2.png`
- After Pack 3 (light): `docs/design-reference/before-after/after-pack3-light.png`
- After Pack 3 (dark): `docs/design-reference/before-after/after-pack3-dark.png`
