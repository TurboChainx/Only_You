const OpenAI = require('openai');
const Settings = require('../models/Settings');

/**
 * Resolve API key the same way as admin "Test OpenAI": DB setting first, then env.
 * Client is created per request so keys updated via admin apply without restart.
 */
async function getOpenAIClient() {
  let apiKey = null;
  try {
    apiKey = await Settings.getSetting('openaiApiKey');
  } catch (e) {
    /* Settings may be unavailable before DB connects; fall through to env */
  }
  if (!apiKey || !String(apiKey).trim()) {
    apiKey = process.env.OPENAI_API_KEY;
  }
  if (!apiKey || !String(apiKey).trim()) {
    const err = new Error(
      'OpenAI API key is not configured. Set OPENAI_API_KEY in backend/.env on the server or add it in Admin → System settings.'
    );
    err.code = 'OPENAI_NOT_CONFIGURED';
    throw err;
  }
  return new OpenAI({ apiKey: String(apiKey).trim() });
}

const generateResponse = async (systemPrompt, chatHistory) => {
  const openai = await getOpenAIClient();
  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      messages: messages,
      max_tokens: 300,
      temperature: 0.9,
      presence_penalty: 0.6,
      frequency_penalty: 0.3,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    if (error.code === 'OPENAI_NOT_CONFIGURED') throw error;
    throw new Error('Failed to generate AI response');
  }
};

module.exports = { generateResponse };
