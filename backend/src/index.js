require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// ✅ Routes
const productRoutes = require("./routes/productRoutes");
const salesRoutes = require("./routes/salesRoutes");
const stockLogRoutes = require("./routes/stockLogRoutes");
const reportRoutes = require("./routes/reportRoutes");
const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes'); // add this line

const app = express();


// ✅ Connect to MongoDB
connectDB();

// ✅ Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// ✅ Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// ✅ Mount routes
app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/stock-logs", stockLogRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes); // ⬅️ add this new one
app.use("/api/auth", authRoutes); // add this line

// ✅ Keep-alive route for Render free tier
app.get("/api/ping", (req, res) => {
  res.json({ message: "Backend awake 🟢" });
});

// ✅ 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests — try again later.'
});

app.use(cors({ origin: ['http://localhost:5173'], credentials: true })); // adjust your frontend URL
app.use(limiter);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
