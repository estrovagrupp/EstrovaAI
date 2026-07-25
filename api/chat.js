// /api/chat.js - pane see Vercel projekti kausta api/
export default async function handler(req, res) {
  // CORS lubamine sinu lehele
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  const GEMINI_KEY = process.env.GEMINI_API_KEY; // <-- Siia paned Vercelis oma uue võtme
  if (!GEMINI_KEY) return res.status(500).json({ error: 'API key not set' });

  try {
    const { text, images, userId } = req.body;
    const parts = [];
    
    if (text) {
      parts.push({ text: `You are Estrova AI, built in Estonia. Be friendly, concise. Answer in Estonian. User ID: ${userId || 'anon'}: ${text}` });
    }
    
    if (images && images.length > 0) {
      images.forEach(img => {
        if (img.base64) {
          parts.push({ inlineData: { mimeType: img.mimeType || 'image/jpeg', data: img.base64 } });
        }
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }] })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini error:', data);
      return res.status(response.status).json({ error: data });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Tere! Ma ei saanud vastust.";
    return res.status(200).json({ reply });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
