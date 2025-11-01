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

  const formatShortDate = (isoDate) =>
    new Date(isoDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

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

      const sSeries = salesRes.data.series || [];
      const filled = fillMissingDates(
        sSeries,
        salesRes.data.start,
        salesRes.data.end,
        ["net", "gross", "cogs", "discounts"]
      ).map((d) => ({ ...d, date: formatShortDate(d.date) }));
      setSalesSeries(filled);

      const gSeries = (grossRes.data.series || []).map((s) => ({
        period: s.period,
        gross: s.gross,
        net: s.net,
      }));
      setGrossNetSeries(gSeries);

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

  // New color palette for charts
  const CHART_COLORS = ["#674F2D", "#9D825D", "#D2B48C", "#E4D5B4"];

  return (
    <div
      style={{
        padding: 24,
        background: "var(--background)",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h3 style={{ color: "var(--primary)" }}>Dashboard</h3>
        <DateRangePicker
          onChange={onRangeChange}
          initialStart={range.start}
          initialEnd={range.end}
        />
      </div>

      {/* KPI CARDS */}
      <section style={{ marginBottom: 24 }}>
        <KpiCards summary={summary} loading={loading.kpi} />
      </section>

      {/* GRID LAYOUT */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr", // two equal columns
          gap: 16,
        }}
      >
        {/* Left column: Gross vs Net */}
        <div
          style={{
            background: "var(--accent3)",
            padding: 16,
            borderRadius: 12,
          }}
        >
          <h4 style={{ marginBottom: 12, color: "var(--primary)" }}>
            Gross vs Net
          </h4>
          <GrossVsNetBar
            data={grossNetSeries}
            loading={loading.gross}
            colors={CHART_COLORS}
          />
        </div>

        {/* Right column: Sales by Category */}
        <div
          style={{
            background: "var(--accent3)",
            padding: 16,
            borderRadius: 12,
          }}
        >
          <h4 style={{ marginBottom: 12, color: "var(--primary)" }}>
            Sales by Category
          </h4>
          <CategoryPieChart
            data={categories}
            loading={loading.cat}
            colors={CHART_COLORS}
          />
        </div>

        {/* Bottom row: Sales Line Chart — spans full width */}
        <div
          style={{
            gridColumn: "1 / -1", // span both columns
            background: "var(--accent3)",
            padding: 16,
            borderRadius: 12,
          }}
        >
          <h4 style={{ marginBottom: 12, color: "var(--primary)" }}>
            Sales (Net vs Gross) — Daily
          </h4>
          <SalesLineChart
            data={salesSeries}
            loading={loading.sales}
            colors={CHART_COLORS}
          />
        </div>
      </section>
    </div>
  );
}
