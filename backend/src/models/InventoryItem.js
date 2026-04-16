import mongoose from 'mongoose';

function toTitleCase(str = '') {
  return str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name required'],
    unique: true,
    trim: true
  },
  sellingPrice: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  hasVariants: { type: Boolean, default: false },
  variants: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 }
  }],
  archived: { type: Boolean, default: false },
  dateAdded: { type: Date, default: Date.now }
}, { timestamps: true });

itemSchema.pre('save', function (next) {
  if (this.isModified('name') && this.name) {
    this.name = toTitleCase(this.name);
  }
  next();
});

itemSchema.set('toJSON', { virtuals: true });
itemSchema.set('toObject', { virtuals: true });

export default mongoose.model('InventoryItem', itemSchema, 'products');