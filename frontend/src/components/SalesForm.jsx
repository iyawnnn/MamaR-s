import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

export default function SalesForm() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [price, setPrice] = useState(0);
  const [manualPrice, setManualPrice] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    axios.get('/products')
      .then((r) => setProducts(r.data))
      .catch((e) => console.error('Failed to load products', e));
  }, []);

  // Auto-calculate total price whenever product or quantity changes
  useEffect(() => {
    const product = products.find((p) => p._id === selected);
    if (product && !manualPrice) {
      setPrice(product.sellingPrice * quantity);
    }
  }, [selected, quantity, products, manualPrice]);

  // Handle sale submission
  const handleSale = async (e) => {
    e.preventDefault();
    if (!selected) return alert('Please select a product');
    if (!customerName.trim()) return alert('Enter customer name');
    if (quantity <= 0) return alert('Quantity must be greater than 0');

    setProcessing(true);
    try {
      const res = await axios.post('/sales', {
        productId: selected,
        quantity: Number(quantity),
        customerName,
        totalPrice: Number(price),
      });
      alert('✅ Sale recorded successfully!');

      // Refresh product list after sale
      const prodRes = await axios.get('/products');
      setProducts(prodRes.data);

      // Reset form
      setCustomerName('');
      setSelected('');
      setQuantity(1);
      setPrice(0);
      setManualPrice(false);
    } catch (err) {
      alert(err?.response?.data?.message || 'Sale failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSale} style={{ maxWidth: 480 }}>
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
        value={selected}
        onChange={(e) => {
          setSelected(e.target.value);
          setManualPrice(false);
        }}
      >
        <option value="">-- select product --</option>
        {products.map((p) => (
          <option value={p._id} key={p._id}>
            {p.name} — ₱
            {p.sellingPrice
              ? Number(p.sellingPrice).toFixed(2)
              : '0.00'}{' '}
            (stock: {p.stock ?? 0})
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
      />

      <label>Total Price (₱)</label>
      <input
        type="number"
        value={price}
        onChange={(e) => {
          setPrice(Number(e.target.value));
          setManualPrice(true);
        }}
      />
      <small style={{ color: '#666' }}>
        Auto-calculated (editable)
      </small>

      <div style={{ marginTop: 12 }}>
        <button type="submit" disabled={processing}>
          {processing ? 'Processing…' : 'Record Sale'}
        </button>
      </div>
    </form>
  );
}
