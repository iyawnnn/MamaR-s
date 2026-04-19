import express from 'express';
import * as reportController from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard-stats', reportController.getDashboardStats);
router.get('/sales-chart', reportController.getSalesOverTime);

export default router;