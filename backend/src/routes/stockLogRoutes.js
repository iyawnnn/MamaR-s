const express = require('express');
const router = express.Router();
const StockLog = require('../models/StockLog');

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

module.exports = router;
