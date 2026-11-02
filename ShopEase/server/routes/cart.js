const express = require('express');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const [rows] = await db.query(
    `SELECT c.product_id AS productId,c.quantity,p.name,p.price,p.image_url AS imageUrl,p.stock
     FROM cart_items c JOIN products p ON p.id=c.product_id WHERE c.user_id=?`,
    [req.user.id]
  );
  res.json(rows);
});

router.post('/', async (req, res) => {
  const productId = Number(req.body.productId);
  const quantity = Math.max(1, Math.min(20, Number(req.body.quantity) || 1));
  const [products] = await db.query('SELECT id,stock FROM products WHERE id=?', [productId]);
  if (!products.length) return res.status(404).json({ message: 'Product not found.' });
  if (products[0].stock < quantity) return res.status(400).json({ message: 'Not enough stock available.' });
  await db.query(
    `INSERT INTO cart_items(user_id,product_id,quantity) VALUES(?,?,?)
     ON DUPLICATE KEY UPDATE quantity=LEAST(quantity+VALUES(quantity),20)`,
    [req.user.id, productId, quantity]
  );
  res.json({ message: 'Added to cart.' });
});

router.put('/:productId', async (req, res) => {
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
    return res.status(400).json({ message: 'Quantity must be between 1 and 20.' });
  }
  const [p] = await db.query('SELECT stock FROM products WHERE id=?', [req.params.productId]);
  if (!p.length || p[0].stock < quantity) return res.status(400).json({ message: 'Requested quantity is unavailable.' });
  const [result] = await db.query(
    'UPDATE cart_items SET quantity=? WHERE user_id=? AND product_id=?',
    [quantity, req.user.id, req.params.productId]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'Cart item not found.' });
  res.json({ message: 'Cart updated.' });
});

router.delete('/:productId', async (req, res) => {
  await db.query('DELETE FROM cart_items WHERE user_id=? AND product_id=?', [req.user.id, req.params.productId]);
  res.json({ message: 'Item removed.' });
});

module.exports = router;
