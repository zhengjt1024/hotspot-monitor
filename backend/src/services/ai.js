import axios from 'axios';
import crypto from 'crypto';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

function getConfig() {
  return {
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash',
  };
}

export async function analyzeContent(keyword, { title, snippet, source }) {
  const { apiKey, model } = getConfig();

  if (!apiKey || apiKey.includes('your-key')) {
    console.warn('[AI] No OpenRouter API key configured, using fallback');
    return fallbackAnalysis(keyword, title, snippet);
  }

  const prompt = 'You are an AI content analyst. Analyze this content about "' + keyword + '".\n\nTitle: ' + (title || '') + '\nSnippet: ' + (snippet || 'N/A') + '\nSource: ' + (source || '') + '\n\nReturn a JSON object with exactly these fields:\n- "relevanceScore": number 0-100, how relevant is this to "' + keyword + '"?\n- "isFake": boolean, is this likely fake news, clickbait, or misleading content? Be strict.\n- "summary": string, a concise 1-2 sentence summary in Chinese.\n- "reason": string, brief explanation of your judgment.\n\nONLY return valid JSON, no other text.';

  try {
    const response = await axios.post(OPENROUTER_URL, {
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 500,
    }, {
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'AI Host Monitor',
      },
      timeout: 30000,
    });

    const text = response.data.choices?.[0]?.message?.content || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        relevanceScore: Math.min(100, Math.max(0, result.relevanceScore || 50)),
        isFake: !!result.isFake,
        summary: result.summary || '',
        reason: result.reason || '',
      };
    }
    return fallbackAnalysis(keyword, title, snippet);
  } catch (err) {
    console.error('[AI] OpenRouter error:', err.message);
    return fallbackAnalysis(keyword, title, snippet);
  }
}

function fallbackAnalysis(keyword, title) {
  const titleLower = (title || '').toLowerCase();
  const kwLower = keyword.toLowerCase();
  const relevance = titleLower.includes(kwLower) ? 70 : 30;
  return {
    relevanceScore: relevance,
    isFake: false,
    summary: title ? title.slice(0, 100) : '',
    reason: 'Fallback analysis (no AI key configured)',
  };
}

export function contentHash(title, url) {
  return crypto.createHash('md5').update([title, url].filter(Boolean).join('')).digest('hex');
}