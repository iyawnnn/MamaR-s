import React, { useEffect, useState, useCallback } from "react";
import axios from "../api/axios";
import KpiCards from "../components/KpiCards";
import DateRangePicker from "../components/DateRangePicker";
import SalesLineChart from "../components/SalesLineChart";
import GrossVsNetBar from "../components/GrossVsNetBar";
import CategoryPieChart from "../components/CategoryPieChart";
import { fillMissingDates } from "../utils/dateUtils";

export default function DashboardPage() {
  const [range, setRange] = useState(() => {
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000);
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    };
  });

  const [summary, setSummary] = useState(null);
  const [salesSeries, setSalesSeries] = useState([]);
  const [grossNetSeries, setGrossNetSeries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState({
    kpi: false,
    sales: false,
    gross: false,
    cat: false,
  });

  const formatShortDate = (isoDate) => {
    const d = new Date(isoDate);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const fetchAll = useCallback(async ({ start, end }) => {
    try {
      setLoading({ kpi: true, sales: true, gross: true, cat: true });

      const [kpiRes, salesRes, grossRes, catRes] = await Promise.all([
        axios.get("/reports/summary", { params: { start, end } }),
        axios.get("/dashboard/sales-over-time", { params: { start, end } }),
        axios.get("/dashboard/gross-vs-net", { params: { start, end } }),
        axios.get("/dashboard/sales-by-category", { params: { start, end } }),
      ]);

      setSummary(kpiRes.data);

      // 📈 Format and fill missing dates
      const sSeries = salesRes.data.series || [];
      const filled = fillMissingDates(
        sSeries,
        salesRes.data.start,
        salesRes.data.end,
        ["net", "gross", "cogs", "discounts"]
      ).map((d) => ({
        ...d,
        date: formatShortDate(d.date),
      }));
      setSalesSeries(filled);

      // 🧱 Gross vs Net
      const gSeries = (grossRes.data.series || []).map((s) => ({
        period: s.period,
        gross: s.gross,
        net: s.net,
      }));
      setGrossNetSeries(gSeries);

      // 🥧 Sales by Category
      setCategories(
        (catRes.data.categories || []).map((c) => ({
          category: c.category || "Uncategorized",
          gross: c.gross || 0,
          net: c.net || 0,
          quantity: c.quantity || 0,
        }))
      );
    } catch (err) {
      console.error("❌ Failed to fetch dashboard data", err);
    } finally {
      setLoading({ kpi: false, sales: false, gross: false, cat: false });
    }
  }, []);

  useEffect(() => {
    fetchAll(range);
  }, [fetchAll, range.start, range.end]);

  const onRangeChange = ({ start, end }) => {
    setRange({ start, end });
    fetchAll({ start, end });
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Dashboard</h3>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 12, color: "#666" }}>Financial snapshot</div>
        <DateRangePicker
          onChange={onRangeChange}
          initialStart={range.start}
          initialEnd={range.end}
        />
      </div>

      <section style={{ marginBottom: 20 }}>
        <KpiCards summary={summary} loading={loading.kpi} />
      </section>

      <section
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
      >
        <div style={{ background: "#f9f9fb", padding: 12, borderRadius: 8 }}>
          <h4>Sales (net vs gross) — Daily</h4>
          <SalesLineChart data={salesSeries} loading={loading.sales} />
        </div>

        <div style={{ background: "#f9f9fb", padding: 12, borderRadius: 8 }}>
          <h4>Gross vs Net</h4>
          <GrossVsNetBar data={grossNetSeries} loading={loading.gross} />
        </div>

        <div
          style={{
            gridColumn: "1 / -1",
            background: "#f9f9fb",
            padding: 12,
            borderRadius: 8,
          }}
        >
          <h4>Sales by Category</h4>
          <CategoryPieChart data={categories} loading={loading.cat} />
        </div>
      </section>
    </div>
  );
}
