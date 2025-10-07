// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Invalid email' });
    if (password.length < 6) return res.status(400).json({ message: 'Password too short (min 6)' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    // TODO (later): create default workspace "My World" here for user

    const token = signToken(user._id.toString());
    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    // handle duplicate email race
    if (err.code === 11000) return res.status(409).json({ message: 'Email already in use' });
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email & password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = signToken(user._id.toString());
    return res.json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me  (verify token)
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.userId).select('_id name email');
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ user });
});

module.exports = router;
