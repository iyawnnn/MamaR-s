import React from 'react';

export default function LowStockAlert({ items = [] }) {
  if (!items.length) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: '#10B981', 
        flexDirection: 'column',
        gap: '8px'
      }}>
        <i className="bi bi-check-circle" style={{ fontSize: '2rem' }}></i>
        <span>Inventory is healthy!</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {items.slice(0, 5).map((item) => (
        <div key={item._id} style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '10px 12px',
          background: '#FEF2F2', 
          borderRadius: '8px',
          borderLeft: '4px solid #EF4444'
        }}>
          <div>
            <div style={{ fontWeight: '600', color: '#1E293B', fontSize: '0.95rem' }}>{item.name}</div>
            <div style={{ fontSize: '0.8rem', color: '#EF4444' }}>Critical Level</div>
          </div>
          <div style={{ 
            fontWeight: '700', 
            background: '#fff', 
            padding: '4px 10px', 
            borderRadius: '20px', 
            color: '#EF4444',
            fontSize: '0.9rem',
            border: '1px solid #FECACA'
          }}>
            {item.stock} left
          </div>
        </div>
      ))}
      {items.length > 5 && (
        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748B', marginTop: '8px' }}>
          + {items.length - 5} more items
        </div>
      )}
    </div>
  );
}