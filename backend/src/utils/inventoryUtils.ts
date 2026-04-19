import Product from '../models/InventoryItem.js';

export const increaseStock = async (productId: string, amount: number) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');
  
  product.stock += amount; 
  await product.save();
  return product;
};

export const decreaseStock = async (productId: string, amount: number, variantName: string | null = null) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');

  if (product.hasVariants) {
    if (!variantName) throw new Error('Size required');
    const v = product.variants.find((v: any) => v.name === variantName);
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