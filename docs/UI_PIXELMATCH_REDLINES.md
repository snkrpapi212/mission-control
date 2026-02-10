# Mission Control V2 — UI Pixel Match Redlines

Reference: `docs/design-reference/mission-control-target-ui.jpg`

## MUST-FIX blockers
1. Typography scale (global hierarchy)
2. 3-pane proportions (left/center/right composition)
3. Header hierarchy (brand + KPI + time/status)
4. Card density/rhythm
5. Chip/tag styling and hierarchy
6. Accent semantics (rails/status colors)
7. Full light/dark token parity (no hardcoded hex in updated UI)

## Target proportions
- Left: `15%` (`--w-left: clamp(300px, 15vw, 520px)`)
- Center: `62%` (fluid)
- Right: `23%` (`--w-right: clamp(420px, 23vw, 800px)`)

## Target header
- `72px` top bar
- Left: brand block
- Center: KPI numerals + labels
- Right: docs / time / status / action controls

## Target visual tokens
- Warm-neutral surfaces/borders
- Pill chips (`999px`)
- Minimal shadow
- Semantic accents: green/amber/red
- Theme tokens in both light and dark
