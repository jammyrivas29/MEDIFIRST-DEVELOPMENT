const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action:    { type: String, required: true },                 // e.g. 'notification_sent'
  category:  { type: String, enum: ['emergency','content','user','report','system','chatbot','hospital'], default: 'system' },
  description: { type: String },
  meta:      { type: mongoose.Schema.Types.Mixed, default: {} },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // acting admin
  ip:        { type: String },
  severity:  { type: String, enum: ['info','warning','critical'], default: 'info' },
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
