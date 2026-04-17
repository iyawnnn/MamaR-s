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

export interface ISale {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  productName: string;
  customerName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount: number;
  date: Date;
}

export interface IStockLog {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  productName: string;
  changeType: 'Restock' | 'Sale' | 'Adjustment';
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
