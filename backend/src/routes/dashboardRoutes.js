const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Debug check to prevent crash if controller is broken
if (!dashboardController.getDashboardStats || !dashboardController.getSalesChart) {
  console.error("❌ CRITICAL ERROR: Dashboard Controller functions are missing!");
}

// Route for cards (Revenue, Orders, Low Stock)
router.get('/stats', dashboardController.getDashboardStats);

// Route for the line chart
router.get('/chart', dashboardController.getSalesChart);

module.exports = router;