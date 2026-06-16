// Beacon receipt-reading backend.
// Runs on Vercel. Holds your Anthropic API key safely (never sent to the browser).
// The app posts { base64, mediaType }; this returns the parsed receipt as JSON.

const PROMPT = `You are the receipt parser for Beacon, a travel budgeting app. Read this receipt image and extract its data. Respond with ONLY a raw JSON object, no markdown fences and no commentary. Schema: {"merchant": string, "date": "YYYY-MM-DD", "currency": "ISO code e.g. EUR/USD/GBP/JPY", "total": number, "category": one of ["Food & Drink","Transport","Lodging","Shopping","Groceries","Other"]}. If a value is not legible, make a sensible best guess. "total" must be a plain number with no currency symbol.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const { base64, mediaType } = req.body || {};
    if (!base64 || !mediaType) {
      res.status(400).json({ error: "Missing image data" });
      return;
    }
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY. Add it in Vercel project settings." });
      return;
    }

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
              { type: "text", text: PROMPT },
            ],
          },
        ],
      }),
    });

    const data = await aiRes.json();
    if (!aiRes.ok) {
      res.status(aiRes.status).json({ error: (data && data.error && data.error.message) || "Anthropic API error" });
      return;
    }

    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      res.status(502).json({ error: "Couldn't read a receipt from that image", raw: text.slice(0, 300) });
      return;
    }
    const parsed = JSON.parse(match[0]);
    parsed.total = Number(parsed.total) || 0;
    res.status(200).json(parsed);
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
}
