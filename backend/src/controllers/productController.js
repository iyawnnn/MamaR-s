const Product = require("../models/InventoryItem");
const StockLog = require("../models/StockLog");

// Helper for errors
const handleError = (res, err) => {
  console.error("Controller Error:", err);
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message, errors: err.errors });
  }
  if (err.code === 11000) {
    return res.status(400).json({ message: "Product name must be unique" });
  }
  return res.status(500).json({ message: "Server error" });
};

// 1. Get All Products
exports.getProducts = async (req, res) => {
  try {
    const { search, sort = "-dateAdded" } = req.query;
    const q = { archived: false };
    if (search) q.name = { $regex: search, $options: "i" };

    const products = await Product.find(q).sort(sort);

    const enriched = products.map((p) => {
      let totalStock = p.stock;
      let isLowStock = false;

      if (p.hasVariants && p.variants.length > 0) {
        totalStock = p.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
        isLowStock = p.variants.some(
          (v) => v.stock <= (v.lowStockThreshold || 5)
        );
      } else {
        isLowStock = p.stock < p.lowStockThreshold;
      }

      return { ...p.toObject(), stock: totalStock, lowStock: isLowStock };
    });

    res.json({ products: enriched });
  } catch (err) {
    handleError(res, err);
  }
};

// 2. Get Single Product
exports.getProduct = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Not found" });
    res.json(p);
  } catch (err) {
    handleError(res, err);
  }
};

// 3. Add Product
exports.addProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const saved = await product.save();

    // Log the initial stock creation
    await new StockLog({
      productId: saved._id,
      productName: saved.name,
      changeType: "Adjustment",
      previousStock: 0,
      changeAmount: saved.stock,
      newStock: saved.stock,
    }).save();

    res.status(201).json(saved);
  } catch (err) {
    handleError(res, err);
  }
};

// 4. Update Product (With Logging)
exports.updateProduct = async (req, res) => {
  try {
    const oldProduct = await Product.findById(req.params.id);
    if (!oldProduct) return res.status(404).json({ message: "Not found" });

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    // Logic to detect stock change and log it
    if (
      req.body.stock !== undefined &&
      Number(req.body.stock) !== oldProduct.stock
    ) {
      await new StockLog({
        productId: updated._id,
        productName: updated.name,
        changeType: "Restock", // Mark as restock/adjustment
        previousStock: oldProduct.stock,
        changeAmount: Number(req.body.stock) - oldProduct.stock,
        newStock: updated.stock,
        date: new Date(),
      }).save();
    }
    // Handle Variant Stock Changes
    else if (req.body.variants) {
      // Find which variant changed
      req.body.variants.forEach(async (v, i) => {
        const oldV = oldProduct.variants[i];
        if (oldV && Number(v.stock) !== oldV.stock) {
          await new StockLog({
            productId: updated._id,
            productName: `${updated.name} (${v.name})`,
            changeType: "Restock",
            previousStock: oldV.stock,
            changeAmount: Number(v.stock) - oldV.stock,
            newStock: Number(v.stock),
            date: new Date(),
          }).save();
        }
      });
    }

    res.json(updated);
  } catch (err) {
    handleError(res, err);
  }
};

// 5. Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const p = await Product.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    handleError(res, err);
  }
};

// 6. Set Stock Manually
exports.setStock = async (req, res) => {
  try {
    const { stock } = req.body;
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Not found" });

    const oldStock = p.stock;
    p.stock = Number(stock);
    const saved = await p.save();

    const changeAmount = Number(req.body.stock) - oldProduct.stock;

    // ✅ RECORD THE ADJUSTMENT LOG
    await new StockLog({
      productId: updated._id,
      productName: updated.name,
      changeType: changeAmount >= 0 ? "Restock" : "Adjustment", // Logic to label it
      previousStock: oldProduct.stock,
      changeAmount: changeAmount, // This will be -4 if you decreased it
      newStock: updated.stock,
      date: new Date(),
    }).save();

    res.json(saved);
  } catch (err) {
    handleError(res, err);
  }
};

// 7. Restock
exports.restockProduct = async (req, res) => {
  try {
    const { quantity } = req.body;
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Not found" });

    const oldStock = p.stock;
    p.stock += Number(quantity);
    const saved = await p.save();

    // Record Log
    await new StockLog({
      productId: saved._id,
      productName: saved.name,
      changeType: "Restock",
      previousStock: oldStock,
      changeAmount: Number(quantity),
      newStock: saved.stock,
      date: new Date(),
    }).save();

    res.json({ message: "Restocked", product: saved });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 8. Get Low Stock
exports.getLowStock = async (req, res) => {
  try {
    const products = await Product.find({
      archived: false,
      $expr: { $lt: ["$stock", "$lowStockThreshold"] },
    });
    res.json(products);
  } catch (err) {
    handleError(res, err);
  }
};

exports.Model = Product;
