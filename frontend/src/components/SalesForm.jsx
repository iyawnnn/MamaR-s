import React, { useEffect, useState } from "react";
import axios from "../api/axios";

export default function SalesForm({ onSaleRecorded }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [manualPrice, setManualPrice] = useState(false);
  const [processing, setProcessing] = useState(false);

  // ✅ Fetch products on mount
  useEffect(() => {
    axios
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Failed to load products", err));
  }, []);

  // ✅ Auto-calculate price when selected product or quantity changes
  useEffect(() => {
    const product = products.find((p) => p._id === selectedProduct);
    if (product && !manualPrice) {
      const newTotal = product.sellingPrice * quantity;
      setTotalPrice(isNaN(newTotal) ? 0 : newTotal);
    }
  }, [selectedProduct, quantity, products, manualPrice]);

  // ✅ Handle form submit
  const handleSale = async (e) => {
    e.preventDefault();

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

      // 🔄 Notify parent (SalesPage) to refresh sales list
      if (onSaleRecorded) onSaleRecorded();

      // Refresh product list (update stocks)
      const res = await axios.get("/products");
      setProducts(res.data);

      // Reset form
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
    <form onSubmit={handleSale} style={{ maxWidth: 480, margin: "0 auto" }}>
      <h3>Record a Sale</h3>

      <label>Customer Name</label>
      <input
        type="text"
        placeholder="Enter customer name"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        required
      />

      <label>Product</label>
      <select
        value={selectedProduct}
        onChange={(e) => {
          setSelectedProduct(e.target.value);
          setManualPrice(false);
        }}
        required
      >
        <option value="">-- select product --</option>
        {products.map((p) => (
          <option value={p._id} key={p._id}>
            {p.name} — ₱
            {p?.sellingPrice ? Number(p.sellingPrice).toFixed(2) : "0.00"}{" "}
            (stock: {p?.stock ?? 0})
          </option>
        ))}
      </select>

      <label>Quantity</label>
      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => {
          setQuantity(Number(e.target.value));
          setManualPrice(false);
        }}
        required
      />

      <label>Total Price (₱)</label>
      <input
        type="number"
        value={totalPrice}
        onChange={(e) => {
          setTotalPrice(Number(e.target.value));
          setManualPrice(true);
        }}
        step="0.01"
        required
      />
      <small style={{ color: "#666" }}>
        Auto-calculated based on product price (editable)
      </small>

      <div style={{ marginTop: 12 }}>
        <button type="submit" disabled={processing}>
          {processing ? "Processing…" : "Record Sale"}
        </button>
      </div>
    </form>
  );
}
