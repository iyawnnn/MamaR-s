const Product = require('../models/Product');
const StockLog = require('../models/StockLog');

async function decreaseStock(productId, quantity, actionRef) {
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');
  if (product.stock < quantity) throw new Error('Insufficient stock');

  product.stock -= quantity;
  await product.save();

  await StockLog.create({
    productId,
    change: -quantity,
    reason: 'Sale',
    reference: actionRef
  });

  return product;
}

async function increaseStock(productId, quantity, reason, actionRef) {
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');

  product.stock += quantity;
  await product.save();

  await StockLog.create({
    productId,
    change: quantity,
    reason,
    reference: actionRef
  });

  return product;
}

module.exports = { decreaseStock, increaseStock };
