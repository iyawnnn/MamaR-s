const express = require("express");
const router = express.Router();
const {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  restockProduct
} = require("../controllers/productController"); // adjust path if needed

// ✅ Routes
router.get("/", getProducts);
router.post("/", addProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post("/:id/restock", restockProduct);

module.exports = router;
