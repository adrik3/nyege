const { sb } = require("./_lib");
module.exports = async (req, res) => {
  const ref = String(req.query.ref || "");
  if (!/^NY[0-9a-f]{24}$/.test(ref)) return res.status(400).json({ error: "Bad reference" });
  try {
    const o = (await sb(`/orders?tx_ref=eq.${ref}&select=status,tier,qty,events(name,date,place)`))[0];
    if (!o) return res.status(404).json({ error: "Order not found" });
    let codes = [];
    if (o.status === "paid") codes = (await sb(`/tickets?tx_ref=eq.${ref}&select=code`)).map(x => x.code);
    res.json({ status: o.status, tier: o.tier, event: o.events, codes });
  } catch (e) { console.error(e); res.status(500).json({ error: "Try again" }); }
};
