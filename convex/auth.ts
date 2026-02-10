import type { MutationCtx, QueryCtx } from "./_generated/server";

function authEnabled() {
  return process.env.MC_AUTH_ENABLED === "true";
}

type Ctx = MutationCtx | QueryCtx;

export async function requireIdentity(ctx: Ctx) {
  if (!authEnabled()) return null;
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }
  return identity;
}

export async function requireAdmin(ctx: Ctx) {
  if (!authEnabled()) return null;
  const identity = await requireIdentity(ctx);
  const role =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (identity as any)?.role ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (identity as any)?.customClaims?.role ||
    "viewer";

  if (role !== "admin") {
    throw new Error("Forbidden");
  }

  return identity;
}
