const express = require('express');
const auth = require('../middleware/auth');
const Workspace = require('../models/Workspace');

const router = express.Router();

// GET /api/workspaces  (ones I own or belong to)
router.get('/', auth, async (req, res) => {
  const userId = req.userId;
  const workspaces = await Workspace.find({
    $or: [{ owner: userId }, { 'members.user': userId }]
  }).sort({ createdAt: 1 });
  res.json({ workspaces });
});

// POST /api/workspaces  { name }
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name?.trim()) return res.status(400).json({ message: 'Name required' });

    // prevent duplicate per owner
    const exists = await Workspace.findOne({ owner: req.userId, name: name.trim() });
    if (exists) return res.status(409).json({ message: 'Workspace with this name already exists' });

    const ws = await Workspace.create({
      name: name.trim(),
      owner: req.userId,
      members: [{ user: req.userId, role: 'editor' }],
    });
    res.status(201).json({ workspace: ws });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});




// GET /api/workspaces  (ones I own or belong to) + ensure "My World"
router.get('/', auth, async (req, res) => {
  const userId = req.userId;

  // ensure default exists (covers older accounts)
  let def = await Workspace.findOne({ owner: userId, name: 'My World' });
  if (!def) {
    def = await Workspace.create({
      name: 'My World',
      owner: userId,
      members: [{ user: userId, role: 'editor' }],
    });
  }

  const workspaces = await Workspace.find({
    $or: [{ owner: userId }, { 'members.user': userId }],
  }).sort({ createdAt: 1 });

  res.json({ workspaces });
});




module.exports = router;
