import React, { useState } from 'react';
import axios from '../api/axios';

export default function RestockModal({ product, onClose }) {
  const [qty, setQty] = useState(product.stock || 1);  // Use current stock as the default value
  const [saving, setSaving] = useState(false);

  const handleRestock = async () => {
    if (!qty || qty <= 0) return alert('Enter quantity > 0');
    setSaving(true);
    try {
      // Send the new stock value to the backend
      await axios.post(`/products/${product._id}/update-stock`, { stock: Number(qty) });
      onClose();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update stock');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={modalStyle}>
      <div style={modalContent}>
        <h3 style={headerStyle}>Set Stock for {product.name}</h3>
        <input 
          type="number" 
          value={qty} 
          onChange={e => setQty(Number(e.target.value))} 
          min="1" 
          style={inputStyle}
        />
        <div style={buttonContainerStyle}>
          <button onClick={handleRestock} disabled={saving} style={buttonStyle}>
            {saving ? 'Saving…' : 'Set Stock'}
          </button>{' '}
          <button onClick={onClose} style={cancelButtonStyle}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const modalStyle = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0,0,0,0.4)',
  zIndex: 9999,
};

const modalContent = {
  background: 'var(--accent3)',
  padding: '30px',
  borderRadius: '12px',
  width: '320px',
  color: 'var(--primary)',
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
  transition: 'all 0.3s ease',
};

const headerStyle = {
  fontSize: '22px',
  marginBottom: '15px',
  fontWeight: '400',
  textAlign: 'center',
  color: 'var(--primary)',
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginTop: '16px',
  borderRadius: '8px',
  border: '1px solid var(--primary)',
  fontSize: '16px',
  color: 'var(--primary)',
  outline: 'none',
  transition: 'all 0.3s ease',
};

const buttonContainerStyle = {
  marginTop: '20px',
  display: 'flex',
  justifyContent: 'space-between',
};

const buttonStyle = {
  backgroundColor: 'var(--primary)',
  color: '#fff',
  border: 'none',
  padding: '12px 25px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px',
  transition: 'background-color 0.3s ease',
  width: '48%',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
};

const cancelButtonStyle = {
  backgroundColor: 'transparent',
  color: 'var(--primary)',
  border: '1px solid var(--primary)',
  padding: '12px 25px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px',
  transition: 'all 0.3s ease',
  width: '48%',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
};
