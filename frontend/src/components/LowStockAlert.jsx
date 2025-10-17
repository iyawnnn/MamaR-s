import React from 'react';

export default function LowStockAlert({ items = [] }) {
  if (!items.length) return null;
  return (
    <div style={{ padding: 8, background: '#fff4e6', border: '1px solid #ffd8a8', margin: '12px 0' }}>
      <strong>Low stock:</strong> {items.length} item(s). Check inventory.
    </div>
  );
}
