const mongoose = require('mongoose');
const { Schema } = mongoose;

const memberSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['viewer','editor'], default: 'editor' }
}, { _id: false });

const workspaceSchema = new Schema({
  name: { type: String, required: true, trim: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [memberSchema]
}, { timestamps: true });

workspaceSchema.index({ owner: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Workspace', workspaceSchema);
