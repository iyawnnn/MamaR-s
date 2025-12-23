const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/dashboard-stats', reportController.getDashboardStats);
router.get('/sales-chart', reportController.getSalesOverTime);

module.exports = router;