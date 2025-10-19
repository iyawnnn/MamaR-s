// backend/src/routes/sales.js
const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const { recordSale } = require('../controllers/salesController');

// ✅ Create new sale
router.post('/', recordSale);

// ✅ Fetch all sales (with product info)
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

module.exports = router;
