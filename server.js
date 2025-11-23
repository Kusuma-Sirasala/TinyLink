// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Path to JSON file (simulates database)
const DB_FILE = path.join(__dirname, 'links.json');

// Middleware
app.use(express.static('public')); // serve frontend
app.use(bodyParser.json());

// Helper to read/write DB
function readDB() {
  if (!fs.existsSync(DB_FILE)) return {};
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// API: create a short link
app.post('/api/links', (req, res) => {
  const { url, code } = req.body;

  if (!url) return res.status(400).json({ error: 'Please provide a URL' });

  const shortCode = code || Math.random().toString(36).substring(2, 8);
  const db = readDB();

  if (db[shortCode]) return res.status(409).json({ error: 'Code already exists' });

  db[shortCode] = {
    url,
    clicks: 0,
    lastClicked: null
  };

  writeDB(db);

  res.json({ code: shortCode });
});

// API: list all links
app.get('/api/links', (req, res) => {
  const db = readDB();
  res.json(db);
});

// API: get stats for a single code
app.get('/api/links/:code', (req, res) => {
  const db = readDB();
  const link = db[req.params.code];

  if (!link) return res.status(404).json({ error: 'Link not found' });

  res.json(link);
});

// API: delete a link
app.delete('/api/links/:code', (req, res) => {
  const db = readDB();
  if (!db[req.params.code]) return res.status(404).json({ error: 'Link not found' });

  delete db[req.params.code];
  writeDB(db);

  res.json({ ok: true });
});

// Redirect
app.get('/:code', (req, res) => {
  const db = readDB();
  const link = db[req.params.code];

  if (!link) return res.status(404).send('Link not found');

  link.clicks += 1;
  link.lastClicked = new Date().toISOString();
  writeDB(db);

  res.redirect(link.url);
});

// Health check
app.get('/healthz', (req, res) => {
  res.json({ ok: true, version: '1.0' });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));