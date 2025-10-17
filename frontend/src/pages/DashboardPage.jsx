import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

export default function DashboardPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('/products').then(r => setProducts(r.data)).catch(e => console.error(e));
  }, []);

  const totalStockValue = products.reduce((s, p) => s + (p.stockValue ?? (p.stock * p.costPrice)), 0);
  const lowStockCount = products.filter(p => p.lowStock).length;

  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{ display:'flex', gap: 12 }}>
        <div style={cardStyle}>
          <div>Total products</div>
          <div style={{ fontSize: 20 }}>{products.length}</div>
        </div>
        <div style={cardStyle}>
          <div>Total stock value</div>
          <div style={{ fontSize: 20 }}>₱{totalStockValue.toFixed(2)}</div>
        </div>
        <div style={cardStyle}>
          <div>Low stock items</div>
          <div style={{ fontSize: 20 }}>{lowStockCount}</div>
        </div>
      </div>
    </div>
  );
}

const cardStyle = { padding: 12, borderRadius: 6, background: '#fff', border: '1px solid #eee', minWidth: 160 };
