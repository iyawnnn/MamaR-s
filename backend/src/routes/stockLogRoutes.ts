import express from 'express';
import StockLog from '../models/StockLog.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const logs = await StockLog.find()
      .populate('productId', 'name category')
      .sort({ date: -1 });
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;