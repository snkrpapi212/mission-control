# Baseline Cleanup Report

Date (UTC): 2026-02-10
Branch: `dev`

## Scope Completed

### 1) Dependency hygiene
- Added missing test dependency: `@testing-library/user-event`.
- Kept lockfile aligned with dependency changes (`package-lock.json` updated).
- Verified `lucide-react` dependency is present and resolvable.

### 2) TypeScript health
- Fixed test/type mismatches against current task model (migrated stale test fixtures to current shape).
- Removed stale/invalid props in tests (e.g. legacy `onTaskMove`, `assignedTo`).
- Typecheck now passes.

### 3) Lint cleanliness
- Resolved CI-relevant lint issues:
  - Unused typed callback args (renamed with `_` prefix where appropriate).
  - Unused imports/constants removed.
- Lint now passes with no warnings/errors.

### 4) Test baseline
- Resolved missing module errors for `@testing-library/user-event`.
- Reworked stale UI tests to align with current component behavior and markup.
- Added deterministic cleanup for dark mode context tests.
- Test suite now passes.

### 5) Build reliability
- Production build compiles successfully, but fails during page data collection in this environment with:
  - `spawn /usr/local/bin/node EAGAIN`
- This appears environment/process-limit related (not a source compile/type/lint failure).

## Validation Matrix

- `npm install`: **PASS**
- `npm run lint`: **PASS**
- `npm run typecheck`: **PASS**
- `npm test -- --run`: **PASS**
- `npm run build`: **FAIL (environment-limited: EAGAIN during Next.js page data collection)**

## Notes
- Updated `test` script to enforce `NODE_ENV=test` and `lint` script to enforce `NODE_ENV=development` for stable local/CI behavior when shell environment defaults to `NODE_ENV=production`.
- `DarkModeProvider` now always provides context to children (prevents invalid-hook usage path during initial mount/testing).
