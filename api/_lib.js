const crypto = require("crypto");
const BASE = process.env.SUPABASE_URL + "/rest/v1";
const KEY = process.env.SUPABASE_SERVICE_KEY;
async function sb(path, method = "GET", body, prefer) {
  const r = await fetch(BASE + path, {
    method,
    headers: { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json", ...(prefer ? { Prefer: prefer } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const t = await r.text();
  if (!r.ok) throw new Error(t);
  return t ? JSON.parse(t) : null;
}
function newCode() {
  const a = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "NY-";
  for (const b of crypto.randomBytes(8)) s += a[b % a.length];
  return s;
}
// Safe to call twice: only the first call (status still "pending") issues tickets.
async function markPaidAndIssue(txRef) {
  const rows = await sb(`/orders?tx_ref=eq.${encodeURIComponent(txRef)}&status=eq.pending`, "PATCH", { status: "paid" }, "return=representation");
  if (!rows || !rows.length) return;
  const o = rows[0];
  const t = [];
  for (let i = 0; i < o.qty; i++) t.push({ code: newCode(), tx_ref: o.tx_ref, event_id: o.event_id, tier: o.tier });
  await sb("/tickets", "POST", t);
}
module.exports = { sb, markPaidAndIssue };
