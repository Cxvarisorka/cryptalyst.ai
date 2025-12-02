const express = require('express');
const router = express.Router();
const priceAlertController = require('../controllers/priceAlert.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// Create a new alert
router.post('/', priceAlertController.createAlert);

// Get all user alerts
router.get('/', priceAlertController.getUserAlerts);

// Get alert statistics
router.get('/stats', priceAlertController.getAlertStats);

// Get a single alert
router.get('/:id', priceAlertController.getAlertById);

// Update an alert
router.put('/:id', priceAlertController.updateAlert);

// Delete an alert
router.delete('/:id', priceAlertController.deleteAlert);

// Delete all triggered alerts
router.delete('/triggered/all', priceAlertController.deleteTriggeredAlerts);

module.exports = router;
