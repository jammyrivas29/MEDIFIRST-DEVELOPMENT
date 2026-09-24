const Hospital = require('../models/Hospital');
const { recordActivity } = require('./activityLogController');

// ── Public (user) reads ──
exports.getHospitals = async (req, res) => {
  try {
    const { city, type, emergency } = req.query;
    const filter = { isActive: true };
    if (city)  filter.city = new RegExp(city, 'i');
    if (type)  filter.type = type;
    if (emergency === 'true') filter.emergencyRoom = true;
    const list = await Hospital.find(filter).sort({ name: 1 });
    res.json({ success: true, count: list.length, hospitals: list });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
};

// ── Admin CRUD ──
exports.getAllHospitals = async (req, res) => {
  try {
    const list = await Hospital.find().sort({ createdAt: -1 });
    res.json({ success: true, count: list.length, hospitals: list });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error', error: e.message }); }
};

exports.createHospital = async (req, res) => {
  try {
    const h = await Hospital.create(req.body);
    await recordActivity({ action: 'hospital_created', category: 'hospital', description: `Added ${h.name}`, user: req.userId, req });
    res.status(201).json({ success: true, message: 'Hospital added.', hospital: h });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error', error: e.message }); }
};

exports.updateHospital = async (req, res) => {
  try {
    const h = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!h) return res.status(404).json({ success: false, message: 'Hospital not found.' });
    await recordActivity({ action: 'hospital_updated', category: 'hospital', description: `Updated ${h.name}`, user: req.userId, req });
    res.json({ success: true, message: 'Hospital updated.', hospital: h });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error', error: e.message }); }
};

exports.deleteHospital = async (req, res) => {
  try {
    const h = await Hospital.findByIdAndDelete(req.params.id);
    if (!h) return res.status(404).json({ success: false, message: 'Hospital not found.' });
    await recordActivity({ action: 'hospital_deleted', category: 'hospital', description: `Removed ${h.name}`, user: req.userId, req });
    res.json({ success: true, message: 'Hospital deleted.' });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error', error: e.message }); }
};
