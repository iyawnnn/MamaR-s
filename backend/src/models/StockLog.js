const mongoose = require('mongoose');

const stockLogSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  change: { type: Number, required: true },
  reason: {
    type: String,
    enum: ['Sale', 'Restock', 'Manual Adjustment'],
    required: true
  },
  reference: { type: String },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('StockLog', stockLogSchema);
