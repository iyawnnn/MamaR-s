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
            stroke="var(--primary)"  // Using primary color for Net sales
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="gross"
            name="Gross"
            stroke="var(--accent1)"  // Using accent1 color for Gross sales
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
