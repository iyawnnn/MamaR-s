import React, { useState } from 'react';
import axios from '../api/axios';

export default function RestockModal({ product, onClose }) {
  const [qty, setQty] = useState(1);
  const [saving, setSaving] = useState(false);

  const handleRestock = async () => {
    if (!qty || qty <= 0) return alert('Enter quantity > 0');
    setSaving(true);
    try {
      await axios.post(`/products/${product._id}/restock`, { quantity: Number(qty) });
      onClose();
    } catch (err) {
      alert(err?.response?.data?.message || 'Restock failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={modalStyle}>
      <div style={{ background: 'white', padding: 16, borderRadius: 6 }}>
        <h3>Restock {product.name}</h3>
        <input type="number" value={qty} onChange={e => setQty(Number(e.target.value))} min="1"/>
        <div style={{ marginTop: 8 }}>
          <button onClick={handleRestock} disabled={saving}>{saving ? 'Saving…' : 'Add'}</button>{' '}
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const modalStyle = { position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.2)' };
