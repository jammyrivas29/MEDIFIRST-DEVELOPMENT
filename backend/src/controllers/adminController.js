const User = require('../models/User');
const FirstAidGuide = require('../models/FirstAidGuide');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [users, admins, guides] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.countDocuments({ role: 'admin' }),
      FirstAidGuide.countDocuments(),
    ]);
    res.json({
      success: true,
      data: { totalUsers: users, totalAdmins: admins, totalGuides: guides },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
};

// PATCH /api/admin/users/:id/deactivate  (toggle isActive)
exports.setUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot deactivate an admin account.' });
    const active = req.body.isActive === undefined ? !user.isActive : !!req.body.isActive;
    user.isActive = active;
    await user.save();
    res.json({ success: true, message: `User ${active ? 'activated' : 'deactivated'}.`, user: { _id: user._id, isActive: user.isActive } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
};
