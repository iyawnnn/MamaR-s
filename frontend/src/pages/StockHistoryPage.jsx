import React, { useEffect, useState } from "react";
import api from "../api/axios";
import {
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  Package,
  ChevronLeft,
  ChevronRight,
  History,
  Calendar,
} from "lucide-react";

export default function StockLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("All");
  const itemsPerPage = 5;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products/logs/all");
      setLogs(res.data);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (activeFilter === "All") return true;
    return log.changeType === activeFilter;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const currentData = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading)
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );

  return (
    /* ✅ PADDING: Uses the same fluid padding as your Dashboard */
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in px-4 sm:px-6 lg:px-8">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-stone-200 pb-5 gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-stone-800 tracking-tight font-display text-left">
            Stock Logs
          </h2>
          <p className="text-sm sm:text-base text-stone-500 font-medium text-left">
            Tracking inventory movements and sales.
          </p>
        </div>

        {/* Filter Pills - Responsive Scroll for Small Screens */}
        <div className="flex bg-stone-100 p-1 rounded-xl self-start sm:self-end overflow-x-auto max-w-full hide-scrollbar">
          {["All", "Restock", "Sale"].map((type) => (
            <button
              key={type}
              onClick={() => {
                setActiveFilter(type);
                setCurrentPage(1);
              }}
              className={`whitespace-nowrap px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeFilter === type
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              {type === "All" ? "View All" : type + "s"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Container - EXACT SAME AS DASHBOARD */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col min-w-0">
        {/* Table Header Section */}
        <div className="p-4 sm:p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
          <h3 className="font-bold text-stone-800 font-display uppercase text-xs tracking-widest flex items-center gap-2">
            <History className="w-4 h-4 text-amber-500" />
            Transaction Log
          </h3>
          <span className="text-[10px] font-black bg-stone-200 text-stone-600 px-3 py-1 rounded-full">
            {filteredLogs.length} MOVEMENTS
          </span>
        </div>

        {/* ✅ WRAPPER: This is what forces the scroll and stops the squeezing */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left border-collapse min-w-[650px]">
            <thead className="text-[10px] text-stone-400 uppercase font-black bg-white border-b border-stone-50">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Product / Variant</th>
                <th className="px-6 py-4">Movement</th>
                <th className="px-6 py-4 text-right">Qty Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {currentData.length > 0 ? (
                currentData.map((log, i) => {
                  const amount = Number(log.changeAmount || log.quantity || 0);
                  return (
                    <tr
                      key={i}
                      className="hover:bg-stone-50/50 transition-colors"
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-stone-300" />
                          <span className="text-stone-800 font-bold text-[11px] uppercase">
                            {new Date(log.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="hidden sm:flex p-1.5 bg-stone-50 rounded-lg text-stone-400 border border-stone-100">
                            <Package size={14} />
                          </div>
                          <span className="font-bold text-stone-800 text-xs sm:text-sm">
                            {log.productName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            log.changeType === "Restock"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {log.changeType === "Restock" ? (
                            <ArrowUpRight size={10} />
                          ) : (
                            <ArrowDownLeft size={10} />
                          )}
                          {log.changeType}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-5 text-right font-black text-xs sm:text-sm ${
                          amount > 0 ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {amount > 0 ? `+${amount}` : amount}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="p-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <Package size={48} className="mb-2" />
                      <p className="font-black text-[10px] uppercase tracking-widest text-stone-400">
                        No logs found
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - Matching the dashboard card footer style */}
        {totalPages > 1 && (
          <div className="p-4 bg-stone-50/30 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              Showing {currentData.length} records
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                }}
                disabled={currentPage === 1}
                className="p-2 bg-white border border-stone-200 rounded-xl hover:bg-stone-100 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => {
                      setCurrentPage(i + 1);
                    }}
                    className={`w-8 h-8 rounded-xl text-[10px] font-black transition-all ${
                      currentPage === i + 1
                        ? "bg-stone-900 text-white shadow-md shadow-stone-900/20"
                        : "text-stone-400 hover:bg-stone-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                }}
                disabled={currentPage === totalPages}
                className="p-2 bg-white border border-stone-200 rounded-xl hover:bg-stone-100 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
