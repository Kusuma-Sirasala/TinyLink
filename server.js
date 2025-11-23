const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// MIDDLEWARE
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory database
const urlDatabase = {};

// ✅ CREATE SHORT LINK
app.post('/api/links', (req, res) => {
  const { url, code } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Please provide a URL' });
  }

  const shortCode = code || Math.random().toString(36).substring(2, 8);

  if (urlDatabase[shortCode]) {
    return res.status(409).json({ error: 'Code already exists' });
  }

  urlDatabase[shortCode] = {
    url: url,
    clicks: 0,
    lastClicked: null
  };

  res.json({
    shortCode,
    shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`
  });
});

// ✅ LIST ALL LINKS
app.get('/api/links', (req, res) => {
  const links = Object.entries(urlDatabase).map(([code, data]) => ({
    code,
    ...data
  }));
  res.json(links);
});

// ✅ GET SINGLE LINK STATS
app.get('/api/links/:code', (req, res) => {
  const link = urlDatabase[req.params.code];
  if (!link) return res.status(404).json({ error: 'Not found' });
  res.json(link);
});

// ✅ DELETE LINK
app.delete('/api/links/:code', (req, res) => {
  if (!urlDatabase[req.params.code]) {
    return res.status(404).json({ error: 'Not found' });
  }
  delete urlDatabase[req.params.code];
  res.json({ message: 'Deleted successfully' });
});

// ✅ REDIRECT
app.get('/:code', (req, res) => {
  const link = urlDatabase[req.params.code];
  if (!link) return res.status(404).send('Link not found');

  link.clicks++;
  link.lastClicked = new Date().toISOString();

  res.redirect(302, link.url);
});

// ✅ HEALTH CHECK
app.get('/healthz', (req, res) => {
  res.status(200).json({ ok: true, version: "1.0" });
});

// ✅ FIXED PORT ERROR HERE
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});