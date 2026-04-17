import express from 'express';
import { createExpense, getExpenses } from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/', createExpense);
router.get('/', getExpenses);

export default router;