const { sb, markPaidAndIssue } = require("./_lib");
module.exports = async (req, res) => {
  if (req.headers["verif-hash"] !== process.env.FLW_SECRET_HASH) return res.status(401).end();
  try {
    const ref = req.body && req.body.data && req.body.data.tx_ref;
    if (!ref) return res.status(200).end();
    // Never trust the webhook body alone: ask Flutterwave directly.
    const r = await fetch("https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=" + encodeURIComponent(ref), {
      headers: { Authorization: "Bearer " + process.env.FLW_SECRET_KEY }
    });
    const d = (await r.json()).data;
    const o = (await sb(`/orders?tx_ref=eq.${encodeURIComponent(ref)}`))[0];
    if (o && d && d.status === "successful" && d.currency === "RWF" && Number(d.amount) >= o.amount)
      await markPaidAndIssue(ref);
    res.status(200).end();
  } catch (e) { console.error(e); res.status(500).end(); } // 500 makes Flutterwave retry
};
