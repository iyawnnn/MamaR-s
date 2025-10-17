import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';
import connectDB from '../src/config/db.js';

dotenv.config();

const seedProducts = async () => {
  try {
    await connectDB();

    await Product.deleteMany(); // clear old data

    const products = [
      {
        name: "Chocolate Cake",
        category: "Cake",
        costPrice: 200,
        sellingPrice: 300,
        stock: 15,
        dateAdded: new Date(),
      },
      {
        name: "Croissant",
        category: "Pastry",
        costPrice: 30,
        sellingPrice: 60,
        stock: 25,
        dateAdded: new Date(),
      },
    ];

    await Product.insertMany(products);

    console.log("✅ Seeded products successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding products:", err);
    process.exit(1);
  }
};

seedProducts();
