import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import SalesForm from '../components/SalesForm';

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch sales list
  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/sales');
      setSales(res.data);
    } catch (err) {
      console.error('Failed to fetch sales', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h2>Sales</h2>

      {/* Sale Form */}
      <SalesForm onSaleRecorded={fetchSales} />

      <hr style={{ margin: '20px 0' }} />

      <h3>Sales Records</h3>
      {loading ? (
        <p>Loading sales...</p>
      ) : sales.length === 0 ? (
        <p>No sales recorded yet.</p>
      ) : (
        <table border="1" width="100%" cellPadding="6">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Total Price (₱)</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s._id}>
                <td>{new Date(s.date).toLocaleString()}</td>
                <td>{s.customerName}</td>
                <td>{s.productId?.name || '—'}</td>
                <td>{s.quantity}</td>
                <td>₱{Number(s.totalPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
