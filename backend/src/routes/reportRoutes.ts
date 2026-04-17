import express from 'express';
import * as reportController from '../controllers/reportController.js';

const router = express.Router();

router.get('/dashboard-stats', reportController.getDashboardStats);
router.get('/sales-chart', reportController.getSalesOverTime);

export default router;