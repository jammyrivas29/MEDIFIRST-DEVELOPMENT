const FirstAidGuide = require('../models/FirstAidGuide');
const { recordActivity } = require('./activityLogController');

exports.deleteGuide = async (req, res) => {
  try {
    const g = await FirstAidGuide.findByIdAndDelete(req.params.id);
    if (!g) return res.status(404).json({ success: false, message: 'Guide not found.' });
    await recordActivity({ action: 'content_deleted', category: 'content', description: `Deleted "${g.title}"`, user: req.userId, req });
    res.json({ success: true, message: 'Guide deleted.' });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error', error: e.message }); }
};

exports.getAllGuides = async (req, res) => {
  try {
    const { category, search, offline } = req.query;
    let query = {};
    if (category) query.category = category;
    if (offline === 'true') query.isOfflineAvailable = true;
    if (search) query.$text = { $search: search };

    const guides = await FirstAidGuide.find(query)
      .select('title category description severity imageUrl isOfflineAvailable tags viewCount')
      .sort({ viewCount: -1, createdAt: -1 });

    res.json({ success: true, count: guides.length, guides });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getGuideById = async (req, res) => {
  try {
    const guide = await FirstAidGuide.findById(req.params.id);
    if (!guide) return res.status(404).json({ success: false, message: 'Guide not found' });
    guide.viewCount += 1;
    await guide.save({ validateBeforeSave: false });
    res.json({ success: true, guide });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getByCategory = async (req, res) => {
  try {
    const guides = await FirstAidGuide.find({ category: req.params.category });
    res.json({ success: true, count: guides.length, guides });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
