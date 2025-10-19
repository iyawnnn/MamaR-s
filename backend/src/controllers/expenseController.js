// backend/controllers/expenseController.js
const Expense = require('../models/Expense');

exports.createExpense = async (req, res) => {
  try {
    const { name, amount, category, date, notes } = req.body;
    if (amount == null || amount < 0) return res.status(400).json({ message: 'Amount must be >= 0' });

    const expense = await Expense.create({ name, amount, category, date, notes });
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const { start, end, category } = req.query;
    const filter = {};
    if (start || end) filter.date = {};
    if (start) filter.date.$gte = new Date(start);
    if (end) {
      // include end day fully
      const e = new Date(end);
      e.setHours(23,59,59,999);
      filter.date.$lte = e;
    }
    if (category) filter.category = category;

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
