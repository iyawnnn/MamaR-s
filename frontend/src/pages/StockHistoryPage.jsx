import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import dayjs from 'dayjs';

export default function StockHistoryPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/stock-logs');
        setLogs(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, []);

  return (
    <div>
      <h2>Stock History</h2>
      <table border="1" cellPadding="8" style={{ width:'100%', marginTop:12 }}>
        <thead><tr><th>Product</th><th>Change</th><th>Reason</th><th>Date</th></tr></thead>
        <tbody>
          {logs.map(l => (
            <tr key={l._id}>
              <td>{l.productId?.name || '—'}</td>
              <td>{l.change}</td>
              <td>{l.reason}</td>
              <td>{dayjs(l.date).format('YYYY-MM-DD HH:mm')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
