const mongoose = require('mongoose');

const chatbotResponseSchema = new mongoose.Schema({
  intent:    { type: String, required: true, unique: true, trim: true }, // e.g. 'cpr', 'seizure'
  keywords:  { type: [String], default: [] },                            // trigger words
  answer:    { type: String, required: true },                           // first-aid guidance
  category:  { type: String, trim: true },
  isActive:  { type: Boolean, default: true },
  priority:  { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('ChatbotResponse', chatbotResponseSchema);
