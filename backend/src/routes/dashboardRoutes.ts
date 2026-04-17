import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';

const router = express.Router();

if (!dashboardController.getDashboardStats || !dashboardController.getSalesChart) {
  console.error("❌ CRITICAL ERROR: Dashboard Controller functions are missing!");
}

router.get('/stats', dashboardController.getDashboardStats);
router.get('/chart', dashboardController.getSalesChart);

export default router;