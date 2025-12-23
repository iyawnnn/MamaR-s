const Sale = require("../models/Sale");
const { Model: Product } = require("../controllers/productController");
const StockLog = require("../models/StockLog");

// 📌 Record a new sale
exports.recordSale = async (req, res) => {
  try {
    const {
      productId,
      quantity,
      discount = 0,
      customerName,
      variantName,
      customPrice,
      date, // ✅ Receive the custom date
    } = req.body;

    // 1. Find Product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let finalUnitPrice = 0;
    let productNameToRecord = product.name;

    // 2. Determine Price & Name (Handle Variants)
    if (product.hasVariants) {
      if (!variantName) {
        return res.status(400).json({ message: "Please select a size." });
      }

      const variantIndex = product.variants.findIndex(
        (v) => v.name === variantName
      );
      if (variantIndex === -1) {
        return res.status(400).json({ message: "Size not found." });
      }

      // Check Stock
      if (product.variants[variantIndex].stock < quantity) {
        return res
          .status(400)
          .json({ message: `Not enough stock for ${variantName}.` });
      }

      // Deduct Stock
      product.variants[variantIndex].stock -= quantity;

      // Set Base Price & Name
      finalUnitPrice = product.variants[variantIndex].price;
      productNameToRecord = `${product.name} (${variantName})`;
    } else {
      // Simple Product Logic
      if (product.stock < quantity) {
        return res.status(400).json({ message: "Not enough stock." });
      }
      product.stock -= quantity;
      finalUnitPrice = product.sellingPrice;
    }

    // 3. Handle Custom Price Override
    if (
      customPrice !== undefined &&
      customPrice !== null &&
      customPrice !== ""
    ) {
      finalUnitPrice = Number(customPrice);
    }

    // 4. Save Product Stock
    await product.save();

    // 5. Calculate Total
    const totalPrice = finalUnitPrice * quantity - discount;

    // 6. Create Sale Record
    const sale = new Sale({
      productId,
      productName: productNameToRecord,
      customerName: customerName || "Walk-in",
      quantity,
      unitPrice: finalUnitPrice,
      totalPrice,
      discount,
      date: date ? new Date(date) : new Date(), // ✅ Use custom date or default to now
    });

    await sale.save();

    // ✅ ADD THIS LOG ENTRY
    await new StockLog({
      productId: product._id,
      productName: productNameToRecord,
      changeType: "Sale",
      previousStock: product.hasVariants
        ? product.variants.find((v) => v.name === variantName).stock + quantity
        : product.stock + quantity,
      changeAmount: quantity,
      newStock: product.hasVariants
        ? product.variants.find((v) => v.name === variantName).stock
        : product.stock,
      date: sale.date,
    }).save();

    res.status(201).json({ message: "Sale recorded", sale });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("productId", "name")
      .sort({ date: -1 });
    res.status(200).json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
