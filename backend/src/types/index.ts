import { Types } from 'mongoose';

export interface IExpense {
  _id: Types.ObjectId;
  description: string;
  amount: number;
  category: 'Ingredients' | 'Packaging' | 'Utilities' | 'Equipment' | 'Other';
  date: Date;
  recordedBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IVariant {
  _id?: Types.ObjectId;
  name: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
}

export interface IInventoryItem {
  _id: Types.ObjectId;
  name: string;
  sellingPrice: number;
  stock: number;
  lowStockThreshold: number;
  hasVariants: boolean;
  variants: IVariant[];
  archived: boolean;
  dateAdded: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Order System Enums
export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  FULFILLED = 'FULFILLED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID'
}

export interface IOrderItem {
  product: Types.ObjectId; 
  variant?: string;
  quantity: number;
  priceAtTimeOfOrder: number;
}

// Replaces ISale
export interface IOrder {
  _id: Types.ObjectId;
  customerName: string;
  customerContact?: string;
  items: IOrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  amountPaid: number;
  targetDate: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStockLog {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  productName: string;
  // Updated to reflect the pre-order model rather than direct sales
  changeType: 'Restock' | 'Fulfillment' | 'Adjustment' | 'Cancelled Order';
  previousStock: number;
  changeAmount: number;
  newStock: number;
  date: Date;
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}