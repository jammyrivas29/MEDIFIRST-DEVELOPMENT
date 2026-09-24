const mongoose = require('mongoose');

// Emergency hotlines managed by the admin (used by the One-Tap Emergency Call feature).
const HotlineSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },       // e.g. "National Emergency Hotline"
  number:      { type: String, required: true, trim: true },       // e.g. "911", "+63 917 123 4567"
  description: { type: String, trim: true },                        // e.g. "Police / Ambulance / Fire"
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Hotline', HotlineSchema);
