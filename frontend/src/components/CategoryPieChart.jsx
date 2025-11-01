import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

// Update COLORS to use CSS variables
const COLORS = [
  'var(--primary)',    // Primary color
  'var(--accent1)',    // Accent 1
  'var(--accent2)',    // Accent 2
  'var(--accent3)',    // Accent 3
  '#7f8c8d',           // Neutral color
  '#a29bfe',           // Soft purple, fallback
];

const currencyFmt = (v) => `₱${v.toFixed(2)}`;

export default function CategoryPieChart({ data, loading }) {
  if (loading) return <div>Loading chart…</div>;
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="gross"
            nameKey="category"
            outerRadius={100}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => currencyFmt(v)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
