const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Public (any logged-in user) read — used by the locator screen
router.use(authMiddleware);
router.get('/', hospitalController.getHospitals);

// Admin-only management
router.use(adminMiddleware);
router.get('/admin', hospitalController.getAllHospitals);
router.post('/admin', hospitalController.createHospital);
router.put('/admin/:id', hospitalController.updateHospital);
router.delete('/admin/:id', hospitalController.deleteHospital);

module.exports = router;
