import mongoose, { Schema } from "mongoose";
import { IStockLog } from '../types/index.js';

const stockLogSchema = new Schema<IStockLog>({
  productId: { type: Schema.Types.ObjectId, ref: "InventoryItem", required: true },
  productName: String,
  changeType: {
    type: String,
    enum: ["Restock", "Sale", "Adjustment", "Fulfillment", "Cancelled Order"],
    default: "Adjustment",
  },
  previousStock: Number,
  changeAmount: Number,
  newStock: Number,
  date: { type: Date, default: Date.now },
});

export default mongoose.model<IStockLog>("StockLog", stockLogSchema);