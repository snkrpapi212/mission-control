import type { MutationCtx, QueryCtx } from "./_generated/server";

function authEnabled() {
  return process.env.MC_AUTH_ENABLED === "true";
}

type Ctx = MutationCtx | QueryCtx;

function getRole(identity: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (identity as any)?.role ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (identity as any)?.customClaims?.role ||
    "viewer";
}

function getAgentId(identity: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (identity as any)?.agentId ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (identity as any)?.customClaims?.agentId ||
    null;
}

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
  if (getRole(identity) !== "admin") {
    throw new Error("Forbidden");
  }
  return identity;
}

export async function requireActorMatch(ctx: Ctx, actorId: string) {
  if (!authEnabled()) return null;
  const identity = await requireIdentity(ctx);
  const role = getRole(identity);
  if (role === "admin") return identity;

  const claimedAgentId = getAgentId(identity);
  if (!claimedAgentId || claimedAgentId !== actorId) {
    throw new Error("Forbidden: actor mismatch");
  }

  return identity;
}
