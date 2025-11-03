import React, { useState } from 'react';
import axios from '../api/axios';
import "bootstrap-icons/font/bootstrap-icons.css";
import { Save, X } from 'react-bootstrap-icons';  // Importing Bootstrap Icons

export default function ProductForm({ product, onClose }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || 'Bread',
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
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={headerStyle}>
          <h3>{product ? 'Edit' : 'Add'} Product</h3>
          <button type="button" onClick={onClose} style={closeBtnStyle}><X size={24} /></button>
        </div>

        <label>Name</label>
        <input 
          required 
          value={form.name} 
          onChange={e => setForm({ ...form, name: e.target.value })} 
          style={inputStyle} 
        />

        <label>Category</label>
        <select 
          value={form.category} 
          onChange={e => setForm({ ...form, category: e.target.value })} 
          style={inputStyle}
        >
          <option>Bread</option>
          <option>Pastry</option>
          <option>Cake</option>
          <option>Other</option>
        </select>

        <div style={inputContainerStyle}>
          <label>Selling Price</label>
          <input 
            type="number" 
            step="0.01" 
            value={form.sellingPrice} 
            onChange={e => setForm({ ...form, sellingPrice: Number(e.target.value) })} 
            style={inputStyle} 
          />
        </div>

        <div style={inputContainerStyle}>
          <label>Low stock threshold</label>
          <input 
            type="number" 
            value={form.lowStockThreshold} 
            onChange={e => setForm({ ...form, lowStockThreshold: Number(e.target.value) })} 
            style={inputStyle} 
          />
        </div>

        <label>Stock</label>
        <input 
          type="number" 
          value={form.stock} 
          onChange={e => setForm({ ...form, stock: Number(e.target.value) })} 
          style={inputStyle} 
        />

        <div style={buttonsContainerStyle}>
          <button type="submit" disabled={saving} style={saveBtnStyle}>
            {saving ? 'Saving…' : <><Save size={16} /> Save</>}
          </button>
          <button type="button" onClick={onClose} style={cancelBtnStyle}>
            <X size={16} /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const modalStyle = {
  position: 'fixed',
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0, 0, 0, 0.3)',
  zIndex: 1000,
};

const formStyle = {
  background: 'var(--accent3)', 
  padding: '20px', 
  borderRadius: '8px', 
  minWidth: '350px',  // Reduced width for a tighter form
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  color: 'var(--text-dark)',
};

const headerStyle = {
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center',
};

const closeBtnStyle = {
  background: 'transparent', 
  border: 'none', 
  cursor: 'pointer', 
  color: 'var(--primary)', 
  padding: 0,
};

const inputStyle = {
  padding: '0.8rem', 
  borderRadius: '8px', 
  border: '1px solid var(--accent2)', 
  marginBottom: '1rem', 
  fontSize: '1rem', 
  boxSizing: 'border-box',
};

const inputContainerStyle = {
  display: 'flex', 
  flexDirection: 'column', 
  gap: '8px',
};

const buttonsContainerStyle = {
  marginTop: '12px', 
  display: 'flex', 
  gap: '10px', 
  justifyContent: 'flex-end',
};

const saveBtnStyle = {
  background: 'var(--primary)', 
  color: '#fff', 
  border: 'none', 
  padding: '0.8rem 1.2rem', 
  fontSize: '1rem', 
  borderRadius: '8px', 
  cursor: 'pointer',
};

const cancelBtnStyle = {
  background: 'var(--accent2)', 
  color: 'var(--text-dark)', 
  border: 'none', 
  padding: '0.8rem 1.2rem', 
  fontSize: '1rem', 
  borderRadius: '8px', 
  cursor: 'pointer',
};
