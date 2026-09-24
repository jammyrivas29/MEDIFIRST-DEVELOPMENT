const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middlewares/adminMiddleware');
const adminController = require('../controllers/adminController');
const settingsController = require('../controllers/settingsController');
const notificationController = require('../controllers/notificationController');
const reportController = require('../controllers/reportController');
const activityLogController = require('../controllers/activityLogController');

router.use(adminMiddleware);
router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/active', adminController.setUserActive);

// Hotlines (admin)
router.get('/hotlines', settingsController.getHotlines);
router.post('/hotlines', settingsController.createHotline);
router.put('/hotlines/:id', settingsController.updateHotline);
router.delete('/hotlines/:id', settingsController.deleteHotline);

// System Settings (admin)
router.get('/settings', settingsController.getSystemSettings);
router.put('/settings/:key', settingsController.updateSystemSetting);

// Activity logs
router.get('/activity', activityLogController.getActivityLogs);

// Notifications (admin side)
router.get('/notifications', notificationController.getAdminNotifications);
router.post('/notifications', notificationController.createNotification);
router.delete('/notifications/:id', notificationController.deleteNotification);

// Reports / Feedback (admin side)
router.get('/reports', reportController.getAllReports);

module.exports = router;
