import React, { useState, useEffect } from "react";
import axios from "../api/axios";

export default function SalesForm({ onSaleRecorded }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [manualPrice, setManualPrice] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    axios
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Failed to load products", err));
  }, []);

  // Auto-calculate price when selected product or quantity changes
  useEffect(() => {
    const product = products.find((p) => p._id === selectedProduct);
    if (product && !manualPrice) {
      const newTotal = product.sellingPrice * quantity;
      setTotalPrice(isNaN(newTotal) ? 0 : newTotal);
    }
  }, [selectedProduct, quantity, products, manualPrice]);

  // Handle sale submission
  const handleSale = async () => {
    if (!selectedProduct) return alert("Please select a product");
    if (!customerName.trim()) return alert("Enter customer name");
    if (quantity <= 0) return alert("Quantity must be greater than 0");

    setProcessing(true);

    try {
      await axios.post("/sales", {
        productId: selectedProduct,
        quantity: Number(quantity),
        customerName,
        totalPrice: Number(totalPrice),
      });

      alert("✅ Sale recorded successfully!");

      // Notify parent (SalesPage) to refresh sales list
      if (onSaleRecorded) onSaleRecorded();

      // Refresh product list (update stocks)
      const res = await axios.get("/products");
      setProducts(res.data);

      // Reset fields
      setCustomerName("");
      setSelectedProduct("");
      setQuantity(1);
      setTotalPrice(0);
      setManualPrice(false);
    } catch (err) {
      alert(err?.response?.data?.message || "❌ Failed to record sale.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="sales-form-container">
      <div className="sales-input-container">
        <label>Customer Name</label>
        <input
          type="text"
          placeholder="Enter customer name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="sales-input"
        />
      </div>

      <div className="sales-input-container">
        <label>Product</label>
        <select
          value={selectedProduct}
          onChange={(e) => {
            setSelectedProduct(e.target.value);
            setManualPrice(false);
          }}
          className="sales-input"
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option value={p._id} key={p._id}>
              {p.name} - ₱{Number(p.sellingPrice).toFixed(2)} (Stock: {p.stock})
            </option>
          ))}
        </select>
      </div>

      {/* Grouped Quantity and Total Price in a single row */}
      <div className="sales-input-row">
        <div className="sales-input-container">
          <label>Quantity</label>
          <input
            type="number"
            min="1"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => {
              setQuantity(Number(e.target.value));
              setManualPrice(false);
            }}
            className="sales-input"
          />
        </div>

        <div className="sales-input-container">
          <label>Total Price (₱)</label>
          <input
            type="number"
            value={totalPrice}
            onChange={(e) => {
              setTotalPrice(Number(e.target.value));
              setManualPrice(true);
            }}
            placeholder="Total Price (₱)"
            className="sales-input"
          />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={handleSale} disabled={processing} className="sales-button">
          {processing ? "Processing..." : "Record Sale"}
        </button>
      </div>
    </div>
  );
}
