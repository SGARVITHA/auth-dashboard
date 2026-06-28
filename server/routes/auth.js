const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// ── POST /register ──────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
 
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Name, email, and password are required' });
 
  try {
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0)
      return res.status(400).json({ message: 'Email already in use' });
 
    const hash = await bcrypt.hash(password, 12);
 
    const result = await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name.trim(), email, hash]
    );
    const user = result.rows[0];
 
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
 
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
 
// ── POST /login ─────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' });
  try {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1', [email]
    );
    const user = result.rows[0];
    if (!user)
      return res.status(404).json({ message: 'No account with that email' });
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(401).json({ message: 'Incorrect password' });
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /me — protected ─────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

 
// PUT /auth/password — change password
// Requires: currentPassword, newPassword in body
router.put('/password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
 
  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: 'Current and new password are required' });
 
  try {
    // 1. Fetch the user from DB
    const result = await db.query(
      'SELECT * FROM users WHERE id = $1', [req.user.userId]
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });
 
    // 2. Verify current password
    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match)
      return res.status(401).json({ message: 'Current password is incorrect' });
 
    // 3. Hash and save new password
    const hash = await bcrypt.hash(newPassword, 12);
    await db.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hash, req.user.userId]
    );
 
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
 
 
// DELETE /auth/account — remove account
// Requires: password in body for confirmation
router.delete('/account', authMiddleware, async (req, res) => {
  const { password } = req.body;
 
  if (!password)
    return res.status(400).json({ message: 'Password is required to delete account' });
 
  try {
    // 1. Fetch user
    const result = await db.query(
      'SELECT * FROM users WHERE id = $1', [req.user.userId]
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });
 
    // 2. Verify password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(401).json({ message: 'Incorrect password' });
 
    // 3. Delete user from DB
    await db.query('DELETE FROM users WHERE id = $1', [req.user.userId]);
 
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;