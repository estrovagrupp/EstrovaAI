export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-goog-api-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method!== 'POST') return res.status(405).json({ error: 'Use POST' });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'API key missing in Vercel' });

  try {
    const { text, images, userId } = req.body;
    const parts = [];
    if (text) parts.push({ text: `You are Estrova AI, built in Estonia. Answer in Estonian. User ID: ${userId || '123456'}: ${text}` });
    if (images) images.forEach(i => { if(i.base64) parts.push({ inlineData: { mimeType: i.mimeType || 'image/jpeg', data: i.base64 } }); });

    // Toetab mõlemat võtit - paneme nii URL-i kui headerisse
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key
      },
      body: JSON.stringify({ contents: [{ parts }] })
    });

    const data = await resp.json();
    if (!resp.ok) {
      console.error('Gemini error', data);
      return res.status(resp.status).json({ error: data.error?.message || 'Gemini error', details: data });
    }
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Vastust ei tulnud";
    return res.status(200).json({ reply });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
