const mongoose = require('mongoose');
const { Schema } = mongoose;

const boardSchema = new Schema({
  name: { type: String, required: true, trim: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', default: null },
  watchers: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

boardSchema.index({ owner: 1, name: 1 });

module.exports = mongoose.model('Board', boardSchema);
