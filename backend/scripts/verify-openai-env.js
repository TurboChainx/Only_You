/**
 * Run from backend folder: node scripts/verify-openai-env.js
 * Confirms dotenv + OPENAI_API_KEY can call OpenAI (same path as chat).
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const OpenAI = require('openai');

async function main() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    console.error('FAIL: OPENAI_API_KEY is missing in backend/.env');
    process.exit(1);
  }
  const openai = new OpenAI({ apiKey: key });
  const res = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    messages: [{ role: 'user', content: 'Reply with exactly: ok' }],
    max_tokens: 5,
  });
  console.log('OK — OpenAI responded:', res.choices[0]?.message?.content?.trim());
  process.exit(0);
}

main().catch((e) => {
  console.error('FAIL:', e.message);
  process.exit(1);
});
