import Sale from "../models/Sale.js";
import Product from "../models/InventoryItem.js";
import StockLog from "../models/StockLog.js";

export const recordSale = async (req, res) => {
  try {
    const {
      productId,
      quantity,
      discount = 0,
      customerName,
      variantName,
      customPrice,
      date,
    } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let finalUnitPrice = 0;
    let productNameToRecord = product.name;

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

      if (product.variants[variantIndex].stock < quantity) {
        return res
          .status(400)
          .json({ message: `Not enough stock for ${variantName}.` });
      }

      product.variants[variantIndex].stock -= quantity;
      finalUnitPrice = product.variants[variantIndex].price;
      productNameToRecord = `${product.name} (${variantName})`;
    } else {
      if (product.stock < quantity) {
        return res.status(400).json({ message: "Not enough stock." });
      }
      product.stock -= quantity;
      finalUnitPrice = product.sellingPrice;
    }

    if (
      customPrice !== undefined &&
      customPrice !== null &&
      customPrice !== ""
    ) {
      finalUnitPrice = Number(customPrice);
    }

    await product.save();

    const totalPrice = finalUnitPrice * quantity - discount;

    const sale = new Sale({
      productId,
      productName: productNameToRecord,
      customerName: customerName || "Walk-in",
      quantity,
      unitPrice: finalUnitPrice,
      totalPrice,
      discount,
      date: date ? new Date(date) : new Date(),
    });

    await sale.save();

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

export const getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("productId", "name")
      .sort({ date: -1 });
    res.status(200).json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};