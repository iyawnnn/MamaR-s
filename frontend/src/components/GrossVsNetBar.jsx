// GrossVsNetBar.jsx
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

// Format date like "Oct 17"
const shortDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function GrossVsNetBar({ data, loading }) {
  if (loading) return <p>Loading...</p>;
  if (!data?.length) return <p>No data</p>;

  return (
    <div style={{ width: "100%", height: 300 }}>
      {" "}
      {/* <— important */}
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" /> {/* <— grid lines */}
          <XAxis dataKey="period" tickFormatter={(v) => shortDate(v)} />
          <YAxis />
          <Tooltip labelFormatter={(v) => shortDate(v)} />
          <Legend />
          <Bar dataKey="gross" fill="#8884d8" name="Gross Sales" />
          <Bar dataKey="net" fill="#82ca9d" name="Net Sales" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
