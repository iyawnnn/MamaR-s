import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';

import productRoutes from './routes/productRoutes.js';
import salesRoutes from './routes/salesRoutes.js';
import stockLogRoutes from './routes/stockLogRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';

const app = express();

connectDB();

// 1. Standard CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
};
app.use(cors(corsOptions));

// 2. Security Middleware
app.use(helmet({ 
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false 
}));

// 3. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, try again later.'
});
app.use('/api', limiter);

// 4. Body Parsing
app.use(express.json());

// 5. Health Checks
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/ping', (req, res) => res.json({ message: 'Backend awake' }));

// 6. API Routes
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/stock-logs', stockLogRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

// 7. Fallback Error Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Replace the bottom of your index.js with this:
const PORT = process.env.PORT || 5001;

// 0.0.0.0 ensures the backend doesn't accidentally block local requests
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend securely running on port ${PORT}`);
});