export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, apiKey } = req.body;

  if (!prompt || !apiKey) {
    return res.status(400).json({ error: 'prompt and apiKey required' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2024-10-22',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const status = response.status;
      const data = await response.json().catch(() => ({}));
      const msg = data.error?.message || response.statusText;

      if (status === 401) return res.status(401).json({ error: 'Invalid API key' });
      if (status === 429) return res.status(429).json({ error: 'Rate limit exceeded — try again later' });
      if (status === 529) return res.status(529).json({ error: 'Claude API overloaded — try again later' });
      return res.status(status).json({ error: msg });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    return res.status(200).json({ text });
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Claude API timeout (10s)' });
    }
    return res.status(500).json({ error: err.message });
  }
}
