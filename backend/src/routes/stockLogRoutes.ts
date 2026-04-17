import express from 'express';
import StockLog from '../models/StockLog.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const logs = await StockLog.find()
      .populate('productId', 'name category')
      .sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;