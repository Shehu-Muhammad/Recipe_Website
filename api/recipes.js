const axios = require('axios');

/* ============================
   SIMPLE RATE LIMIT (SERVERLESS)
   ============================ */
const RATE_LIMIT = {};
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 20;

function rateLimit(req, res) {
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket?.remoteAddress ||
    'unknown';

  const now = Date.now();

  RATE_LIMIT[ip] = RATE_LIMIT[ip] || [];
  RATE_LIMIT[ip] = RATE_LIMIT[ip].filter(ts => now - ts < WINDOW_MS);

  if (RATE_LIMIT[ip].length >= MAX_REQUESTS) {
    res.status(429).json({ error: 'Too many requests. Slow down.' });
    return false;
  }

  RATE_LIMIT[ip].push(now);
  return true;
}
/* ============================ */

module.exports = async function handler(req, res) {
  /* 🔒 APPLY RATE LIMIT HERE */
  if (!rateLimit(req, res)) return;

  const { type, offset = 0, query = '' } = req.query;

  try {
    const params = {
      apiKey: process.env.SPOONACULAR_API_KEY,
      number: 9,
      offset,
      type,
      addRecipeInformation: true,
    };

    if (query.trim()) params.query = query;

    const response = await axios.get(
      'https://api.spoonacular.com/recipes/complexSearch',
      { params }
    );

    /* 🚀 CDN CACHE (Vercel Edge) */
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=86400, stale-while-revalidate=43200'
    );

    res.status(200).json(response.data);
  } catch (err) {
    console.error('❌ Spoonacular error:', err.message);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
};
