import express from "express";
import * as productController from "../controllers/productController.js";
import StockLog from "../models/StockLog.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

if (!productController.getLowStock) {
  console.error("CRITICAL ERROR: productController.getLowStock is missing!");
}

router.get("/low-stock", productController.getLowStock);
router.get("/", productController.getProducts);

router.get("/logs/all", async (req, res) => {
  try {
    const logs = await StockLog.find().sort({ date: -1 });
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", productController.addProduct);
router.get("/:id", productController.getProduct);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);
router.post("/:id/restock", productController.restockProduct);
router.put("/:id/stock", productController.setStock);

export default router;