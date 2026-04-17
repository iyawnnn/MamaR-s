import React, { useEffect, useState } from "react";
import api from "../services/api";
import SalesForm from "../components/SalesForm";
import { Loader2, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";

const Peso = () => (
  <span className="font-sans mr-0.5 opacity-80 font-medium">₱</span>
);

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalRevenue = sales.reduce(
    (acc, curr) => acc + (curr.totalPrice || 0),
    0
  );
  const totalSold = sales.reduce((acc, curr) => acc + (curr.quantity || 0), 0);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await api.get("/sales");
      const salesData = res.data.sales || res.data || [];
      setSales(salesData);
    } catch (err) {
      console.error("Failed to fetch sales", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const totalPages = Math.ceil(sales.length / itemsPerPage);
  const currentPageData = sales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 sm:space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1 text-left">
          <h2 className="text-3xl sm:text-4xl font-black text-stone-800 tracking-tight font-display">
            Point of Sale
          </h2>
          <p className="text-stone-500 font-medium text-sm">
            Record transactions and manage history.
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="flex-1 md:flex-none bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-end justify-center">
            <span className="text-[10px] uppercase font-black text-stone-400 tracking-[0.2em] text-right block w-full">
              Total Revenue
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-1 text-right block w-full">
              <Peso />
              {totalRevenue.toLocaleString()}
            </span>
          </div>

          <div className="flex-1 md:flex-none bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-end justify-center">
            <span className="text-[10px] uppercase font-black text-stone-400 tracking-[0.2em] text-right block w-full">
              Units Sold
            </span>
            <span className="text-2xl font-black text-stone-800 mt-1 text-right block w-full">
              {totalSold}
            </span>
          </div>
        </div>
      </div>

      <SalesForm
        onSaleRecorded={() => {
          fetchSales();
          setCurrentPage(1);
        }}
      />

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 sm:p-6 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
          <h3 className="font-black text-stone-800 text-[11px] uppercase tracking-[0.2em] flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-500" />
            Recent Transactions
          </h3>
          <span className="text-[10px] font-black bg-stone-200 text-stone-600 px-3 py-1 rounded-lg uppercase">
            {sales.length} Records
          </span>
        </div>

        {loading ? (
          <div className="p-20 flex justify-center text-amber-500">
            <Loader2 className="animate-spin w-8 h-8" />
          </div>
        ) : sales.length === 0 ? (
          <div className="p-16 text-center text-stone-400 flex flex-col items-center">
            <ShoppingBag className="w-12 h-12 text-stone-100 mb-4" />
            <p className="font-bold text-sm uppercase tracking-widest italic">
              No records yet
            </p>
          </div>
        ) : (
          <div className="flex flex-col overflow-hidden">
            <div className="w-full overflow-x-auto scrollbar-hide">
              <table className="w-full text-sm text-left border-collapse min-w-[750px]">
                <thead className="text-[10px] text-stone-400 uppercase font-black bg-white border-b border-stone-50">
                  <tr>
                    <th className="px-6 py-5">Date</th>
                    <th className="px-6 py-5">Customer</th>
                    <th className="px-6 py-5">Item Details</th>
                    <th className="px-6 py-5 text-center">Qty</th>
                    <th className="px-6 py-5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {currentPageData.map((s) => (
                    <tr
                      key={s._id}
                      className="hover:bg-stone-50/50 transition-colors"
                    >
                      <td className="px-6 py-5 text-[10px] text-stone-400 font-black whitespace-nowrap uppercase">
                        {new Date(s.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-5 font-bold text-stone-800 text-sm">
                        {s.customerName || "Walk-in"}
                      </td>
                      <td className="px-6 py-5 text-[11px] text-stone-500 italic">
                        {s.productName || "Bakery Item"}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="bg-stone-100 text-stone-600 px-2.5 py-1 rounded-md font-black text-[10px]">
                          x{s.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-black text-emerald-600 text-sm whitespace-nowrap">
                        <Peso />
                        {Number(s.totalPrice).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-5 border-t border-stone-100 bg-stone-50/30 flex items-center justify-between">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest hidden sm:block">
                Entry {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, sales.length)}
              </p>

              <div className="flex items-center gap-1 mx-auto sm:mx-0">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-stone-400 hover:text-stone-800 disabled:opacity-20 transition-all cursor-pointer"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex gap-1.5 px-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                        currentPage === i + 1
                          ? "bg-stone-900 text-white shadow-lg"
                          : "text-stone-400 hover:bg-stone-100"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 text-stone-400 hover:text-stone-800 disabled:opacity-20 transition-all cursor-pointer"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}