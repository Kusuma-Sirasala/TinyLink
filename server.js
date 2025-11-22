// server.js

const express = require('express');
const path = require('path');
const app = express();

// In-memory store for URLs (for demo purposes)
const urlDatabase = {};

// Middleware to serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API route to create short link
app.post('/api/links', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.json({ error: 'Please provide a URL' });
  }

  // Generate a random 6-character short code
  const code = Math.random().toString(36).substring(2, 8);

  // Store mapping in memory
  urlDatabase[code] = url;

  // Return the short code
  res.json({ code });
});

// Redirect short link to original URL
app.get('/:code', (req, res) => {
  const code = req.params.code;

  if (urlDatabase[code]) {
    // Redirect to original URL
    res.redirect(urlDatabase[code]);
  } else {
    res.status(404).send('Link not found');
  }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});