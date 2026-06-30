const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();
const crypto = require('crypto');
const { sendResetEmail ,sendVerificationEmail} = require('../utils/email');

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
    const verifyToken = crypto.randomBytes(32).toString('hex');

    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, verify_token, is_verified) 
       VALUES ($1, $2, $3, $4, false) RETURNING id, name, email`,
      [name.trim(), email, hash, verifyToken]
    );
    const user = result.rows[0];

    await sendVerificationEmail(user.email, verifyToken);

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, message: 'Check your email to verify your account.' });
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
      'SELECT id, name, email, is_verified, created_at FROM users WHERE id = $1',
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

// ── POST /forgot-password ─────────────────────────────


router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ message: 'Email is required' });

  try {
    // 1. Find user — but don't reveal if they exist
    const result = await db.query(
      'SELECT id, email FROM users WHERE email = $1', [email]
    );
    const user = result.rows[0];

    // Always send the same response regardless
    if (!user) {
      return res.json({
        message: 'If that email exists, we\'ve sent a reset link.'
      });
    }

    // 2. Generate token + expiry
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // 3. Save token + expiry to DB
    await db.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [token, expiry, user.id]
    );

    // 4. Send the email
    await sendResetEmail(user.email, token);

    res.json({ message: 'If that email exists, we\'ve sent a reset link.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /reset-password ─────────────────────────────
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword)
    return res.status(400).json({ message: 'Token and new password are required' });

  try {
    // 1. Find user by token
    const result = await db.query(
      'SELECT * FROM users WHERE reset_token = $1', [token]
    );
    const user = result.rows[0];

    if (!user)
      return res.status(400).json({ message: 'Invalid or expired reset link' });

    // 2. Check token hasn't expired
    if (new Date() > new Date(user.reset_token_expiry)) {
      // Clean up expired token
      await db.query(
        'UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE id = $1',
        [user.id]
      );
      return res.status(400).json({ message: 'Reset link has expired. Request a new one.' });
    }

    // 3. Hash the new password
    const hash = await bcrypt.hash(newPassword, 12);

    // 4. Update password AND clear the token in one query
    await db.query(
      `UPDATE users
       SET password_hash = $1,
           reset_token = NULL,
           reset_token_expiry = NULL
       WHERE id = $2`,
      [hash, user.id]
    );

    res.json({ message: 'Password reset successfully. You can now log in.' });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /verify-email ─────────────────────────────

router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: 'Token is required' });

  try {
    const result = await db.query(
      'SELECT id FROM users WHERE verify_token = $1', [token]
    );
    const user = result.rows[0];

    if (!user)
      return res.status(400).json({ message: 'Invalid verification link' });

    // Just set is_verified — DON'T null the token
    await db.query(
      'UPDATE users SET is_verified = true WHERE id = $1',
      [user.id]
    );

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /resend-verify-email ─────────────────────────────

router.post('/resend-verification', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT email, is_verified, verify_token FROM users WHERE id = $1',
      [req.user.userId]
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.is_verified) return res.status(400).json({ message: 'Already verified' });
 
    // Reuse existing token, or generate a new one if missing
    let token = user.verify_token;
    if (!token) {
      token = crypto.randomBytes(32).toString('hex');
      await db.query('UPDATE users SET verify_token = $1 WHERE id = $2', [token, req.user.userId]);
    }
 
    await sendVerificationEmail(user.email, token);
    res.json({ message: 'Verification email resent' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
 

module.exports = router;