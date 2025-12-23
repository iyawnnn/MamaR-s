import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  TrendingUp,
  PieChart,
  Package,
  Download,
  Calendar,
  Loader2,
  ShoppingBag,
  Target,
  ChevronRight,
} from "lucide-react";

// Standard Peso Helper
const Peso = () => (
  <span className="font-sans mr-0.5 opacity-80 font-medium">₱</span>
);

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState("7d");
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    totalSales: 0,
    topProducts: [],
    lowStockCount: 0,
    avgSaleValue: 0,
    rawSales: [],
  });

  const fetchReport = async () => {
    setLoading(true);
    try {
      const salesRes = await axios.get("/sales");
      const prodRes = await axios.get("/products");

      const sales = salesRes.data.sales || salesRes.data || [];
      const products = prodRes.data.products || prodRes.data || [];

      const now = new Date();
      const filteredSales = sales.filter((s) => {
        const saleDate = new Date(s.date);
        if (timeFrame === "24h") return now - saleDate < 24 * 60 * 60 * 1000;
        if (timeFrame === "7d") return now - saleDate < 7 * 24 * 60 * 60 * 1000;
        return true;
      });

      const revenue = filteredSales.reduce(
        (acc, curr) => acc + (curr.totalPrice || 0),
        0
      );

      const productMap = {};
      filteredSales.forEach((s) => {
        const name = s.productName;
        if (!productMap[name])
          productMap[name] = { productName: name, quantity: 0, totalPrice: 0 };
        productMap[name].quantity += s.quantity;
        productMap[name].totalPrice += s.totalPrice;
      });

      const sortedProducts = Object.values(productMap)
        .sort((a, b) => b.totalPrice - a.totalPrice)
        .slice(0, 5);

      setReportData({
        totalRevenue: revenue,
        totalSales: filteredSales.length,
        lowStockCount: products.filter((p) => p.lowStock).length,
        avgSaleValue:
          filteredSales.length > 0 ? revenue / filteredSales.length : 0,
        topProducts: sortedProducts,
        rawSales: filteredSales,
      });
    } catch (err) {
      console.error("Report Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [timeFrame]);

  const exportToCSV = () => {
    if (reportData.rawSales.length === 0) return alert("No data available");
    const headers = ["Date", "Customer", "Product", "Qty", "Total"];
    const rows = reportData.rawSales.map((s) => [
      new Date(s.date).toLocaleDateString(),
      s.customerName,
      s.productName,
      s.quantity,
      s.totalPrice,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `report_${timeFrame}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading)
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6 sm:space-y-10 animate-fade-in">
      {/* Header & Timeframe Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-left">
          <h2 className="text-3xl sm:text-4xl font-black text-stone-800 tracking-tight font-display">
            Intelligence
          </h2>
          <p className="text-stone-500 font-medium text-sm mt-1">
            Analyze your bakery's growth and metrics.
          </p>
        </div>

        {/* Responsive Timeframe Toggle */}
        <div className="flex bg-white p-1 rounded-2xl border border-stone-200 shadow-sm self-start">
          {["24h", "7d", "30d"].map((t) => (
            <button
              key={t}
              onClick={() => setTimeFrame(t)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                timeFrame === t
                  ? "bg-stone-900 text-white shadow-md"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards - Responsive Grid Logic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <ReportStat
          label="Revenue"
          value={
            <>
              <Peso />
              {reportData.totalRevenue.toLocaleString()}
            </>
          }
          icon={TrendingUp}
          color="text-emerald-600"
          sub="Analytics"
        />
        <ReportStat
          label="Orders"
          value={reportData.totalSales}
          icon={ShoppingBag}
          color="text-amber-600"
          sub="Transactions"
        />
        <ReportStat
          label="Avg. Sale"
          value={
            <>
              <Peso />
              {reportData.avgSaleValue.toFixed(0)}
            </>
          }
          icon={Target}
          color="text-blue-600"
          sub="Efficiency"
        />
        <ReportStat
          label="Stock"
          value={`${reportData.lowStockCount} Alerts`}
          icon={Package}
          color="text-red-600"
          sub="Attention"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 items-stretch">
        {/* Revenue Split Table */}
        <div className="xl:col-span-2 flex flex-col">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <h3 className="text-[11px] font-black text-stone-800 uppercase tracking-[0.2em] flex items-center gap-2">
                <PieChart className="w-4 h-4 text-amber-500" /> Revenue Split
              </h3>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm text-left border-collapse min-w-[500px]">
                <thead className="text-[10px] text-stone-400 uppercase font-black bg-white border-b border-stone-50">
                  <tr>
                    <th className="px-6 py-5">Item Name</th>
                    <th className="px-6 py-5 text-center">Volume</th>
                    <th className="px-6 py-5 text-right">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {reportData.topProducts.map((p, i) => (
                    <tr
                      key={i}
                      className="hover:bg-stone-50/50 transition-colors"
                    >
                      <td className="px-6 py-5 font-bold text-stone-800 text-sm">
                        {p.productName}
                      </td>
                      <td className="px-6 py-5 text-center text-stone-500 font-bold text-sm">
                        {p.quantity}
                      </td>
                      <td className="px-6 py-5 text-right font-black text-emerald-600 text-sm whitespace-nowrap">
                        <Peso />
                        {p.totalPrice.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="bg-stone-900 rounded-2xl p-8 text-white shadow-xl flex-1 flex flex-col justify-center min-h-[300px] text-left">
            <h3 className="text-2xl font-black font-display uppercase tracking-tight leading-none mb-3">
              Export Data
            </h3>
            <p className="text-stone-400 text-sm mb-8 leading-relaxed font-medium">
              Download current view as a CSV for bookkeeping and record
              management.
            </p>
            <button
              onClick={exportToCSV}
              className="w-full py-4 bg-amber-500 text-stone-900 font-black rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-400 transition-all active:scale-95 cursor-pointer shadow-lg shadow-amber-500/10"
            >
              <Download size={16} /> Download CSV
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex items-center justify-between group cursor-default">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-stone-100 text-stone-400 rounded-xl group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                <Calendar size={20} />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">
                  System Status
                </p>
                <p className="text-sm font-bold text-stone-800">Operational</p>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Internal Helper for Stat Cards
const ReportStat = ({ label, value, icon: Icon, color, sub }) => (
  <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between hover:border-stone-300 transition-all group">
    <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
      {label}
    </p>
    <h3 className="text-2xl font-black text-stone-800 mt-2 truncate">
      {value}
    </h3>
    <div
      className={`mt-5 flex items-center gap-2 ${color} font-black text-[9px] uppercase tracking-widest`}
    >
      <Icon size={12} className="group-hover:scale-110 transition-transform" />{" "}
      {sub}
    </div>
  </div>
);
