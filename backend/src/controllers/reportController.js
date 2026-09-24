const Report = require('../models/Report');
const { recordActivity } = require('./activityLogController');

// POST /api/reports  → any logged-in user submits feedback/incident
exports.createReport = async (req, res) => {
  try {
    const { type, subject, message, rating } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }
    const report = await Report.create({
      type: type || 'feedback', subject, message, rating: rating || null, user: req.userId,
    });
    await recordActivity({ action: 'report_submitted', category: 'report', description: `Report (${type || 'feedback'})`, user: req.userId, req });
    res.status(201).json({ success: true, message: 'Report submitted. Thank you!', report });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
};

// GET /api/reports  → user sees their own reports
exports.getMyReports = async (req, res) => {
  try {
    const list = await Report.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, count: list.length, reports: list });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
};

// GET /api/admin/reports  → admin sees all reports
exports.getAllReports = async (req, res) => {
  try {
    const list = await Report.find().sort({ createdAt: -1 }).populate('user', 'firstName lastName email');
    res.json({ success: true, count: list.length, reports: list });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
};
