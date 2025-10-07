const express = require('express');
const auth = require('../middleware/auth');
const List = require('../models/List');
const Board = require('../models/Board');

const router = express.Router();

// GET /api/lists?boardId=...
router.get('/', auth, async (req, res) => {
  const { boardId } = req.query || {};
  if (!boardId) return res.status(400).json({ message: 'boardId is required' });
  // ensure ownership
  const owns = await Board.findOne({ _id: boardId, owner: req.userId }).select('_id');
  if (!owns) return res.status(403).json({ message: 'Forbidden' });
  const lists = await List.find({ board: boardId }).sort({ order: 1, createdAt: 1 });
  res.json({ lists });
});

// POST /api/lists  { boardId, name }
router.post('/', auth, async (req, res) => {
  const { boardId, name } = req.body || {};
  if (!boardId || !name?.trim()) return res.status(400).json({ message: 'boardId and name required' });
  const board = await Board.findOne({ _id: boardId, owner: req.userId }).select('_id');
  if (!board) return res.status(403).json({ message: 'Forbidden' });
  const last = await List.findOne({ board: boardId }).sort({ order: -1 });
  const order = last ? last.order + 1 : 1;
  const list = await List.create({ board: boardId, name: name.trim(), order });
  res.status(201).json({ list });
});

module.exports = router;
