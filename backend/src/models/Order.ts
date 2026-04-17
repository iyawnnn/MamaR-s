import mongoose, { Schema } from 'mongoose';
import { IOrder, OrderStatus, PaymentStatus } from '../types';

const OrderItemSchema = new Schema({
  product: { 
    type: Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  priceAtTimeOfOrder: { 
    type: Number, 
    required: true, 
    min: 0 
  }
});

const OrderSchema = new Schema<IOrder>(
  {
    customerName: { 
      type: String, 
      required: true, 
      trim: true 
    },
    customerContact: { 
      type: String, 
      trim: true 
    },
    items: [OrderItemSchema],
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.UNPAID,
      required: true
    },
    totalAmount: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    amountPaid: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    targetDate: { 
      type: Date, 
      required: true 
    },
    notes: { 
      type: String, 
      trim: true 
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IOrder>('Order', OrderSchema);