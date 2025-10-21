// SalesLineChart.jsx
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const currencyFmt = (v) => `₱${v.toFixed(2)}`;

// Format date like "Oct 17"
const shortDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function SalesLineChart({ data, valueKey = "net", loading }) {
  if (loading) return <div>Loading chart…</div>;
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="date" tickFormatter={(v) => shortDate(v)} />
          <YAxis />
          <Tooltip labelFormatter={(v) => shortDate(v)} />
          <Legend />
          <Line
            type="monotone"
            dataKey="net"
            name="Net"
            stroke="#8884d8"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="gross"
            name="Gross"
            stroke="#82ca9d"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
