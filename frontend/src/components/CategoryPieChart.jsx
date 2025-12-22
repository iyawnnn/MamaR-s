import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = [
  '#F59E0B', // Gold
  '#334155', // Slate
  '#10B981', // Emerald
  '#EF4444', // Rose
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
];

const currencyFmt = (v) => `₱${v.toLocaleString()}`;

export default function CategoryPieChart({ data }) {
  if (!data || data.length === 0) 
    return <div className="no-data" style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>No data available</div>;

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="gross"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          
          <Tooltip 
            formatter={(val) => currencyFmt(val)}
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              fontFamily: 'Outfit, sans-serif'
            }}
            itemStyle={{ color: '#1E293B' }}
          />
          
          <Legend 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            iconType="circle"
            wrapperStyle={{ 
              fontFamily: 'Outfit, sans-serif',
              fontSize: '0.85rem',
              color: '#475569'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}