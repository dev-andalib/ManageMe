const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Board = require('../models/Board');
const Workspace = require('../models/Workspace');

const router = express.Router();

// GET /api/boards?workspaceId=optional
router.get('/', auth, async (req, res) => {
  const { workspaceId } = req.query || {};
  const q = { owner: req.userId };
  if (workspaceId) {
    // ensure match when field is an array
    q.workspaces = { $in: [workspaceId] };
  }
  const boards = await Board.find(q).sort({ createdAt: -1 });
  res.json({ boards });
});

// GET /api/boards/:id  (owner only)
router.get('/:id', auth, async (req, res) => {
  const board = await Board.findOne({ _id: req.params.id, owner: req.userId });
  if (!board) return res.status(404).json({ message: 'Board not found' });
  res.json({ board });
});

// POST /api/boards  { name, workspaceIds?: string[] }
router.post('/', auth, async (req, res) => {
  const { name, workspaceIds } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ message: 'Name required' });

  let ids = Array.isArray(workspaceIds) ? workspaceIds.filter(Boolean) : [];

  if (ids.length === 0) {
    let def = await Workspace.findOne({ owner: req.userId, name: 'My World' });
    if (!def) {
      def = await Workspace.create({
        name: 'My World',
        owner: req.userId,
        members: [{ user: req.userId, role: 'editor' }],
      });
    }
    ids = [def._id];
  } else {
    const count = await Workspace.countDocuments({
      _id: { $in: ids },
      $or: [{ owner: req.userId }, { 'members.user': req.userId }],
    });
    if (count !== ids.length) return res.status(403).json({ message: 'Invalid workspace selection' });
  }

  const board = await Board.create({
    name: name.trim(),
    owner: req.userId,
    workspaces: ids,
    watchers: [req.userId],
  });

  res.status(201).json({ board });
});

module.exports = router;
