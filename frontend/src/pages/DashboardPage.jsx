import React, { useEffect, useState, useCallback } from "react";
import axios from "../api/axios";
import KpiCards from "../components/KpiCards";
import DateRangePicker from "../components/DateRangePicker";
import SalesLineChart from "../components/SalesLineChart";
import GrossVsNetBar from "../components/GrossVsNetBar";
import CategoryPieChart from "../components/CategoryPieChart";
import { fillMissingDates } from "../utils/dateUtils";
import "./DashboardPage.css";

const EmptyState = ({ message = "No data available for this period" }) => (
  <div className="empty-state-container">
    <div className="empty-state-icon">
      <i className="bi bi-bar-chart-line"></i>
    </div>
    <p className="empty-state-text">{message}</p>
    <span className="empty-state-subtext">Try selecting a different date range.</span>
  </div>
);

export default function DashboardPage() {
  const [range, setRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);

    const toLocalISO = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return { start: toLocalISO(start), end: toLocalISO(end) };
  });

  const [summary, setSummary] = useState(null);
  const [salesSeries, setSalesSeries] = useState([]);
  const [grossNetSeries, setGrossNetSeries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Date for Header
  const todayDisplay = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const formatShortDate = (isoDate) => {
    const [year, month, day] = isoDate.split('-');
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const fetchAll = useCallback(async ({ start, end }) => {
    try {
      setLoading(true);

      const [kpiRes, salesRes, grossRes, catRes] = await Promise.all([
        axios.get("/reports/summary", { params: { start, end } }),
        axios.get("/dashboard/sales-over-time", { params: { start, end } }),
        axios.get("/dashboard/gross-vs-net", { params: { start, end } }),
        axios.get("/dashboard/sales-by-category", { params: { start, end } }),
      ]);

      setSummary(kpiRes.data);

      const sSeries = salesRes.data.series || [];
      if (sSeries.length > 0) {
        const filled = fillMissingDates(
          sSeries,
          range.start,
          range.end,
          ["net", "gross", "cogs", "discounts"]
        ).map((d) => ({ ...d, date: formatShortDate(d.date) }));
        setSalesSeries(filled);
      } else {
        setSalesSeries([]);
      }

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
      setLoading(false);
    }
  }, [range.start, range.end]);

  useEffect(() => {
    fetchAll(range);
  }, [fetchAll, range.start, range.end]);

  const onRangeChange = ({ start, end }) => {
    setRange({ start, end });
  };

  if (loading && !summary) {
    return (
      <div className="dashboard-loading-screen">
        <div className="spinner"></div>
        <span>Gathering insights...</span>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="page-meta">
            <span className="meta-date">
              <i className="bi bi-calendar-event"></i>
              {todayDisplay}
            </span>
          </div>
        </div>
        <div className="header-actions">
          <DateRangePicker
            onChange={onRangeChange}
            initialStart={range.start}
            initialEnd={range.end}
          />
        </div>
      </header>

      {/* KPI Cards Section */}
      <section className="dashboard-section">
        <KpiCards summary={summary} loading={loading} />
      </section>

      {/* Analytics Grid */}
      <section className="dashboard-charts-grid">
        
        {/* Full Width Sales Trend */}
        <div className="chart-card full-width">
          <div className="card-header">
            <div>
              <h3 className="card-title">Sales Trend</h3>
              <span className="card-subtitle">Daily Net vs Gross Income</span>
            </div>
          </div>
          <div className="chart-wrapper">
            {salesSeries.length > 0 ? (
              <SalesLineChart data={salesSeries} />
            ) : (
              <EmptyState message="No sales recorded for this period" />
            )}
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="chart-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Revenue Breakdown</h3>
              <span className="card-subtitle">Profitability Analysis</span>
            </div>
          </div>
          <div className="chart-wrapper">
            {grossNetSeries.length > 0 ? (
              <GrossVsNetBar data={grossNetSeries} />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>

        {/* Category Share */}
        <div className="chart-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Category Share</h3>
              <span className="card-subtitle">Top Performing Products</span>
            </div>
          </div>
          <div className="chart-wrapper">
            {categories.length > 0 ? (
              <CategoryPieChart data={categories} />
            ) : (
              <EmptyState message="No category data found" />
            )}
          </div>
        </div>

      </section>
    </div>
  );
}