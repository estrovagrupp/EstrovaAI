export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-goog-api-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const key = process.env.GEMINI_API_KEY;
  if (req.method === 'GET') return res.status(200).json({ hasKey:!!key, len: key?.length, ok: true });
  if (!key) return res.status(500).json({ error: 'API key missing' });

  const models = ["gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-1.5-flash-002", "gemini-2.5-flash"];
  const { text } = req.body || {};

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          contents: [{ parts: [{ text: text || "Tere!" }] }],
          systemInstruction: { parts: [{ text: "Sa oled Estrova AI - ehitatud Eestis. Oled sõbralik, lühike ja abivalmis. Vasta eesti keeles kui küsitakse eesti keeles." }] }
        })
      });
      const data = await resp.json();
      if (resp.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return res.status(200).json({ reply: data.candidates[0].content.parts[0].text, model });
      }
    } catch(e) { continue; }
  }
  return res.status(500).json({ error: 'Ükski mudel ei tööta, kontrolli kas Generative Language API on Google Cloudis enabled' });
}
