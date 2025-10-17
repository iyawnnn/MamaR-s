// backend/src/models/Product.js
const mongoose = require('mongoose');

function toTitleCase(str = '') {
  return str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name required'],
    unique: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Bread', 'Pastry', 'Cake', 'Drink', 'Other'],
    required: true,
    default: 'Other'
  },
  costPrice: {
    type: Number,
    required: [true, 'Cost price required'],
    min: [0, 'Cost price cannot be negative']
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Selling price required'],
    min: [0, 'Selling price cannot be negative']
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    min: [0, 'Threshold cannot be negative'],
    default: 5
  },
  archived: { type: Boolean, default: false },
  dateAdded: { type: Date, default: Date.now }
}, { timestamps: true });

// Pre-save: normalize name to Title Case
productSchema.pre('save', function (next) {
  if (this.isModified('name') && this.name) {
    this.name = toTitleCase(this.name);
  }
  next();
});

// Virtuals don't persist; we will compute when returning
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
