const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = 5000;
const API_URL = 'https://api.spoonacular.com/recipes/complexSearch';

// ⏱️ Cache with 24-hour TTL (in seconds)
const cache = new NodeCache({ stdTTL: 86400 }); // 86400 = 24h

app.use(express.static('public'));

app.get('/api/recipes', async (req, res) => {
  const { type, offset = 0, query = '' } = req.query;

  // Generate a cache key based on parameters
  const cacheKey = `recipes:${query || ''}:${type || ''}:${offset || 0}`;

  // ✅ If cached, return cached response
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log('Returning cached data');
    return res.json(cachedData);
  }

  // ❌ Not cached: Fetch from API
  try {
    const params = {
      apiKey: process.env.SPOONACULAR_API_KEY,
      number: 9,
      offset,
      type,
      addRecipeInformation: true,
    };

    if (query && query.trim() !== '') {
      params.query = query;
    }

    const response = await axios.get(API_URL, { params });
    const data = response.data;

    // 🧠 Cache the data for future requests
    cache.set(cacheKey, data);
    console.log('🌐 Fetched and cached new data');

    res.json(data);
  } catch (err) {
    console.error('❌ Error fetching from Spoonacular:', err.message);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// http://localhost:5000/api/clear-cache

app.get('/api/clear-cache', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).send('⛔ Not allowed in production.');
  }
  cache.flushAll();
  res.send('🧹 Cache cleared!');
});

