const express = require('express');
const db = require('../config/db');
const { authenticate, adminOnly } = require('../middleware/auth');
const router = express.Router();
router.use(authenticate, adminOnly);

router.get('/stats', async (req, res) => {
  const [[users]] = await db.query("SELECT COUNT(*) AS total FROM users WHERE role='customer'");
  const [[products]] = await db.query('SELECT COUNT(*) AS total FROM products');
  const [[orders]] = await db.query('SELECT COUNT(*) AS total FROM orders');
  const [[sales]] = await db.query("SELECT COALESCE(SUM(total),0) AS total FROM orders WHERE status <> 'Cancelled'");
  res.json({ users: users.total, products: products.total, orders: orders.total, sales: sales.total });
});

router.get('/products', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM products ORDER BY id DESC');
  res.json(rows);
});

router.post('/products', async (req, res) => {
  const { name, description, category, price, image_url, stock } = req.body;
  if (!name?.trim() || !category?.trim() || !Number.isFinite(Number(price)) || Number(price) <= 0) {
    return res.status(400).json({ message: 'Name, category and a valid price are required.' });
  }
  const [result] = await db.query(
    'INSERT INTO products(name,description,category,price,image_url,stock) VALUES(?,?,?,?,?,?)',
    [name.trim(), description || '', category.trim(), Number(price), image_url || '', Math.max(0, Number(stock) || 0)]);
  res.status(201).json({ message: 'Product added.', id: result.insertId });
});

router.put('/products/:id', async (req, res) => {
  const { name, description, category, price, image_url, stock } = req.body;
  await db.query(
    'UPDATE products SET name=?,description=?,category=?,price=?,image_url=?,stock=? WHERE id=?',
    [name, description || '', category, Number(price), image_url || '', Math.max(0, Number(stock) || 0), req.params.id]);
  res.json({ message: 'Product updated.' });
});

router.delete('/products/:id', async (req, res) => {
  await db.query('DELETE FROM products WHERE id=?', [req.params.id]);
  res.json({ message: 'Product deleted.' });
});

router.get('/orders', async (req, res) => {
  const [rows] = await db.query(
    `SELECT o.id,o.total,o.address,o.phone,o.status,o.created_at,u.name AS customer,u.email
     FROM orders o JOIN users u ON u.id=o.user_id ORDER BY o.created_at DESC`);
  res.json(rows);
});

router.patch('/orders/:id', async (req, res) => {
  const allowed = ['Placed','Processing','Shipped','Delivered','Cancelled'];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid order status.' });
  await db.query('UPDATE orders SET status=? WHERE id=?', [req.body.status, req.params.id]);
  res.json({ message: 'Order status updated.' });
});

router.get('/customers', async (req, res) => {
  const [rows] = await db.query(
    "SELECT id,name,email,created_at FROM users WHERE role='customer' ORDER BY created_at DESC");
  res.json(rows);
});

module.exports = router;
