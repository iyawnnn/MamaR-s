require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("../src/config/db"); // ✅ make sure this file exists
const productRoutes = require("../src/routes/productRoutes"); // ✅ your Phase 2 routes
const salesRoutes = require('./routes/salesRoutes');
const stockLogRoutes = require('./routes/stockLogRoutes');

const app = express();

// ✅ Connect to MongoDB
connectDB();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Basic health route
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// ✅ Mount routes
app.use("/api/products", productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/stock-logs', stockLogRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
