// backend/models/Draft.js
const mongoose = require('mongoose');

const DraftSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Associate draft with a user
  title: { type: String, required: true },
  content: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

const Draft = mongoose.model('Draft', DraftSchema);

module.exports = Draft;

