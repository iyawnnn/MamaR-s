import express from 'express';
import { createExpense, getExpenses } from '../controllers/expenseController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.post('/', createExpense);
router.get('/', getExpenses);

export default router;