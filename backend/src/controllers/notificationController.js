const Notification = require('../models/Notification');
const { recordActivity } = require('./activityLogController');

// GET /api/user/notifications  → current user's notifications (+ active broadcasts)
exports.getMyNotifications = async (req, res) => {
  try {
    const list = await Notification.find({
      isActive: true,
      deletedBy: { $ne: req.userId },
      $or: [{ recipient: req.userId }, { recipient: null }],
    }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: list.length, notifications: list });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
};

// DELETE /api/user/notifications/:id  → user removes a broadcast from their own view
exports.deleteMyNotification = async (req, res) => {
  try {
    const n = await Notification.findById(req.params.id);
    if (!n) return res.status(404).json({ success: false, message: 'Notification not found.' });
    // Soft delete: only hide it for this user (admin broadcast history is preserved)
    if (!n.deletedBy.includes(req.userId)) {
      n.deletedBy.push(req.userId);
      await n.save();
    }
    res.json({ success: true, message: 'Broadcast removed from your alerts.' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
};

// GET /api/notifications/public  → active admin broadcasts (no login required, guests included)
exports.getPublicNotifications = async (req, res) => {
  try {
    const list = await Notification.find({ isActive: true, recipient: null })
      .sort({ createdAt: -1 })
      .limit(50)
      .maxTimeMS(8000);
    res.json({ success: true, count: list.length, notifications: list });
  } catch (e) {
    // Never break the guest UI — an empty list beats a 500 on a slow/offline DB
    console.error('getPublicNotifications error:', e.message);
    res.json({ success: true, count: 0, notifications: [] });
  }
};

// POST /api/admin/notifications  → admin creates (broadcast if no recipient)
exports.createNotification = async (req, res) => {
  try {
    const { title, message, type, recipient } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }
    const notif = await Notification.create({
      title, message, type: type || 'info', recipient: recipient || null, createdBy: req.userId,
    });
    await recordActivity({ action: 'notification_sent', category: 'emergency', description: `Alert "${title}"`, user: req.userId, req });
    res.status(201).json({ success: true, message: 'Notification created.', notification: notif });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
};

// GET /api/admin/notifications  → list all broadcasts (admin management view)
exports.getAdminNotifications = async (req, res) => {
  try {
    const list = await Notification.find({ recipient: null })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, count: list.length, notifications: list });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
};

// DELETE /api/admin/notifications/:id  → admin removes
exports.deleteNotification = async (req, res) => {
  try {
    const n = await Notification.findByIdAndDelete(req.params.id);
    if (!n) return res.status(404).json({ success: false, message: 'Notification not found.' });
    res.json({ success: true, message: 'Notification deleted.' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
};
