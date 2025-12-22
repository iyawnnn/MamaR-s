import React from 'react';
import './KpiCards.css';

const currency = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

export default function KpiCards({ summary }) {
  const {
    grossSales = 0,
    netSales = 0,
    grossProfit = 0,
    operatingExpenses = 0,
    netProfit = 0
  } = summary || {};

  const StatItem = ({ label, value, icon, color }) => (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        <i className={`bi ${icon}`}></i>
      </div>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{currency.format(value)}</span>
      </div>
    </div>
  );

  return (
    <div className="kpi-grid">
      <StatItem label="Gross Sales" value={grossSales} icon="bi-shop" color="gold" />
      <StatItem label="Net Sales" value={netSales} icon="bi-wallet2" color="blue" />
      <StatItem label="Expenses" value={operatingExpenses} icon="bi-receipt" color="red" />
      <StatItem label="Net Profit" value={netProfit} icon="bi-pie-chart-fill" color="green" />
    </div>
  );
}