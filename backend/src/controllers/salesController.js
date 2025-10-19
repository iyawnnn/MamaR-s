// backend/src/controllers/salesController.js
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { decreaseStock } = require('../utils/inventoryUtils');

// 📌 Record a new sale
exports.recordSale = async (req, res) => {
  try {
    const { productId, quantity, discount = 0, customerName } = req.body;

    // Validate product existence
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update stock
    await decreaseStock(productId, quantity);

    // Compute total price
    const totalPrice = (product.sellingPrice * quantity) - discount;

    // Save sale
    const sale = new Sale({
      productId,
      quantity,
      discount,
      customerName,
      totalPrice,
    });
    await sale.save();

    res.status(201).json({ message: 'Sale recorded successfully', sale });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 📌 Get all sales (with product details)
exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('productId', 'name sellingPrice category') // include details
      .sort({ date: -1 });

    res.status(200).json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
