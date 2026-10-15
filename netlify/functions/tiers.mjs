// Noah and Sean's tier lists, served at /api/tiers.
//   GET                                  -> every editor's saved list
//   POST { action: "unlock", who, password } -> a token for that editor if the password is right
//   POST { action: "save", who, token, tiers } -> saves that editor's list
// The password lives only in Netlify environment variables: TIER_PASSWORD (shared), or
// TIER_PASSWORD_NOAH / TIER_PASSWORD_SEAN to give each person their own.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { getStore } from "@netlify/blobs";

const EDITORS = (process.env.TIER_EDITORS || "noah,sean").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
const TIERS = ["S", "A", "B", "C", "D"];
const KEY = "tiers/v1";

const json = (status, obj) => new Response(JSON.stringify(obj), {
  status, headers: { "content-type": "application/json", "cache-control": "no-store" },
});
const store = () => getStore({ name: "cache", consistency: "strong" });
const passwordFor = (who) => process.env[`TIER_PASSWORD_${who.toUpperCase()}`] || process.env.TIER_PASSWORD || "";
const tokenFor = (who) => createHmac("sha256", passwordFor(who)).update(`tier-list:${who}`).digest("hex");
const same = (a, b) => {
  const x = createHash("sha256").update(String(a)).digest(), y = createHash("sha256").update(String(b)).digest();
  return timingSafeEqual(x, y);
};

async function readAll() {
  try { return (await store().get(KEY, { type: "json" })) || {}; } catch { return {}; }
}

// Keep only S-D tiers of short text items (team ids look like "team:3"), 80 items max.
function clean(tiers) {
  const out = {}; let total = 0; const seen = new Set();
  for (const t of TIERS) {
    out[t] = [];
    for (const raw of Array.isArray(tiers?.[t]) ? tiers[t] : []) {
      const item = String(raw ?? "").trim().slice(0, 60);
      if (!item || seen.has(item.toLowerCase()) || total >= 80) continue;
      seen.add(item.toLowerCase()); out[t].push(item); total++;
    }
  }
  return out;
}

export default async (req) => {
  if (req.method === "GET") {
    const all = await readAll();
    return json(200, { editors: EDITORS, tiers: TIERS, lists: Object.fromEntries(EDITORS.map((w) => [w, all[w] || null])), passwordSet: EDITORS.every((w) => Boolean(passwordFor(w))) });
  }
  if (req.method !== "POST") return json(405, { error: "Use GET or POST." });
  let body;
  try { body = await req.json(); } catch { return json(400, { error: "Bad request." }); }
  const who = String(body.who || "").toLowerCase();
  if (!EDITORS.includes(who)) return json(403, { error: "Only Noah and Sean can edit a tier list." });
  if (!passwordFor(who)) return json(503, { error: "The tier list password hasn't been set up yet (TIER_PASSWORD on Netlify)." });

  if (body.action === "unlock") {
    if (!same(body.password || "", passwordFor(who))) return json(401, { error: "Wrong password." });
    return json(200, { ok: true, token: tokenFor(who) });
  }
  if (body.action === "save") {
    if (!same(body.token || "", tokenFor(who))) return json(401, { error: "Please unlock again." });
    const all = await readAll();
    all[who] = { tiers: clean(body.tiers), updated: Date.now() };
    await store().setJSON(KEY, all);
    return json(200, { ok: true, list: all[who] });
  }
  return json(400, { error: "Unknown action." });
};

export const config = { path: "/api/tiers" };
