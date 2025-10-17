const Sale = require('../models/Sale');
const { decreaseStock } = require('../utils/inventoryUtils');

exports.recordSale = async (req, res) => {
  try {
    const { productId, quantity, discount, customerName, totalPrice } = req.body;

    // Validate inputs
    if (!customerName) throw new Error('Customer name is required');
    if (!productId) throw new Error('Product ID is missing');
    if (!quantity || quantity <= 0) throw new Error('Quantity must be greater than zero');

    // Update stock
    await decreaseStock(productId, quantity);

    // Create sale entry
    const sale = new Sale({
      productId,
      quantity,
      discount: discount || 0,
      customerName,
      totalPrice
    });

    await sale.save();

    res.status(201).json({ message: 'Sale recorded successfully', sale });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
