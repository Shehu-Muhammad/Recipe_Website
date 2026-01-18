import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 86400 }); // 24h

export default async function handler(req, res) {
  return res.json({
    ok: true,
    hasKey: !!process.env.SPOONACULAR_API_KEY
  });
}

export default async function handler(req, res) {
  const { type, offset = 0, query = '' } = req.query;
  const cacheKey = `recipes:${query}:${type}:${offset}`;

  // return cached response if available
  const cachedData = cache.get(cacheKey);
  if (cachedData) return res.status(200).json(cachedData);

  try {
    const params = {
      apiKey: process.env.SPOONACULAR_API_KEY,
      number: 9,
      offset,
      type,
      addRecipeInformation: true,
    };
    if (query.trim() !== '') params.query = query;

    const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', { params });
    cache.set(cacheKey, response.data);
    res.status(200).json(response.data);
  } catch (err) {
    console.error('Error fetching recipes:', err.message);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
}
