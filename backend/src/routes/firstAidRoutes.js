const express = require('express');
const router = express.Router();
const firstAidController = require('../controllers/firstAidController');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.get('/', firstAidController.getAllGuides);
router.get('/category/:category', firstAidController.getByCategory);
router.get('/:id', firstAidController.getGuideById);

// Admin-only delete (used by the admin content screen)
router.delete('/:id', adminMiddleware, firstAidController.deleteGuide);

module.exports = router;
