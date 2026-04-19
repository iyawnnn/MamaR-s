import { Request, Response } from 'express';
import Expense from '../models/Expense.js';

export const createExpense = async (req: Request, res: Response) => {
  try {
    const { description, amount, category, date } = req.body;

    const expense = new Expense({
      description,
      amount,
      category,
      date,
      recordedBy: req.user?.id || req.user?._id,
    });

    await expense.save();
    return res.status(201).json(expense);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await Expense.find();
    return res.status(200).json(expenses);
  } catch (error: any) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};