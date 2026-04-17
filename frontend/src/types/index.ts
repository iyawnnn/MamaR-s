export interface IExpense {
  _id: string;
  description: string;
  amount: number;
  category: 'Ingredients' | 'Packaging' | 'Utilities' | 'Equipment' | 'Other';
  date: string;
  recordedBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IVariant {
  _id?: string;
  name: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
}

export interface IInventoryItem {
  _id: string;
  name: string;
  sellingPrice: number;
  stock: number;
  lowStockThreshold: number;
  hasVariants: boolean;
  variants: IVariant[];
  archived: boolean;
  dateAdded: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISale {
  _id: string;
  productId: string;
  productName: string;
  customerName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount: number;
  date: string;
}

export interface IStockLog {
  _id: string;
  productId: string;
  productName: string;
  changeType: 'Restock' | 'Sale' | 'Adjustment';
  previousStock: number;
  changeAmount: number;
  newStock: number;
  date: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}