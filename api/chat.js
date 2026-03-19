export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, system, max_tokens } = req.body;

    // Detect if request contains images
    const hasImage = messages?.some(msg => 
      Array.isArray(msg.content) && msg.content.some(c => c.type === 'image')
    );

    // Get last user message to check complexity
    const lastMessage = messages?.[messages.length - 1];
    const lastContent = Array.isArray(lastMessage?.content) 
      ? lastMessage.content.find(c => c.type === 'text')?.text || ''
      : lastMessage?.content || '';

    // Simple questions = short text, no special keywords
    const isComplex = 
      hasImage ||
      lastContent.length > 200 ||
      /analyse|vergleich|strategie|portfolio|steuer|berechne|plan|compare|analyze|strategy|calculate|tax/i.test(lastContent);

    // Choose model based on complexity
    const model = isComplex 
      ? 'claude-sonnet-4-20250514'  // Complex: Sonnet
      : 'claude-haiku-4-5-20251001'; // Simple: Haiku (much cheaper)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: max_tokens || 1000,
        system,
        messages
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}
