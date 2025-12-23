const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// Debug check to ensure controller functions exist before mapping
if (!productController.getLowStock) {
  console.error("❌ CRITICAL ERROR: productController.getLowStock is missing!");
}

// -- DEFINED ROUTES --

// 1. GET /api/products/low-stock (Must come BEFORE /:id)
router.get("/low-stock", productController.getLowStock);

// 2. GET /api/products (List all)
router.get("/", productController.getProducts);

router.get("/logs/all", async (req, res) => {
  try {
    const StockLog = require("../models/StockLog");
    // Fetch logs and sort by newest first
    const logs = await StockLog.find().sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. POST /api/products (Add new)
router.post("/", productController.addProduct);

// 4. GET /api/products/:id (Get one)
router.get("/:id", productController.getProduct);

// 5. PUT /api/products/:id (Update)
router.put("/:id", productController.updateProduct);

// 6. DELETE /api/products/:id (Delete)
router.delete("/:id", productController.deleteProduct);

// 7. POST /api/products/:id/restock (Add stock)
router.post("/:id/restock", productController.restockProduct);

// 8. PUT /api/products/:id/stock (Set stock manually)
router.put("/:id/stock", productController.setStock);

module.exports = router;
