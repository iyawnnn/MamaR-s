import express from 'express';
import Sale from '../models/Sale.js';
import { recordSale } from '../controllers/salesController.js';

const router = express.Router();

router.post('/', recordSale);

router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('productId', 'name sellingPrice')
      .sort({ date: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;