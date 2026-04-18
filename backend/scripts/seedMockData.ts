import mongoose from 'mongoose';
import 'dotenv/config';
import { faker } from '@faker-js/faker';
import InventoryItem from '../src/models/InventoryItem.js';
import Order from '../src/models/Order.js';
import Expense from '../src/models/Expense.js';
import User from '../src/models/User.js';
import { OrderStatus, PaymentStatus } from '../src/types/index.js';

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is missing.');
  process.exit(1);
}

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Clear existing collections
    await Promise.all([
      InventoryItem.deleteMany({}),
      Order.deleteMany({}),
      Expense.deleteMany({})
    ]);
    console.log('Cleared existing data.');

    // Fetch an admin user to associate with expenses
    const adminUser = await User.findOne();
    if (!adminUser) {
      console.error('No users found. Please run the seed:admin script first.');
      process.exit(1);
    }

    // Generate Inventory Items
    const productsToCreate = 20;
    const inventoryPayload = Array.from({ length: productsToCreate }).map(() => {
      const hasVariants = faker.datatype.boolean();
      const basePrice = faker.number.int({ min: 50, max: 1000 });
      
      return {
        name: faker.commerce.productName() + ' ' + faker.string.alphanumeric(4),
        sellingPrice: hasVariants ? 0 : basePrice,
        stock: hasVariants ? 0 : faker.number.int({ min: 0, max: 100 }),
        lowStockThreshold: 10,
        hasVariants,
        variants: hasVariants ? [
          { name: 'Small', price: basePrice * 0.8, stock: faker.number.int({ min: 10, max: 50 }) },
          { name: 'Large', price: basePrice * 1.5, stock: faker.number.int({ min: 10, max: 50 }) }
        ] : [],
        archived: faker.datatype.boolean({ probability: 0.1 })
      };
    });

    const insertedItems = await InventoryItem.insertMany(inventoryPayload);
    console.log(`Seeded ${insertedItems.length} inventory items.`);

    // Generate Orders
    const ordersToCreate = 50;
    const orderStatuses = Object.values(OrderStatus);
    const paymentStatuses = Object.values(PaymentStatus);

    const orderPayload = Array.from({ length: ordersToCreate }).map(() => {
      const itemCount = faker.number.int({ min: 1, max: 5 });
      const items = [];
      let totalAmount = 0;

      // Select random items to attach to the order
      for (let i = 0; i < itemCount; i++) {
        const randomProduct = faker.helpers.arrayElement(insertedItems);
        const quantity = faker.number.int({ min: 1, max: 10 });
        
        let price = randomProduct.sellingPrice;
        let variantName = undefined;

        if (randomProduct.hasVariants && randomProduct.variants.length > 0) {
          const randomVariant = faker.helpers.arrayElement(randomProduct.variants);
          price = randomVariant.price;
          variantName = randomVariant.name;
        }

        items.push({
          product: randomProduct._id,
          variant: variantName,
          quantity,
          priceAtTimeOfOrder: price
        });

        totalAmount += price * quantity;
      }

      const status = faker.helpers.arrayElement(orderStatuses);
      const paymentStatus = faker.helpers.arrayElement(paymentStatuses);
      
      return {
        customerName: faker.person.fullName(),
        customerContact: faker.phone.number(),
        items,
        status,
        paymentStatus,
        totalAmount,
        amountPaid: paymentStatus === PaymentStatus.UNPAID ? 0 : 
                   paymentStatus === PaymentStatus.PAID ? totalAmount : 
                   faker.number.float({ min: 10, max: totalAmount - 1 }),
        targetDate: faker.date.soon({ days: 14 }),
        notes: faker.lorem.sentence(),
        createdAt: faker.date.recent({ days: 30 })
      };
    });

    const insertedOrders = await Order.insertMany(orderPayload);
    console.log(`Seeded ${insertedOrders.length} orders.`);

    // Generate Expenses
    const expensesToCreate = 30;
    const categories = ['Ingredients', 'Packaging', 'Utilities', 'Equipment', 'Other'];

    const expensePayload = Array.from({ length: expensesToCreate }).map(() => ({
      description: faker.commerce.productMaterial() + ' Resupply',
      amount: faker.number.int({ min: 100, max: 5000 }),
      category: faker.helpers.arrayElement(categories),
      date: faker.date.recent({ days: 60 }),
      recordedBy: adminUser._id
    }));

    const insertedExpenses = await Expense.insertMany(expensePayload);
    console.log(`Seeded ${insertedExpenses.length} expenses.`);

    console.log('Mock data seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();