const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const PORT = process.env.PORT || 4000;

// Serve static frontend
app.use(express.static('public'));
app.use(bodyParser.json());

// In-memory database
const urlDatabase = {};

// Create short link
app.post('/api/links', (req, res) => {
  const { url, code } = req.body;
  if (!url) return res.status(400).json({ error: 'Please provide a URL' });

  const shortCode = code || Math.random().toString(36).substring(2, 8);

  if (urlDatabase[shortCode]) {
    return res.status(409).json({ error: 'Code already exists' });
  }

  urlDatabase[shortCode] = { url, clicks: 0, lastClicked: null };
  res.json({ code: shortCode });
});

// Get all links
app.get('/api/links', (req, res) => {
  const list = Object.keys(urlDatabase).map(code => ({
    code,
    ...urlDatabase[code]
  }));
  res.json(list);
});

// Get single link stats
app.get('/api/links/:code', (req, res) => {
  const { code } = req.params;
  const data = urlDatabase[code];
  if (!data) return res.status(404).json({ error: 'Not found' });
  res.json({ code, ...data });
});

// Delete link
app.delete('/api/links/:code', (req, res) => {
  const { code } = req.params;
  if (urlDatabase[code]) {
    delete urlDatabase[code];
    return res.sendStatus(200);
  }
  res.sendStatus(404);
});

// Redirect
app.get('/:code', (req, res) => {
  const { code } = req.params;
  const data = urlDatabase[code];
  if (!data) return res.status(404).send('Link not found');

  data.clicks++;
  data.lastClicked = new Date().toISOString();
  res.redirect(data.url);
});

// Healthcheck
app.get('/healthz', (req, res) => {
  res.json({ ok: true, version: '1.0' });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));