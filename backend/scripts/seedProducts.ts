import mongoose from 'mongoose';
import 'dotenv/config';
import InventoryItem from '../src/models/InventoryItem.js';
import { IInventoryItem } from '../src/types/index.js';

const seedProducts = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding");

    await InventoryItem.deleteMany(); // clear old data

    const products: Partial<IInventoryItem>[] = [
      {
        name: "Chocolate Cake",
        sellingPrice: 300,
        stock: 15,
        lowStockThreshold: 5,
        hasVariants: false,
        variants: [],
        archived: false,
        dateAdded: new Date(),
      },
      {
        name: "Croissant",
        sellingPrice: 60,
        stock: 25,
        lowStockThreshold: 10,
        hasVariants: true,
        variants: [
          {
            name: "Butter",
            price: 60,
            stock: 15,
            lowStockThreshold: 5
          },
          {
            name: "Cheese",
            price: 75,
            stock: 10,
            lowStockThreshold: 5
          }
        ],
        archived: false,
        dateAdded: new Date(),
      },
    ];

    await InventoryItem.insertMany(products);

    console.log("✅ Seeded products successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding products:", err);
    process.exit(1);
  }
};

seedProducts();
