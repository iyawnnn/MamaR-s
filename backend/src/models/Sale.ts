import mongoose, { Schema } from 'mongoose';
import { ISale } from '../types/index.js';

const saleSchema = new Schema<ISale>({
  productId: { type: Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
  productName: { type: String, required: true },
  customerName: { type: String, default: 'Walk-in' },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
});

export default mongoose.model<ISale>('Sale', saleSchema);