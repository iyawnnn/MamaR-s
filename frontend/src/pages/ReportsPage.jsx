// frontend/src/pages/ReportsPage.jsx
import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import dayjs from 'dayjs';

export default function ReportsPage() {
  const [start, setStart] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [end, setEnd] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/reports/summary?start=${start}&end=${end}`);
      setSummary(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSummary(); }, []); // initial

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <h2>Reports</h2>

      <div style={{ display:'flex', gap:12, marginBottom:12 }}>
        <div>
          <label>Start</label><br />
          <input type="date" value={start} onChange={e => setStart(e.target.value)} />
        </div>
        <div>
          <label>End</label><br />
          <input type="date" value={end} onChange={e => setEnd(e.target.value)} />
        </div>
        <div style={{ alignSelf:'end' }}>
          <button onClick={fetchSummary}>Run</button>
        </div>
      </div>

      {loading ? <p>Loading...</p> : summary ? (
        <div>
          <div style={{ display:'flex', gap:12, marginBottom:12 }}>
            <Card title="Gross Sales" value={summary.grossSales} />
            <Card title="Discounts" value={summary.discounts} />
            <Card title="Net Sales" value={summary.netSales} />
            <Card title="Gross Profit" value={summary.grossProfit} />
            <Card title="Operating Expenses" value={summary.operatingExpenses} />
            <Card title="Net Profit" value={summary.netProfit} />
          </div>
          {/* Add more breakdowns (expense by category, top products) later */}
        </div>
      ) : <p>No data</p>}
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={{ padding:12, border:'1px solid #eee', minWidth:160, borderRadius:6 }}>
      <div style={{ color:'#666' }}>{title}</div>
      <div style={{ fontSize:18, fontWeight:700 }}>₱{Number(value || 0).toFixed(2)}</div>
    </div>
  );
}
