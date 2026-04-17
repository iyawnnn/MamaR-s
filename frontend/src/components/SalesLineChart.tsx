import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";

const currencyFmt = (v) => {
  if (v >= 1000) return `₱${(v / 1000).toFixed(1)}k`;
  return `₱${v}`;
};

const shortDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function SalesLineChart({ data }) {
  if (!data || data.length === 0) 
    return <div className="no-data" style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>No data available</div>;

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
               <stop offset="5%" stopColor="#334155" stopOpacity={0.05}/>
               <stop offset="95%" stopColor="#334155" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          
          <XAxis 
            dataKey="date" 
            tickFormatter={shortDate} 
            axisLine={false} 
            tickLine={false} 
            /* FIXED: Automatically skip ticks if they crowd each other */
            minTickGap={30}
            tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Outfit, sans-serif' }}
            dy={10}
          />
          
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={currencyFmt} 
            tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Outfit, sans-serif' }}
          />
          
          <Tooltip 
            contentStyle={{ 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '0.9rem'
            }}
            formatter={(val) => [`₱${val.toLocaleString()}`, '']}
            labelFormatter={shortDate}
          />
          
          <Legend 
            iconType="circle"
            wrapperStyle={{ paddingTop: '16px', fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem' }}
          />
          
          <Area 
            type="monotone" 
            dataKey="gross" 
            stroke="#94A3B8" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorGross)" 
            name="Gross Sales"
          />
          
          <Area 
            type="monotone" 
            dataKey="net" 
            stroke="#F59E0B" 
            strokeWidth={2} /* Slightly thinner for elegance */
            fillOpacity={1} 
            fill="url(#colorNet)" 
            name="Net Sales"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}