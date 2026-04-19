import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';

import productRoutes from './routes/productRoutes.js';
import stockLogRoutes from './routes/stockLogRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

const app = express();

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
};
app.use(cors(corsOptions));

app.use(helmet({ 
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false 
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  // Allow 5000 requests in development, but lock it down to 100 in production
  max: process.env.NODE_ENV === 'production' ? 100 : 5000, 
  message: 'Too many requests, try again later.'
});
app.use('/api', limiter);

app.use(express.json());

// Global Request Logger
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/api/health', (req: express.Request, res: express.Response) => res.json({ status: 'ok' }));
app.get('/api/ping', (req: express.Request, res: express.Response) => res.json({ message: 'Backend awake' }));

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stock-logs', stockLogRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5001;

// Strictly bind the server listener to the database connection promise
connectDB()
  .then(() => {
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`🚀 Backend securely running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Critical Failure: Database connection aborted.", error);
    process.exit(1);
  });