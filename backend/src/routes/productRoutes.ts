import express from "express";
import { z } from "zod";
import * as productController from "../controllers/productController.js";
import StockLog from "../models/StockLog.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

const productSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Product name is required"),
    hasVariants: z.boolean().optional(),
    sellingPrice: z.number().nonnegative("Price cannot be negative").optional(),
    stock: z.number().int().nonnegative("Stock cannot be negative"),
    lowStockThreshold: z.number().int().nonnegative().optional(),
    variants: z.array(
      z.object({
        name: z.string().min(1, "Variant name is required"),
        price: z.number().nonnegative(),
        stock: z.number().int().nonnegative(),
        lowStockThreshold: z.number().int().nonnegative().optional(),
      })
    ).optional(),
  }),
});

router.use(protect);

if (!productController.getLowStock) {
  console.error("CRITICAL ERROR: productController.getLowStock is missing!");
}

router.get("/low-stock", productController.getLowStock);
router.get("/", productController.getProducts);

router.get("/logs/all", async (req, res, next) => {
  try {
    const logs = await StockLog.find().sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

router.post("/", validate(productSchema), productController.addProduct);
router.get("/:id", productController.getProduct);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);
router.post("/:id/restock", productController.restockProduct);
router.put("/:id/stock", productController.setStock);

export default router;