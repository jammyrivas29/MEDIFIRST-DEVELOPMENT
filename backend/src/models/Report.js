const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // 'feedback' = user-submitted feedback; 'incident' = usage/report entry
  type:     { type: String, enum: ['feedback', 'incident', 'bug'], default: 'feedback' },
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  subject:  { type: String, trim: true },
  message:  { type: String, required: true, trim: true },
  rating:   { type: Number, min: 1, max: 5, default: null },
  status:   { type: String, enum: ['new', 'reviewed', 'resolved'], default: 'new' },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
