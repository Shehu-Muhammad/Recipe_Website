const express = require('express');
const axios = require('axios');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = 5000;
const API_URL = 'https://api.spoonacular.com/recipes/complexSearch';

app.get('/api/recipes', async (req, res) => {
  try {
    const { type, offset = 0, query = '' } = req.query;
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

    res.json(response.data);
  } catch (err) {
    console.error('Error fetching from Spoonacular:', err);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
