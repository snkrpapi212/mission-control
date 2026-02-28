/**
 * OpenClaw Gateway Client
 * Connects Mission Control to OpenClaw via WebSocket Gateway protocol v3.
 *
 * Environment variables:
 * - NEXT_PUBLIC_OPENCLAW_GATEWAY_URL: Gateway URL (https://xxx.up.railway.app)
 * - OPENCLAW_GATEWAY_TOKEN: Auth token for gateway
 * - OPENCLAW_GATEWAY_PASSWORD: Alternative password auth (token preferred)
 */

import WebSocket from "ws";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

let reqCounter = 0;

type DeviceIdentity = {
  deviceId: string;
  publicKeyPem: string;
  privateKeyPem: string;
  deviceToken?: string;
};

const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");

function base64UrlEncode(buf: Buffer): string {
  return buf.toString("base64").replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

function derivePublicKeyRaw(publicKeyPem: string): Buffer {
  const key = crypto.createPublicKey(publicKeyPem);
  const spki = key.export({ type: "spki", format: "der" }) as Buffer;
  if (
    spki.length === ED25519_SPKI_PREFIX.length + 32 &&
    spki.subarray(0, ED25519_SPKI_PREFIX.length).equals(ED25519_SPKI_PREFIX)
  ) {
    return spki.subarray(ED25519_SPKI_PREFIX.length);
  }
  return spki;
}

function fingerprintPublicKey(publicKeyPem: string): string {
  const raw = derivePublicKeyRaw(publicKeyPem);
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function publicKeyRawBase64UrlFromPem(publicKeyPem: string): string {
  return base64UrlEncode(derivePublicKeyRaw(publicKeyPem));
}

function resolveIdentityPath(): string {
  return (
    process.env.OPENCLAW_DEVICE_IDENTITY_PATH ||
    process.env.MISSION_CONTROL_DEVICE_IDENTITY_PATH ||
    path.join(process.cwd(), ".openclaw", "device-identity.json")
  );
}

function loadOrCreateDeviceIdentity(): DeviceIdentity {
  const filePath = resolveIdentityPath();

  try {
    if (fs.existsSync(filePath)) {
      const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as Partial<DeviceIdentity>;
      if (parsed?.publicKeyPem && parsed?.privateKeyPem) {
        const deviceId = fingerprintPublicKey(String(parsed.publicKeyPem));
        return {
          deviceId,
          publicKeyPem: String(parsed.publicKeyPem),
          privateKeyPem: String(parsed.privateKeyPem),
          deviceToken: typeof parsed.deviceToken === "string" ? parsed.deviceToken : undefined,
        };
      }
    }
  } catch {
    // fall through
  }

  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
  const publicKeyPem = publicKey.export({ type: "spki", format: "pem" }).toString();
  const privateKeyPem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
  const deviceId = fingerprintPublicKey(publicKeyPem);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    `${JSON.stringify({ deviceId, publicKeyPem, privateKeyPem }, null, 2)}\n`,
    { mode: 0o600 }
  );
  try {
    fs.chmodSync(filePath, 0o600);
  } catch {
    // best effort
  }

  return { deviceId, publicKeyPem, privateKeyPem };
}

function buildDeviceAuthPayloadV3(params: {
  deviceId: string;
  clientId: string;
  clientMode: string;
  role: string;
  scopes: string[];
  signedAtMs: number;
  token?: string | null;
  nonce: string;
  platform?: string | null;
  deviceFamily?: string | null;
}): string {
  const scopes = params.scopes.join(",");
  const token = params.token ?? "";
  const platform = (params.platform ?? "").trim().toLowerCase();
  const deviceFamily = (params.deviceFamily ?? "").trim().toLowerCase();
  return [
    "v3",
    params.deviceId,
    params.clientId,
    params.clientMode,
    params.role,
    scopes,
    String(params.signedAtMs),
    token,
    params.nonce,
    platform,
    deviceFamily,
  ].join("|");
}

function signDevicePayload(privateKeyPem: string, payload: string): string {
  const key = crypto.createPrivateKey(privateKeyPem);
  const sig = crypto.sign(null, Buffer.from(payload, "utf8"), key);
  return base64UrlEncode(sig);
}

function getWsUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_OPENCLAW_GATEWAY_URL ||
    process.env.OPENCLAW_GATEWAY_URL ||
    "http://localhost:18789";
  return url.replace(/^https/, "wss").replace(/^http/, "ws");
}

function getOriginUrl(): string {
  // IMPORTANT: The WebSocket `Origin` header should be the *client/app* origin,
  // not the gateway URL. Some gateway deployments validate Origin.
  //
  // Configure with:
  // - MISSION_CONTROL_ORIGIN (recommended): e.g. http://134.209.163.192
  // - NEXT_PUBLIC_MISSION_CONTROL_ORIGIN (optional)
  const origin =
    process.env.MISSION_CONTROL_ORIGIN ||
    process.env.NEXT_PUBLIC_MISSION_CONTROL_ORIGIN ||
    process.env.NEXT_PUBLIC_OPENCLAW_GATEWAY_URL ||
    process.env.OPENCLAW_GATEWAY_URL ||
    "http://localhost:18789";

  return origin;
}

function getAuthPayload(): Record<string, string> {
  const token = process.env.OPENCLAW_GATEWAY_TOKEN;
  const password = process.env.OPENCLAW_GATEWAY_PASSWORD;
  if (token) return { token };
  if (password) return { password };
  return {};
}

/**
 * Open a connected + authenticated WebSocket to the OpenClaw Gateway.
 * Handles the connect.challenge → connect handshake automatically.
 */
function openGatewayWs(timeoutMs = 15000, scopes: string[] = ["operator.read"]): Promise<WebSocket> {
  const debug = process.env.OPENCLAW_DEBUG === "1";
  const dlog = (...args: unknown[]) => {
    if (debug) console.log("[openclaw-ws]", ...args);
  };
  return new Promise((resolve, reject) => {
    const scopesParam = scopes;
    const wsUrl = getWsUrl();
    const origin = getOriginUrl();
    dlog("connecting", { wsUrl, origin });
    const ws = new WebSocket(wsUrl, { origin });
    let done = false;

    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        ws.close();
        reject(new Error(`Gateway connect timeout after ${timeoutMs}ms`));
      }
    }, timeoutMs);

    ws.on("open", () => {
      dlog("socket open");
      // Wait for connect.challenge
    });

    ws.on("message", (data: Buffer) => {
      try {
        const msg = JSON.parse(data.toString());

        // Step 1: Respond to connect.challenge
        if (msg.type === "event" && msg.event === "connect.challenge") {
          dlog("got connect.challenge");
          const nonce = (msg.payload as { nonce?: unknown } | undefined)?.nonce;
          if (typeof nonce !== "string" || !nonce) {
            ws.close();
            done = true;
            clearTimeout(timer);
            reject(new Error("Gateway connect.challenge missing nonce"));
            return;
          }

          const client = {
            // Keep the canonical Control UI client id/mode so schema validation passes.
            id: "openclaw-control-ui",
            version: "1.0.0",
            platform: "linux",
            mode: "ui",
          };
          const role = "operator";
          const scopes = scopesParam; // provided by caller (e.g. operator.admin)

          const auth = getAuthPayload();
          // Prefer a previously issued deviceToken when available (unless disabled).
          const identity = loadOrCreateDeviceIdentity();
          const disableDeviceToken = process.env.OPENCLAW_DISABLE_DEVICE_TOKEN === "1";
          const authForConnect =
            !disableDeviceToken && identity.deviceToken && !auth.password
              ? { ...auth, deviceToken: identity.deviceToken, token: undefined }
              : auth;

          // Device identity + signature (required for non-local/remote connections)
          const signedAtMs = Date.now();
          const tokenForSignature =
            (authForConnect as { token?: string; deviceToken?: string } | undefined)?.token ??
            (authForConnect as { token?: string; deviceToken?: string } | undefined)?.deviceToken ??
            "";

          const payload = buildDeviceAuthPayloadV3({
            deviceId: identity.deviceId,
            clientId: client.id,
            clientMode: client.mode,
            role,
            scopes,
            signedAtMs,
            // IMPORTANT: signature token must match the auth credential used (token OR deviceToken)
            token: tokenForSignature,
            nonce,
            platform: client.platform,
          });
          const signature = signDevicePayload(identity.privateKeyPem, payload);

          ws.send(
            JSON.stringify({
              type: "req",
              id: "mc-connect",
              method: "connect",
              params: {
                minProtocol: 3,
                maxProtocol: 3,
                client,
                role,
                scopes,
                caps: [],
                commands: [],
                permissions: {},
                device: {
                  id: identity.deviceId,
                  publicKey: publicKeyRawBase64UrlFromPem(identity.publicKeyPem),
                  signature,
                  signedAt: signedAtMs,
                  nonce,
                },
                auth: authForConnect,
                locale: "en-US",
                userAgent: "mission-control/1.0.0",
              },
            })
          );
          return;
        }

        // Step 2: Handle connect response
        if (msg.id === "mc-connect") {
          dlog("connect response", { ok: msg.ok, error: msg.error?.message, details: msg.error?.details?.code });
          if (msg.ok) {
            // Persist issued deviceToken for future connects (unless disabled).
            try {
              const disableDeviceToken = process.env.OPENCLAW_DISABLE_DEVICE_TOKEN === "1";
              const issued = msg.payload?.auth?.deviceToken;
              if (!disableDeviceToken && typeof issued === "string" && issued) {
                const filePath = resolveIdentityPath();
                const current = loadOrCreateDeviceIdentity();
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
                fs.writeFileSync(
                  filePath,
                  `${JSON.stringify({
                    deviceId: current.deviceId,
                    publicKeyPem: current.publicKeyPem,
                    privateKeyPem: current.privateKeyPem,
                    deviceToken: issued,
                  }, null, 2)}\n`,
                  { mode: 0o600 }
                );
              }
            } catch {
              // ignore
            }

            done = true;
            clearTimeout(timer);
            resolve(ws);
          } else {
            done = true;
            clearTimeout(timer);
            ws.close();
            reject(
              new Error(
                `Gateway auth failed: ${msg.error?.message || JSON.stringify(msg.error)}`
              )
            );
          }
          return;
        }
      } catch {
        // Non-JSON, ignore
      }
    });

    ws.on("error", (err: Error) => {
      dlog("socket error", err.message);
      if (!done) {
        done = true;
        clearTimeout(timer);
        reject(new Error(`WebSocket error: ${err.message}`));
      }
    });

    ws.on("close", (code: number, reason: Buffer) => {
      dlog("socket close", { code, reason: reason?.toString?.() });
      if (!done) {
        done = true;
        clearTimeout(timer);
        reject(new Error("WebSocket closed before auth completed"));
      }
    });
  });
}

/**
 * Make a single RPC call to the OpenClaw Gateway.
 * Opens connection, authenticates, sends request, returns response, closes.
 */
export async function gatewayCall<T = unknown>(
  method: string,
  params: Record<string, unknown> = {},
  timeoutMs = 30000,
  scopes: string[] = ["operator.read"]
): Promise<T> {
  const ws = await openGatewayWs(timeoutMs, scopes);

  return new Promise((resolve, reject) => {
    const reqId = `mc-${++reqCounter}`;
    let done = false;

    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        ws.close();
        reject(new Error(`RPC call ${method} timeout after ${timeoutMs}ms`));
      }
    }, timeoutMs);

    ws.on("message", (data: Buffer) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.id === reqId) {
          done = true;
          clearTimeout(timer);
          ws.close();
          if (msg.ok) {
            resolve(msg.payload as T);
          } else {
            reject(
              new Error(
                `RPC error (${method}): ${msg.error?.message || JSON.stringify(msg.error)}`
              )
            );
          }
        }
      } catch {
        // ignore
      }
    });

    ws.on("close", () => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        reject(new Error("WebSocket closed before RPC response"));
      }
    });

    ws.on("error", (err: Error) => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        reject(new Error(`WebSocket error during RPC: ${err.message}`));
      }
    });

    // Send the RPC request
    ws.send(
      JSON.stringify({
        type: "req",
        id: reqId,
        method,
        params,
      })
    );
  });
}

/**
 * Check gateway health
 */
export async function checkHealth(): Promise<{
  ok: boolean;
  version?: string;
  error?: string;
}> {
  try {
    await gatewayCall<{ ok: boolean }>("health", {}, 10000);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/**
 * Send a message to an agent session
 */
export async function sendToAgent(
  agentId: string,
  message: string,
  sessionKey?: string,
  scopes: string[] = ["operator.admin"]
): Promise<{ ok: boolean; error?: string }> {
  try {
    const key = sessionKey || `agent:${agentId}:main`;
    const result = await gatewayCall<{ ok: boolean; error?: string }>(
      "sessions.send",
      { sessionKey: key, message },
      30000,
      scopes
    );
    return { ok: result.ok !== false, error: result.error };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/**
 * List active sessions
 */
export async function listSessions(scopes: string[] = ["operator.read"]): Promise<unknown[]> {
  const result = await gatewayCall<{ sessions: unknown[] }>(
    "sessions.list",
    {},
    30000,
    scopes
  );
  return result.sessions || [];
}

/**
 * Get session history
 */
// NOTE: sessions.history is not implemented on the gateway.
// Use sessions.preview for transcripts, or use runId-based completion via agent.wait.


/**
 * Start an agent run (returns runId)
 */
export async function startAgentRun(
  agentId: string,
  task: string,
  scopes: string[] = ["operator.admin"]
): Promise<{ ok: boolean; runId?: string; error?: string }> {
  try {
    // OpenClaw gateway uses `agent` method to start a run.
    const idempotencyKey = `mc-${agentId}-${Date.now()}`;
    const result = await gatewayCall<any>(
      "agent",
      {
        agentId,
        message: task,
        idempotencyKey,
        // Use internal bridge channel (no external delivery required)
        channel: "webchat",
      },
      30000,
      scopes
    );

    const runId = result?.runId || result?.payload?.runId;
    if (!runId) {
      return { ok: false, error: "missing runId from gateway" };
    }
    return { ok: true, runId };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
