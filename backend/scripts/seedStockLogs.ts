import mongoose from 'mongoose';
import dotenv from 'dotenv';
import StockLog from '../src/models/StockLog';
import InventoryItem from '../src/models/InventoryItem';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mamars_db';

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const generateRandomDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - getRandomInt(0, daysAgo));
  date.setHours(getRandomInt(8, 20), getRandomInt(0, 59), 0, 0);
  return date;
};

async function seedStockLogs() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Database connected. Initializing Stock Audit Log sequence...');

    // Fetch existing products to attach logs to real items
    const products = await InventoryItem.find();
    if (products.length === 0) {
      console.error('CRITICAL: No products found in the database. Please ensure products exist first.');
      process.exit(1);
    }

    console.log(`Found ${products.length} products. Generating realistic chronological audit logs...`);

    const logsToInsert = [];

    // Generate chronological logs for each product
    for (const product of products) {
      // Create between 15 and 35 transactions per product over the 60 days
      const numLogs = getRandomInt(15, 35);
      let currentStock = getRandomInt(10, 50); // Starting stock 60 days ago

      // Generate random dates and sort them chronologically so the math flows correctly
      const dates = Array.from({ length: numLogs }, () => generateRandomDate(60))
                         .sort((a, b) => a.getTime() - b.getTime());

      for (const date of dates) {
        // Weighted randomness: Mostly sales, some restocks, rare adjustments
        const typeRand = Math.random();
        let changeType: 'Sale' | 'Restock' | 'Adjustment' = 'Sale';
        
        if (typeRand > 0.85) {
          changeType = 'Restock';
        } else if (typeRand > 0.95) {
          changeType = 'Adjustment';
        }

        let changeAmount = 0;

        if (changeType === 'Restock') {
          // Bulk restocks
          changeAmount = getRandomInt(20, 100);
        } else if (changeType === 'Sale') {
          // Small incremental sales
          changeAmount = -getRandomInt(1, Math.max(2, Math.floor(currentStock / 3)));
        } else {
          // Spoilage or miscounts
          changeAmount = getRandomInt(-5, 5);
          if (changeAmount === 0) changeAmount = -2; // Avoid zero-change logs
        }

        const previousStock = currentStock;
        let newStock = previousStock + changeAmount;
        
        // Prevent negative stock realistically
        if (newStock < 0) {
          newStock = 0;
          changeAmount = -previousStock;
        }

        currentStock = newStock;

        logsToInsert.push({
          productId: product._id,
          productName: product.name,
          changeType,
          previousStock,
          changeAmount,
          newStock,
          date
        });
      }
    }

    // Insert all the generated logs into the database without touching other collections
    await StockLog.insertMany(logsToInsert);
    
    console.log(`Successfully injected ${logsToInsert.length} audit logs into the ledger.`);
    process.exit(0);
  } catch (error) {
    console.error('StockLog seeding sequence failed:', error);
    process.exit(1);
  }
}

seedStockLogs();