// backend/src/controllers/productController.js
const Product = require('../models/Product');
const { increaseStock } = require('../utils/inventoryUtils');

// Helper: standard error handler
const handleError = (res, err) => {
  console.error(err);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message, errors: err.errors });
  }
  if (err.code === 11000) {
    return res.status(400).json({ message: 'Product name must be unique' });
  }
  return res.status(500).json({ message: 'Server error' });
};

exports.getProducts = async (req, res) => {
  try {
    const { search, category, sort = '-dateAdded' } = req.query;
    const q = { archived: false };
    if (category) q.category = category;
    if (search) q.name = { $regex: search, $options: 'i' };

    const products = await Product.find(q).sort(sort);
    const enriched = products.map(p => {
      const stockValue = +(p.stock * p.costPrice).toFixed(2);
      const lowStock = p.stock < p.lowStockThreshold;
      return { ...p.toObject(), stockValue, lowStock };
    });
    res.json(enriched);
  } catch (err) {
    handleError(res, err);
  }
};

exports.getProduct = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p || p.archived) return res.status(404).json({ message: 'Product not found' });
    const stockValue = +(p.stock * p.costPrice).toFixed(2);
    const lowStock = p.stock < p.lowStockThreshold;
    res.json({ ...p.toObject(), stockValue, lowStock });
  } catch (err) {
    handleError(res, err);
  }
};

exports.addProduct = async (req, res) => {
  try {
    const { name, category, costPrice, sellingPrice, stock, lowStockThreshold } = req.body;
    const product = new Product({ name, category, costPrice, sellingPrice, stock, lowStockThreshold });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    handleError(res, err);
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updates = req.body;
    const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (err) {
    handleError(res, err);
  }
};

exports.setStock = async (req, res) => {
  try {
    const { stock } = req.body;
    const productId = req.params.id;

    // Validate the stock value
    if (stock <= 0) {
      return res.status(400).json({ message: 'Stock must be greater than 0' });
    }

    // Find the product by ID and set the stock to the new value
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.stock = stock;  // Set the stock directly
    await product.save();

    res.json({ message: 'Product stock updated successfully', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating stock' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    // Delete the product completely from the database
    const p = await Product.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    handleError(res, err);
  }
};

exports.restockProduct = async (req, res) => {
  try {
    const { quantity } = req.body;
    const productId = req.params.id;
    const updatedProduct = await increaseStock(productId, quantity, 'Restock');
    res.json({ message: 'Product restocked', product: updatedProduct });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Optional: low stock endpoint
exports.getLowStock = async (req, res) => {
  try {
    const products = await Product.find({ archived: false, $expr: { $lt: ['$stock', '$lowStockThreshold'] } });
    const enriched = products.map(p => ({ ...p.toObject(), stockValue: +(p.stock * p.costPrice).toFixed(2), lowStock: true }));
    res.json(enriched);
  } catch (err) {
    handleError(res, err);
  }
};
