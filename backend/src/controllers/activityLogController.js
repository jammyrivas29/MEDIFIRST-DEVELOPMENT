const ActivityLog = require('../models/ActivityLog');

// GET /api/admin/activity  → list recent emergency/activity logs
exports.getActivityLogs = async (req, res) => {
  try {
    const { category, limit = 50 } = req.query;
    const filter = category ? { category } : {};
    const list = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('user', 'firstName lastName');
    res.json({ success: true, count: list.length, logs: list });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
};

// helper used by other controllers to record an action
exports.recordActivity = async ({ action, category, description, meta = {}, user, req }) => {
  try {
    await ActivityLog.create({
      action, category, description, meta,
      user: user || (req && req.userId) || null,
      ip: req && req.ip,
    });
  } catch (e) { /* non-fatal */ }
};
