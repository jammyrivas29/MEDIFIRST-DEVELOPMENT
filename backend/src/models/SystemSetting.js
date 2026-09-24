const mongoose = require('mongoose');

// Global system settings, managed by the admin (mirrors manuscript Table 16: System Settings).
const SystemSettingSchema = new mongoose.Schema({
  settingKey:   { type: String, required: true, unique: true, trim: true }, // e.g. "maintenance_mode"
  value:        { type: mongoose.Schema.Types.Mixed, default: null },        // flexible value
  description:  { type: String, trim: true },
  isEnabled:    { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('SystemSetting', SystemSettingSchema);
