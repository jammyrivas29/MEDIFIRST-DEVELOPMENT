const Hotline = require('../models/Hotline');
const SystemSetting = require('../models/SystemSetting');

// ── Emergency Hotlines (admin) ──
// GET /api/admin/hotlines
exports.getHotlines = async (req, res) => {
  try {
    const hotlines = await Hotline.find().sort({ createdAt: 1 });
    res.json({ success: true, hotlines });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
};

// POST /api/admin/hotlines
exports.createHotline = async (req, res) => {
  try {
    const { name, number, description } = req.body;
    if (!name || !number) return res.status(400).json({ success: false, message: 'Name and number are required.' });
    const h = await Hotline.create({ name: name.trim(), number: number.trim(), description: (description || '').trim() });
    res.status(201).json({ success: true, hotline: h });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
};

// PUT /api/admin/hotlines/:id
exports.updateHotline = async (req, res) => {
  try {
    const { name, number, description, isActive } = req.body;
    const h = await Hotline.findById(req.params.id);
    if (!h) return res.status(404).json({ success: false, message: 'Hotline not found.' });
    if (name !== undefined) h.name = name.trim();
    if (number !== undefined) h.number = number.trim();
    if (description !== undefined) h.description = description.trim();
    if (isActive !== undefined) h.isActive = !!isActive;
    await h.save();
    res.json({ success: true, hotline: h });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
};

// DELETE /api/admin/hotlines/:id
exports.deleteHotline = async (req, res) => {
  try {
    const h = await Hotline.findByIdAndDelete(req.params.id);
    if (!h) return res.status(404).json({ success: false, message: 'Hotline not found.' });
    res.json({ success: true, message: 'Hotline deleted.' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
};

// ── System Settings (admin) ──
// GET /api/admin/settings
exports.getSystemSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.find().sort({ settingKey: 1 });
    res.json({ success: true, settings });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
};

// PUT /api/admin/settings/:key
exports.updateSystemSetting = async (req, res) => {
  try {
    const { value, description, isEnabled } = req.body;
    const s = await SystemSetting.findOne({ settingKey: req.params.key });
    if (!s) return res.status(404).json({ success: false, message: 'Setting not found.' });
    if (value !== undefined) s.value = value;
    if (description !== undefined) s.description = description;
    if (isEnabled !== undefined) s.isEnabled = !!isEnabled;
    await s.save();
    res.json({ success: true, setting: s });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
};

// ── Public hotline read (used by One-Tap Emergency Call) ──
// GET /api/hotlines
exports.getPublicHotlines = async (req, res) => {
  try {
    const hotlines = await Hotline.find({ isActive: true }).sort({ createdAt: 1 });
    res.json({ success: true, hotlines });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
};
