const crypto = require("crypto");
const { sb, markPaidAndIssue } = require("./_lib");
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const { eventId, tier, qty, phone } = req.body || {};
    const q = Math.floor(Number(qty));
    if (!(q >= 1 && q <= 10) || !/^(\+?250|0)?7\d{8}$/.test(String(phone || "")))
      return res.status(400).json({ error: "Check the phone number and ticket count." });
    // Price always comes from the database, never from the browser.
    const ev = (await sb(`/events?id=eq.${Number(eventId)}`))[0];
    const t = ev && ev.tiers.find(x => x[0] === tier);
    if (!t) return res.status(400).json({ error: "Ticket type not found." });
    const amount = t[1] * q;
    const txRef = "NY" + crypto.randomBytes(12).toString("hex");
    await sb("/orders", "POST", { tx_ref: txRef, event_id: ev.id, tier, qty: q, amount, phone: String(phone) });
    const back = process.env.SITE_URL + "/?ref=" + txRef;
    if (amount === 0) { await markPaidAndIssue(txRef); return res.json({ link: back }); }
    const r = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: { Authorization: "Bearer " + process.env.FLW_SECRET_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        tx_ref: txRef, amount, currency: "RWF", redirect_url: back,
        payment_options: "mobilemoneyrwanda,card",
        // TODO: replace this placeholder with a real email field if you want email receipts.
        customer: { email: String(phone).replace(/\D/g, "") + "@tickets.nyege.rw", phonenumber: String(phone), name: "Nyege buyer" },
        customizations: { title: "Nyege", description: `${ev.name}: ${q} x ${tier}` }
      })
    });
    const d = await r.json();
    if (!d.data || !d.data.link) { console.error(d); return res.status(502).json({ error: "Payment could not start. Try again." }); }
    res.json({ link: d.data.link });
  } catch (e) { console.error(e); res.status(500).json({ error: "Something went wrong. Try again." }); }
};
