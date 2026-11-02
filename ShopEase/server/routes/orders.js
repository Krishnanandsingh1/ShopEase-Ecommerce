const express = require('express');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();
router.use(authenticate);

router.post('/', async (req, res) => {
  const { address, phone, paymentMethod } = req.body;
  if (!address?.trim() || !phone?.trim()) return res.status(400).json({ message: 'Address and phone are required.' });
  const paymentMethods = ['Cash on Delivery', 'UPI (Demo)', 'Card (Demo)'];
  if (!paymentMethods.includes(paymentMethod)) return res.status(400).json({ message: 'Choose a valid payment method.' });
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [items] = await conn.query(
      `SELECT c.product_id,c.quantity,p.name,p.price,p.stock
       FROM cart_items c JOIN products p ON p.id=c.product_id
       WHERE c.user_id=? FOR UPDATE`, [req.user.id]);
    if (!items.length) throw new Error('Your cart is empty.');
    for (const item of items) {
      if (item.stock < item.quantity) throw new Error(`${item.name} is out of stock for the selected quantity.`);
    }
    const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const [order] = await conn.query(
      'INSERT INTO orders(user_id,total,address,phone,payment_method) VALUES(?,?,?,?,?)',
      [req.user.id, total, address.trim(), phone.trim(), paymentMethod]);
    for (const item of items) {
      await conn.query(
        'INSERT INTO order_items(order_id,product_id,product_name,price,quantity) VALUES(?,?,?,?,?)',
        [order.insertId, item.product_id, item.name, item.price, item.quantity]);
      await conn.query('UPDATE products SET stock=stock-? WHERE id=?', [item.quantity, item.product_id]);
    }
    await conn.query('DELETE FROM cart_items WHERE user_id=?', [req.user.id]);
    await conn.commit();
    res.status(201).json({ message: 'Order placed successfully.', orderId: order.insertId, total });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ message: err.message || 'Could not place order.' });
  } finally {
    conn.release();
  }
});

router.get('/', async (req, res) => {
  const [orders] = await db.query(
    'SELECT id,total,address,phone,payment_method,status,created_at FROM orders WHERE user_id=? ORDER BY created_at DESC',
    [req.user.id]);
  for (const order of orders) {
    const [items] = await db.query(
      'SELECT product_name AS name,price,quantity FROM order_items WHERE order_id=?', [order.id]);
    order.items = items;
  }
  res.json(orders);
});

module.exports = router;
