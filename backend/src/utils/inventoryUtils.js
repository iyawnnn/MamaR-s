// Import the model FROM THE CONTROLLER
const { Model: Product } = require('../controllers/productController');

exports.increaseStock = async (productId, amount) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');
  
  // Simple logic for now
  product.stock += amount; 
  await product.save();
  return product;
};

exports.decreaseStock = async (productId, amount, variantName = null) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');

  if (product.hasVariants) {
    if (!variantName) throw new Error('Size required');
    const v = product.variants.find(v => v.name === variantName);
    if (!v) throw new Error('Size not found');
    if (v.stock < amount) throw new Error('Low stock');
    v.stock -= amount;
  } else {
    if (product.stock < amount) throw new Error('Low stock');
    product.stock -= amount;
  }
  
  await product.save();
  return product;
};