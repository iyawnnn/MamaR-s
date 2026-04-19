import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../src/models/Order';
import InventoryItem from '../src/models/InventoryItem';
import Expense from '../src/models/Expense';
import StockLog from '../src/models/StockLog';
import User from '../src/models/User';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mamars_db';

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const generateRandomDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - getRandomInt(0, daysAgo));
  date.setHours(getRandomInt(8, 20), getRandomInt(0, 59), 0, 0);
  return date;
};

const PASTRIES = [
  {
    name: 'Ube Cheese Pandesal',
    hasVariants: true,
    variants: [
      { name: 'Box of 6', price: 120, stock: 50, lowStockThreshold: 10 },
      { name: 'Box of 12', price: 230, stock: 40, lowStockThreshold: 10 }
    ],
    sellingPrice: 120,
    stock: 0,
    lowStockThreshold: 0
  },
  {
    name: 'Classic Ensaymada',
    hasVariants: true,
    variants: [
      { name: 'Solo', price: 45, stock: 60, lowStockThreshold: 15 },
      { name: 'Box of 6', price: 260, stock: 20, lowStockThreshold: 5 }
    ],
    sellingPrice: 45,
    stock: 0,
    lowStockThreshold: 0
  },
  {
    name: 'Egg Pie',
    hasVariants: true,
    variants: [
      { name: 'Slice', price: 40, stock: 30, lowStockThreshold: 5 },
      { name: 'Whole', price: 300, stock: 15, lowStockThreshold: 3 }
    ],
    sellingPrice: 40,
    stock: 0,
    lowStockThreshold: 0
  },
  {
    name: 'Fudge Brownies',
    hasVariants: true,
    variants: [
      { name: 'Box of 4', price: 100, stock: 40, lowStockThreshold: 10 },
      { name: 'Box of 8', price: 190, stock: 25, lowStockThreshold: 5 }
    ],
    sellingPrice: 100,
    stock: 0,
    lowStockThreshold: 0
  },
  {
    name: 'Chocolate Crinkles',
    hasVariants: false,
    variants: [],
    sellingPrice: 150,
    stock: 80,
    lowStockThreshold: 15
  },
  {
    name: 'Yema Cake',
    hasVariants: true,
    variants: [
      { name: 'Mini Tin', price: 180, stock: 20, lowStockThreshold: 5 },
      { name: '8x8 Tub', price: 350, stock: 10, lowStockThreshold: 2 }
    ],
    sellingPrice: 180,
    stock: 0,
    lowStockThreshold: 0
  }
];

const EXPENSE_DESCRIPTIONS = [
  { desc: 'Meralco Bill', category: 'Utilities', min: 2500, max: 4500 },
  { desc: 'Maynilad Water', category: 'Utilities', min: 500, max: 1200 },
  { desc: '1 Sack All-Purpose Flour', category: 'Ingredients', min: 950, max: 1100 },
  { desc: 'White Sugar 50kg', category: 'Ingredients', min: 3200, max: 3500 },
  { desc: 'Butter 225g Bulk', category: 'Ingredients', min: 1500, max: 2000 },
  { desc: 'Eggs 5 Trays', category: 'Ingredients', min: 900, max: 1100 },
  { desc: 'Pastry Boxes (100pcs)', category: 'Packaging', min: 800, max: 1200 },
  { desc: 'Paper Bags (500pcs)', category: 'Packaging', min: 400, max: 600 },
  { desc: 'Oven Maintenance', category: 'Equipment', min: 1500, max: 3000 },
  { desc: 'LPG Tank Refill', category: 'Utilities', min: 900, max: 1100 },
  { desc: 'Delivery Rider Fee', category: 'Other', min: 150, max: 500 }
];

const CUSTOMER_NAMES = [
  'Juan Dela Cruz', 'Maria Santos', 'Jose Reyes', 'Ana Bautista', 'Pedro Garcia',
  'Elena Mendoza', 'Miguel Torres', 'Rosa Villanueva', 'Carlos Aquino', 'Carmen Cruz'
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Database connected. Initializing selective wipe sequence.');

    const adminUser = await User.findOne();
    if (!adminUser) {
      console.error('CRITICAL: No user found in the database. Run "npm run seed:admin" first.');
      process.exit(1);
    }

    await Promise.all([
      Order.deleteMany({}),
      InventoryItem.deleteMany({}),
      Expense.deleteMany({}),
      StockLog.deleteMany({})
    ]);

    console.log('Target collections wiped. User accounts preserved.');
    console.log('Seeding localized inventory data.');
    
    const createdProducts = await InventoryItem.insertMany(PASTRIES);

    console.log('Seeding financial expenditure logs (60 days).');
    const expensesToInsert = [];
    for (let i = 0; i < 120; i++) {
      const template = getRandomElement(EXPENSE_DESCRIPTIONS);
      expensesToInsert.push({
        description: template.desc,
        amount: getRandomInt(template.min, template.max),
        category: template.category,
        date: generateRandomDate(60),
        recordedBy: adminUser._id 
      });
    }
    await Expense.insertMany(expensesToInsert);

    console.log('Seeding point-of-sale transactions (60 days).');
    const ordersToInsert = [];
    for (let i = 0; i < 300; i++) {
      const orderItems = [];
      const numItems = getRandomInt(1, 4);
      let totalAmount = 0;

      for (let j = 0; j < numItems; j++) {
        const product = getRandomElement(createdProducts);
        const quantity = getRandomInt(1, 3);
        let price = product.sellingPrice;
        let variantName = undefined;

        if (product.hasVariants && product.variants.length > 0) {
          const variant = getRandomElement(product.variants);
          price = variant.price;
          variantName = variant.name;
        }

        totalAmount += price * quantity;
        orderItems.push({
          product: product._id,
          variant: variantName,
          quantity,
          priceAtTimeOfOrder: price
        });
      }

      const statusChoices = ['FULFILLED', 'FULFILLED', 'FULFILLED', 'READY', 'PREPARING', 'PENDING', 'CANCELLED'];
      const status = getRandomElement(statusChoices);
      const targetDate = generateRandomDate(60);

      ordersToInsert.push({
        customerName: getRandomElement(CUSTOMER_NAMES),
        customerContact: `09${getRandomInt(100000000, 999999999)}`,
        items: orderItems,
        status,
        paymentStatus: status === 'CANCELLED' ? 'UNPAID' : (status === 'FULFILLED' ? 'PAID' : getRandomElement(['UNPAID', 'PARTIAL', 'PAID'])),
        totalAmount,
        amountPaid: status === 'FULFILLED' ? totalAmount : 0,
        targetDate,
        createdAt: targetDate,
        updatedAt: targetDate
      });
    }
    await Order.insertMany(ordersToInsert);

    console.log('Database seeding operation completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Database seeding sequence failed:', error);
    process.exit(1);
  }
}

seedDatabase();