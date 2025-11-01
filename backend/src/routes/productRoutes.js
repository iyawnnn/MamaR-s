// backend/src/routes/productRoutes.js
const express = require("express");
const router = express.Router();
const {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  restockProduct,
  setStock, // Add the new setStock route
} = require("../controllers/productController");

// Routes
router.get("/", getProducts);
router.post("/", addProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post("/:id/restock", restockProduct);
router.post("/:id/update-stock", setStock);  // New route to set stock

module.exports = router;
