const express = require('express');
const app = express();
const { Pool } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.use(express.json());
app.use(express.static('public'));

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ ok: true, version: '1.0' });
});

// Create link
app.post('/api/links', async (req, res) => {
  const { url, code } = req.body;

  if (!url || !/^https?:\/\//i.test(url)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  let shortCode = code || crypto.randomBytes(3).toString('hex'); // 6 chars
  shortCode = shortCode.slice(0, 8);

  try {
    const existing = await pool.query('SELECT * FROM links WHERE code=$1', [shortCode]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Code already exists' });

    await pool.query(
      'INSERT INTO links(code, url) VALUES($1, $2)',
      [shortCode, url]
    );

    res.json({ code: shortCode, url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// List all links
app.get('/api/links', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM links ORDER BY created_at DESC');
  res.json(rows);
});

// Stats for one code
app.get('/api/links/:code', async (req, res) => {
  const { code } = req.params;
  const { rows } = await pool.query('SELECT * FROM links WHERE code=$1', [code]);
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

// Delete a link
app.delete('/api/links/:code', async (req, res) => {
  const { code } = req.params;
  const { rowCount } = await pool.query('DELETE FROM links WHERE code=$1', [code]);
  if (!rowCount) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});

// Redirect
app.get('/:code', async (req, res) => {
  const { code } = req.params;
  const { rows } = await pool.query('SELECT * FROM links WHERE code=$1', [code]);
  if (!rows.length) return res.status(404).send('Link not found');

  const link = rows[0];
  await pool.query('UPDATE links SET click_count = click_count + 1, last_clicked = NOW() WHERE code=$1', [code]);

  res.redirect(link.url);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));