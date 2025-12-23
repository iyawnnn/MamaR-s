const mongoose = require("mongoose");

const stockLogSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InventoryItem",
    required: true,
  },
  productName: String,
  changeType: {
    type: String,
    enum: ["Restock", "Sale", "Adjustment"],
    default: "Adjustment",
  },
  previousStock: Number,
  changeAmount: Number,
  newStock: Number,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("StockLog", stockLogSchema);
