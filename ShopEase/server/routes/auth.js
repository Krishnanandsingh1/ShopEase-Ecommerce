const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
      return res.status(400).json({ message: 'Enter your name, valid email and password (at least 8 characters).' });
    }
    const [exists] = await db.query('SELECT id FROM users WHERE email=?', [email.trim().toLowerCase()]);
    if (exists.length) return res.status(409).json({ message: 'Email already registered.' });
    const hash = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      'INSERT INTO users(name,email,password_hash) VALUES(?,?,?)',
      [name.trim(), email.trim().toLowerCase(), hash]
    );
    res.status(201).json({ message: 'Account created. You can now login.', userId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not create account.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';
    const [rows] = await db.query('SELECT id,name,email,password_hash,role FROM users WHERE email=?', [email]);
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }
    const user = rows[0];
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed.' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  const [rows] = await db.query('SELECT id,name,email,role FROM users WHERE id=?', [req.user.id]);
  if (!rows.length) return res.status(404).json({ message: 'User not found.' });
  res.json({ user: rows[0] });
});

module.exports = router;
