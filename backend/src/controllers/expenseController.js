import Expense from '../models/Expense.js';

export const createExpense = async (req, res) => {
  try {
    const { description, amount, category, date } = req.body;
    
    const expense = new Expense({
      description,
      amount,
      category,
      date,
      recordedBy: req.user.id
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};