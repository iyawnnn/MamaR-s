import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

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
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 1000 : 5000,
  message: 'Too many requests, try again later.'
});
app.use('/api', limiter);

app.use(express.json());

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      ip: req.ip,
    };
    
    console.log(JSON.stringify(logData));
  });
  
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

app.use(errorHandler);

const PORT = process.env.PORT || 5001;

connectDB()
  .then(() => {
    const server = app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`Backend securely running on port ${PORT}`);
    });

    const gracefulShutdown = async () => {
      server.close(async () => {
        try {
          await mongoose.connection.close(false);
          process.exit(0);
        } catch (error) {
          process.exit(1);
        }
      });
      
      setTimeout(() => process.exit(1), 10000).unref();
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  })
  .catch((error) => {
    console.error("Critical Failure: Database connection aborted.", error);
    process.exit(1);
  });