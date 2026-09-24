const ChatbotResponse = require('../models/ChatbotResponse');
const { recordActivity } = require('./activityLogController');

// ── Public fallback used by the AI chatbot when no API key / offline ──
exports.matchResponse = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json({ success: true, response: null });
    const q = query.toLowerCase();
    const all = await ChatbotResponse.find({ isActive: true });
    let best = null, bestScore = 0;
    for (const r of all) {
      const score = r.keywords.reduce((s, k) => s + (q.includes(k.toLowerCase()) ? 1 : 0), 0);
      if (score > bestScore) { bestScore = score; best = r; }
    }
    res.json({ success: true, response: best ? { intent: best.intent, answer: best.answer, category: best.category } : null });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error', error: e.message }); }
};

// ── Admin CRUD ──
exports.getAllResponses = async (req, res) => {
  try {
    const list = await ChatbotResponse.find().sort({ priority: -1, intent: 1 });
    res.json({ success: true, count: list.length, responses: list });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error', error: e.message }); }
};

exports.createResponse = async (req, res) => {
  try {
    const r = await ChatbotResponse.create(req.body);
    await recordActivity({ action: 'chatbot_created', category: 'chatbot', description: `Added intent ${r.intent}`, user: req.userId, req });
    res.status(201).json({ success: true, message: 'Response added.', response: r });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ success: false, message: 'Intent already exists.' });
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
};

exports.updateResponse = async (req, res) => {
  try {
    const r = await ChatbotResponse.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!r) return res.status(404).json({ success: false, message: 'Response not found.' });
    await recordActivity({ action: 'chatbot_updated', category: 'chatbot', description: `Updated intent ${r.intent}`, user: req.userId, req });
    res.json({ success: true, message: 'Response updated.', response: r });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error', error: e.message }); }
};

exports.deleteResponse = async (req, res) => {
  try {
    const r = await ChatbotResponse.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ success: false, message: 'Response not found.' });
    await recordActivity({ action: 'chatbot_deleted', category: 'chatbot', description: `Removed intent ${r.intent}`, user: req.userId, req });
    res.json({ success: true, message: 'Response deleted.' });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error', error: e.message }); }
};
