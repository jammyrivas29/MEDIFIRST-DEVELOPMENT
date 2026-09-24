const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const notificationController = require('../controllers/notificationController');
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.changePassword);
router.put('/medical-profile', userController.updateMedicalProfile);
router.get('/emergency-contacts', userController.getEmergencyContacts);
router.post('/emergency-contacts', userController.addEmergencyContact);
router.delete('/emergency-contacts/:contactId', userController.deleteEmergencyContact);

// Notifications (user side)
router.get('/notifications', notificationController.getMyNotifications);
router.delete('/notifications/:id', notificationController.deleteMyNotification);

// Reports / Feedback (user side)
router.post('/reports', reportController.createReport);
router.get('/reports', reportController.getMyReports);

module.exports = router;
