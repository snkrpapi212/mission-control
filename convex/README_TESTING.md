# Convex Tests & Typechecking

This repo includes Convex backend modules under `convex/`.

## Why `tsc` excludes `convex/`

Convex normally generates `convex/_generated/*` (server/api/dataModel) after you run `npx convex dev`.
Those generated types are required for strict typechecking of the Convex modules.

In CI / local dev without a configured Convex deployment, we exclude `convex/**` from `tsc` so the
Next.js app + daemon can typecheck cleanly.

## Running Convex tests

If you have a Convex deployment configured:

```bash
cd /data/workspace/mission-control
npx convex dev   # or set CONVEX_DEPLOYMENT
npm run test:convex
```

(Convex tests rely on Vite/ESM features like `import.meta.glob`.)
