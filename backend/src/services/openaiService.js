const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateResponse = async (systemPrompt, chatHistory) => {
  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
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
    throw new Error('Failed to generate AI response');
  }
};

module.exports = { generateResponse };
