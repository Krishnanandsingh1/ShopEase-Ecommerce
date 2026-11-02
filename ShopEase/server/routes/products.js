const express = require('express');
const db = require('../config/db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search = '', category = '' } = req.query;
    const [rows] = await db.query(
      `SELECT id,name,description,category,price,image_url,stock
       FROM products WHERE name LIKE ? AND category LIKE ? ORDER BY created_at DESC`,
      [`%${search}%`, category ? category : '%']
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load products.' });
  }
});

router.get('/:id', async (req, res) => {
  const [rows] = await db.query(
    'SELECT id,name,description,category,price,image_url,stock FROM products WHERE id=?',
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ message: 'Product not found.' });
  res.json(rows[0]);
});

module.exports = router;
