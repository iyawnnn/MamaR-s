import React, { useState } from 'react';
import axios from '../api/axios';

export default function ProductForm({ product, onClose }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || 'Bread',
    costPrice: product?.costPrice || 0,
    sellingPrice: product?.sellingPrice || 0,
    stock: product?.stock || 0,
    lowStockThreshold: product?.lowStockThreshold ?? 5
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (product) {
        await axios.put(`/products/${product._id}`, form);
      } else {
        await axios.post('/products', form);
      }
      onClose();
    } catch (err) {
      alert(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={modalStyle}>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: 16, borderRadius: 6, minWidth: 320 }}>
        <h3>{product ? 'Edit' : 'Add'} Product</h3>
        <label>Name</label>
        <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <label>Category</label>
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
          <option>Bread</option><option>Pastry</option><option>Cake</option><option>Drink</option><option>Other</option>
        </select>
        <label>Cost Price</label>
        <input type="number" step="0.01" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: Number(e.target.value) })} />
        <label>Selling Price</label>
        <input type="number" step="0.01" value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: Number(e.target.value) })} />
        <label>Stock</label>
        <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} />
        <label>Low stock threshold</label>
        <input type="number" value={form.lowStockThreshold} onChange={e => setForm({ ...form, lowStockThreshold: Number(e.target.value) })} />

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>{' '}
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

const modalStyle = {
  position: 'fixed', left: 0, top: 0, right: 0, bottom: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(0,0,0,0.3)', zIndex: 1000
};
