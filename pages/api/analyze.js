export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { image } = req.body;
  if (!image) return res.status(400).json({ error: 'No image provided' });

  const prompt = `You are an expert XAUUSD technical analyst. Analyze this TradingView chart screenshot.

The chart indicators:
- Red line = MA21
- Blue line = MA50

Return ONLY a valid JSON object, no markdown, no extra text:

{
  "timeframe": "detected timeframe or Unknown",
  "bias": "BULLISH or BEARISH or NEUTRAL",
  "confluence_score": 0.00,
  "ma_analysis": "detailed MA21 and MA50 observation",
  "order_blocks": ["list each OB with price level and type"],
  "support_resistance": ["list each zone with price level"],
  "consolidation": "describe any consolidation visible",
  "trend_lines": ["list visible trend lines and if broken or intact"],
  "broken_zones": ["list flipped S/R zones"],
  "candlestick_patterns": ["list significant patterns"],
  "summary": "2-3 sentence overall market structure read"
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image } },
            { type: 'text', text: prompt }
          ]
        }]
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'API error');

    const raw = data.content.map(i => i.text || '').join('');
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
