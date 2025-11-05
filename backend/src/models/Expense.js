// backend/models/Expense.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, default: 'Other' },
  notes: { type: String },
  date: { type: Date, default: Date.now }, // ✅ fixes the problem
});

// index for faster date-range aggregations
expenseSchema.index({ date: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
