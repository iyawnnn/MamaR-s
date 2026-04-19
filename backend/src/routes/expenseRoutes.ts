import express from 'express';
import { z } from "zod";
import { createExpense, getExpenses } from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const expenseSchema = z.object({
  body: z.object({
    description: z.string().min(1, "Description is required"),
    amount: z.coerce.number().positive("Amount must be greater than zero"),
    category: z.string().optional(),
    date: z.string().optional(),
  }),
});

router.use(protect);

router.post('/', validate(expenseSchema), createExpense);
router.get('/', getExpenses);

export default router;