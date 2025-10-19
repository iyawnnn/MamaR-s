require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// ✅ Routes
const productRoutes = require("./routes/productRoutes");
const salesRoutes = require("./routes/salesRoutes");
const stockLogRoutes = require("./routes/stockLogRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const reportRoutes = require("./routes/reportRoutes");




const app = express();

// ✅ Connect to MongoDB
connectDB();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// ✅ Mount routes
app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/stock-logs", stockLogRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/reports", reportRoutes);

// ✅ 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
