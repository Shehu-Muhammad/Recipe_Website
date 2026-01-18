const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();
const cors = require('cors');

const app = express();

// ⚠️ CORS not needed on Vercel, but safe for local dev
app.use(cors());

// ⏱️ Cache (works locally, best-effort on Vercel)
const cache = new NodeCache({ stdTTL: 86400 });

const API_URL = 'https://api.spoonacular.com/recipes/complexSearch';

// Serve frontend
app.use(express.static('public'));

app.get('/api/recipes', async (req, res) => {
  const { type, offset = 0, query = '' } = req.query;

  const cacheKey = `recipes:${query}:${type}:${offset}`;

  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log('🧠 Returning cached data');
    return res.json(cachedData);
  }

  try {
    const params = {
      apiKey: process.env.SPOONACULAR_API_KEY,
      number: 9,
      offset,
      type,
      addRecipeInformation: true,
    };

    if (query.trim()) params.query = query;

    const response = await axios.get(API_URL, { params });
    const data = response.data;

    cache.set(cacheKey, data);
    console.log('🌐 Fetched & cached new data');

    res.json(data);
  } catch (err) {
    console.error('❌ Spoonacular error:', err.message);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// 🧹 Dev-only cache clear
app.get('/api/clear-cache', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).send('⛔ Not allowed in production');
  }
  cache.flushAll();
  res.send('🧹 Cache cleared');
});

// ✅ ONLY listen locally
if (process.env.NODE_ENV !== 'production') {
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Local server running at http://localhost:${PORT}`);
  });
}

// ✅ REQUIRED for Vercel
module.exports = app;
