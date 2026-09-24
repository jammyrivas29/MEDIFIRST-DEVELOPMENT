const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Public keyword match (used by app chatbot fallback)
router.get('/match', authMiddleware, chatbotController.matchResponse);

// Admin CRUD
router.use(adminMiddleware);
router.get('/admin', chatbotController.getAllResponses);
router.post('/admin', chatbotController.createResponse);
router.put('/admin/:id', chatbotController.updateResponse);
router.delete('/admin/:id', chatbotController.deleteResponse);

module.exports = router;
