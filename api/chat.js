export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-goog-api-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const key = process.env.GEMINI_API_KEY;

  // TEST: kui teed GET päringu, näitab kas võti on olemas
  if (req.method === 'GET') {
    return res.status(200).json({
      hasKey:!!key,
      keyStart: key? key.substring(0,4) + "..." : "PUUDUB",
      keyLength: key? key.length : 0
    });
  }

  if (req.method!== 'POST') return res.status(405).json({ error: 'Use POST' });
 if (!key) return res.status(500).json({ error: 'API key missing in Vercel - pane AQ... võti Settings -> Env Vars ja lisa KÕIGILE keskkondadele' });
  try {
    const { text } = req.body;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ parts: [{ text: text || "Tere" }] }] })
    });
    const data = await resp.json();
    if (!resp.ok) return res.status(resp.status).json({ error: data.error?.message, full: data });
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "tühi";
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
