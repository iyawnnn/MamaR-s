import { Request, Response } from "express";
import Product from "../models/InventoryItem.js";
import StockLog from "../models/StockLog.js";

const handleError = (res: Response, err: any) => {
  console.error("Controller Error:", err);
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message, errors: err.errors });
  }
  if (err.code === 11000) {
    return res.status(400).json({ message: "Product name must be unique" });
  }
  return res.status(500).json({ message: "Server error" });
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { search, sort = "-dateAdded" } = req.query;
    const q: any = { archived: false };
    if (search) q.name = { $regex: search, $options: "i" };

    const products = await Product.find(q).sort(sort as string);

    const enriched = products.map((p) => {
      let totalStock = p.stock;
      let isLowStock = false;

      if (p.hasVariants && p.variants.length > 0) {
        totalStock = p.variants.reduce(
          (acc: any, v: any) => acc + (v.stock || 0),
          0,
        );
        isLowStock = p.variants.some(
          (v: any) => v.stock <= (v.lowStockThreshold || 5),
        );
      } else {
        isLowStock = p.stock < p.lowStockThreshold;
      }

      return { ...p.toObject(), stock: totalStock, lowStock: isLowStock };
    });

    res.json({ products: enriched });
  } catch (err: any) {
    handleError(res, err);
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Not found" });
    res.json(p);
  } catch (err: any) {
    handleError(res, err);
  }
};

export const addProduct = async (req: Request, res: Response) => {
  try {
    const product = new Product(req.body);
    const saved = await product.save();

    await new StockLog({
      productId: saved._id,
      productName: saved.name,
      changeType: "Adjustment",
      previousStock: 0,
      changeAmount: saved.stock,
      newStock: saved.stock,
    }).save();

    res.status(201).json(saved);
  } catch (err: any) {
    handleError(res, err);
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const oldProduct = await Product.findById(req.params.id);
    if (!oldProduct) return res.status(404).json({ message: "Not found" });

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated)
      return res
        .status(404)
        .json({ message: "Update failed, product not found" });

    if (
      req.body.stock !== undefined &&
      Number(req.body.stock) !== oldProduct.stock
    ) {
      await new StockLog({
        productId: updated._id,
        productName: updated.name,
        changeType: "Restock",
        previousStock: oldProduct.stock,
        changeAmount: Number(req.body.stock) - oldProduct.stock,
        newStock: updated.stock,
        date: new Date(),
      }).save();
    } else if (req.body.variants) {
      req.body.variants.forEach(async (v: any, i: number) => {
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
  } catch (err: any) {
    handleError(res, err);
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const p = await Product.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err: any) {
    handleError(res, err);
  }
};

export const setStock = async (req: Request, res: Response) => {
  try {
    const { stock } = req.body;
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Not found" });

    const oldStock = p.stock;
    p.stock = Number(stock);
    const saved = await p.save();

    const changeAmount = Number(stock) - oldStock;

    await new StockLog({
      productId: saved._id,
      productName: saved.name,
      changeType: changeAmount >= 0 ? "Restock" : "Adjustment",
      previousStock: oldStock,
      changeAmount: changeAmount,
      newStock: saved.stock,
      date: new Date(),
    }).save();

    res.json(saved);
  } catch (err: any) {
    handleError(res, err);
  }
};

export const restockProduct = async (req: Request, res: Response) => {
  try {
    const { quantity } = req.body;
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Not found" });

    const oldStock = p.stock;
    p.stock += Number(quantity);
    const saved = await p.save();

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
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getLowStock = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({
      archived: false,
      $expr: { $lt: ["$stock", "$lowStockThreshold"] },
    });
    res.json(products);
  } catch (err: any) {
    handleError(res, err);
  }
};
