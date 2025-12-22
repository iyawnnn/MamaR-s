import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const shortDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const currencyFmt = (v) => `₱${v.toLocaleString()}`;

// SMART FORMATTER: Handles small and large numbers gracefully
const formatCurrencyAxis = (value) => {
  if (value === 0) return '0';
  if (value >= 1000000) return `₱${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₱${(value / 1000).toFixed(1)}k`;
  return `₱${value}`; // Shows "₱80" instead of "0.08k"
};

export default function GrossVsNetBar({ data }) {
  if (!data || data.length === 0) 
    return <div className="no-data" style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>No data available</div>;

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
          barGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          
          <XAxis 
            dataKey="period" 
            tickFormatter={shortDate} 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 12, fontFamily: 'Outfit, sans-serif' }}
            dy={10}
          />
          
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 12, fontFamily: 'Outfit, sans-serif' }}
            tickFormatter={formatCurrencyAxis} /* Using Smart Formatter */
            width={45} /* Fixed width to prevent layout shifts */
          />
          
          <Tooltip 
            cursor={{ fill: '#F1F5F9' }}
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              fontFamily: 'Outfit, sans-serif'
            }}
            formatter={(val) => [currencyFmt(val), '']}
            labelFormatter={shortDate}
          />
          
          <Legend 
            iconType="circle" 
            wrapperStyle={{ 
              paddingTop: '24px',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '0.9rem'
            }} 
          />
          
          <Bar 
            dataKey="gross" 
            name="Gross Sales" 
            fill="#F59E0B" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={50}
          />
          <Bar 
            dataKey="net" 
            name="Net Sales" 
            fill="#334155" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={50}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}