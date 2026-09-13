// Vercel serverless function: /api/signal
// Signal's API can't be called straight from the browser (no CORS headers),
// so this fetches it server-side and hands the JSON back to our own page.
//
// Try it directly once deployed:  https://your-site/api/signal

const TOKEN = "0x4e43db428a4e1452ea697baf8884de12d9fb2cc5";

const CANDIDATES = [
  `https://signal.family/api/token/${TOKEN}`,
  `https://signal.family/api/tokens/${TOKEN}`,
  `https://signal.family/api/t/${TOKEN}`
];

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");

  const tried = [];

  for (const url of CANDIDATES) {
    try {
      const r = await fetch(url, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "agent-k-stats/1.0 (+https://github.com/ItsTokes/Agent-K)"
        }
      });
      const text = await r.text();
      tried.push({ url, status: r.status, length: text.length });

      if (!r.ok) continue;

      try {
        const json = JSON.parse(text);
        return res.status(200).json({ ok: true, source: url, data: json });
      } catch (e) {
        // answered, but not JSON — hand back a snippet so we can see what it is
        return res.status(200).json({
          ok: false,
          source: url,
          note: "responded but not JSON",
          snippet: text.slice(0, 800)
        });
      }
    } catch (e) {
      tried.push({ url, error: String(e.message || e) });
    }
  }

  return res.status(200).json({ ok: false, tried });
};
