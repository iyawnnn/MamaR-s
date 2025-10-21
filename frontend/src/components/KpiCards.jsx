// KpiCards.jsx
import React from 'react';

const currency = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

export default function KpiCards({ summary, loading }) {
  if (loading) {
    return <div>Loading KPIs…</div>;
  }

  const {
    grossSales = 0,
    netSales = 0,
    grossProfit = 0,
    operatingExpenses = 0,
    netProfit = 0
  } = summary || {};

  const card = (title, value, sub) => (
    <div style={{
      background:'#fff', padding:16, borderRadius:8, boxShadow:'0 1px 4px rgba(0,0,0,0.08)',
      minWidth:170
    }}>
      <div style={{ fontSize:12, color:'#666' }}>{title}</div>
      <div style={{ fontSize:18, fontWeight:700 }}>{currency.format(value)}</div>
      {sub && <div style={{ fontSize:12, color:'#888' }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:12 }}>
      {card('Total Gross Sales', grossSales)}
      {card('Net Sales', netSales)}
      {card('Gross Profit', grossProfit)}
      {card('Operating Expenses', operatingExpenses)}
      {card('Net Profit', netProfit)}
    </div>
  );
}
