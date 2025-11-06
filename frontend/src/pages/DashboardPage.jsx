import React, { useEffect, useState, useCallback } from "react";
import axios from "../api/axios";
import KpiCards from "../components/KpiCards";
import DateRangePicker from "../components/DateRangePicker";
import SalesLineChart from "../components/SalesLineChart";
import GrossVsNetBar from "../components/GrossVsNetBar";
import CategoryPieChart from "../components/CategoryPieChart";
import { fillMissingDates } from "../utils/dateUtils";
import "./DashboardPage.css"; // 👈 make sure this CSS file exists

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

  return (
    <div className="dashboard-container">
      {/* Header with Date Range Picker */}
      <div className="dashboard-header">
        <DateRangePicker
          onChange={onRangeChange}
          initialStart={range.start}
          initialEnd={range.end}
        />
      </div>

      {/* KPI Cards */}
      <section className="dashboard-kpi">
        <KpiCards summary={summary} loading={loading.kpi} />
      </section>

      {/* Charts Grid */}
      <section className="charts-grid">
        {/* Top 2 charts */}
        <div className="chart-card">
          <h4 className="chart-title">Gross vs Net</h4>
          <GrossVsNetBar data={grossNetSeries} loading={loading.gross} />
        </div>

        <div className="chart-card">
          <h4 className="chart-title">Sales by Category</h4>
          <CategoryPieChart data={categories} loading={loading.cat} />
        </div>

        {/* Bottom full-width chart */}
        <div className="chart-card full-width">
          <h4 className="chart-title">Sales (Net vs Gross) — Daily</h4>
          <SalesLineChart data={salesSeries} loading={loading.sales} />
        </div>
      </section>
    </div>
  );
}
