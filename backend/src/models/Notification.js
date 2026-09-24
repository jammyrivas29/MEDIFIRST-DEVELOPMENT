const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  message:  { type: String, required: true, trim: true },
  type:     { type: String, enum: ['alert', 'info', 'update', 'emergency'], default: 'info' },
  // null recipient = broadcast to all users; otherwise targets one user
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  // Users who have dismissed/deleted this broadcast from their own view
  deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
