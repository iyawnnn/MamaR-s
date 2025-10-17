import React, { useEffect, useState, useCallback } from 'react';
import axios from '../api/axios';
import ProductForm from './ProductForm';
import RestockModal from './RestockModal';
import LowStockAlert from './LowStockAlert';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [restockTarget, setRestockTarget] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('fetch products', err);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    // Polling every 5 seconds for near-real-time updates
    const t = setInterval(fetchProducts, 5000);
    return () => clearInterval(t);
  }, [fetchProducts]);

  const handleDelete = async (id) => {
    if (!confirm('Archive this product?')) return;
    try {
      await axios.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert(err?.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Products</h2>
        <div>
          <button onClick={() => { setEditing(null); setShowForm(true); }}>➕ Add Product</button>
        </div>
      </div>

      <LowStockAlert items={products.filter(p => p.lowStock)} />

      {loading ? <p>Loading…</p> :
        <table border="1" cellPadding="8" style={{ width: '100%', marginTop: 12 }}>
          <thead>
            <tr>
              <th>Name</th><th>Category</th><th>Cost</th><th>Price</th><th>Stock</th><th>Stock Value</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id} style={{ background: p.lowStock ? '#fff1f0' : 'transparent' }}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>₱{Number(p.costPrice).toFixed(2)}</td>
                <td>₱{Number(p.sellingPrice).toFixed(2)}</td>
                <td>{p.stock}</td>
                <td>₱{Number(p.stockValue ?? p.stock * p.costPrice).toFixed(2)}</td>
                <td>
                  <button onClick={() => { setEditing(p); setShowForm(true); }}>✏️</button>{' '}
                  <button onClick={() => handleDelete(p._id)}>🗑️</button>{' '}
                  <button onClick={() => setRestockTarget(p)}>🔁</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }

      {showForm && <ProductForm product={editing} onClose={() => { setShowForm(false); fetchProducts(); }} />}
      {restockTarget && <RestockModal product={restockTarget} onClose={() => { setRestockTarget(null); fetchProducts(); }} />}
    </div>
  );
}
