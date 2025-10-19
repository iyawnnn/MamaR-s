// backend/models/Expense.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    enum: ['Ingredients','Rent','Utilities','Packaging','Salaries','Other'],
    default: 'Other'
  },
  date: { type: Date, default: Date.now },
  notes: { type: String }
}, { timestamps: true });

// index for faster date-range aggregations
expenseSchema.index({ date: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
