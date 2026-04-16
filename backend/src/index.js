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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, try again later.'
});

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173'],
  credentials: true
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/ping', (req, res) => res.json({ message: 'Backend awake' }));

app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/stock-logs', stockLogRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));