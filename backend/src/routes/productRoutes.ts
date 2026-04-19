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
    sellingPrice: z.coerce.number().nonnegative("Price cannot be negative").optional(),
    stock: z.coerce.number().int().nonnegative("Stock cannot be negative"),
    lowStockThreshold: z.coerce.number().int().nonnegative().optional(),
    variants: z.array(
      z.object({
        name: z.string().min(1, "Variant name is required"),
        price: z.coerce.number().nonnegative(),
        stock: z.coerce.number().int().nonnegative(),
        lowStockThreshold: z.coerce.number().int().nonnegative().optional(),
      })
    ).optional(),
  }),
});

router.use(protect);

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

// Applied validation to both POST and PUT requests
router.post("/", validate(productSchema), productController.addProduct);
router.get("/:id", productController.getProduct);
router.put("/:id", validate(productSchema), productController.updateProduct);
router.delete("/:id", productController.deleteProduct);
router.post("/:id/restock", productController.restockProduct);
router.put("/:id/stock", productController.setStock);

export default router;