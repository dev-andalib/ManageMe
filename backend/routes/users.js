const express = require('express');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// GET /api/users/me  -> profile
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.userId).select('_id name email createdAt updatedAt');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
});

// PATCH /api/users/me  -> update name/email
router.patch('/me', auth, async (req, res) => {
  const { name, email } = req.body || {};
  const updates = {};
  if (name) updates.name = name.trim();
  if (email) updates.email = email.trim().toLowerCase();

  if (updates.email) {
    const exists = await User.findOne({ email: updates.email, _id: { $ne: req.userId } });
    if (exists) return res.status(409).json({ message: 'Email already in use' });
  }

  const user = await User.findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true })
                         .select('_id name email');
  res.json({ user });
});

// PATCH /api/users/me/password  -> change password
router.patch('/me/password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) return res.status(400).json({ message: 'currentPassword and newPassword are required' });
  if (newPassword.length < 6) return res.status(400).json({ message: 'New password too short (min 6)' });

  const user = await User.findById(req.userId).select('password');
  if (!user) return res.status(404).json({ message: 'User not found' });

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) return res.status(400).json({ message: 'Current password is incorrect' });

  user.password = newPassword;          // pre-save hook will hash it
  await user.save();

  res.json({ message: 'Password updated' });
});

module.exports = router;
