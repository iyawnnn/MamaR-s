// CategoryPieChart.jsx
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f7f', '#7f8c8d', '#a29bfe'];

const currencyFmt = (v) => `₱${v.toFixed(2)}`;

export default function CategoryPieChart({ data, loading }) {
  if (loading) return <div>Loading chart…</div>;
  return (
    <div style={{ width:'100%', height:300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="gross" nameKey="category" outerRadius={100} label>
            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v) => currencyFmt(v)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
