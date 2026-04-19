import mongoose, { Schema } from 'mongoose';
import { IExpense } from '../types/index.js';

const expenseSchema = new Schema<IExpense>({
  description: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, enum: ['Ingredients', 'Packaging', 'Utilities', 'Equipment', 'Other'] },
  date: { type: Date, default: Date.now },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model<IExpense>('Expense', expenseSchema);