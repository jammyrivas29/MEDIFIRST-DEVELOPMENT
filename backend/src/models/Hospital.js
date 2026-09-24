const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  type:        { type: String, enum: ['hospital','clinic','emergency','pharmacy','trauma_center'], default: 'hospital' },
  address:     { type: String, trim: true },
  city:        { type: String, trim: true },
  phone:       { type: String, trim: true },
  // coordinates for the locator map
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
  emergencyRoom: { type: Boolean, default: false },
  isActive:      { type: Boolean, default: true },
}, { timestamps: true });

hospitalSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Hospital', hospitalSchema);
