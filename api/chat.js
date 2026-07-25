import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'API key not set' });

  try {
    const { text, images, userId } = req.body;
    const ai = new GoogleGenAI({ apiKey: key });
    
    const parts = [];
    if (text) parts.push({ text: `You are Estrova AI, built in Estonia. Be friendly, concise. Answer in Estonian. User ID: ${userId || 'anon'}: ${text}` });
    if (images) images.forEach(img => {
      if(img.base64) parts.push({ inlineData: { mimeType: img.mimeType || 'image/jpeg', data: img.base64 } });
    });

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ parts }]
    });

    return res.status(200).json({ reply: result.text });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
