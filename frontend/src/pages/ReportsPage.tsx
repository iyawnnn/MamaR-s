import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api, { fetchOrders, fetchExpenses } from "@/services/api";
import { formatPHP } from "@/utils/currency";
import {
  TrendingUp,
  PieChart,
  Download,
  Loader2,
  Wallet,
  ReceiptText
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState("30d");
  
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalSales: 0,
    topProducts: [],
    rawSales: [],
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: fetchExpenses
  });

  const fetchReport = async () => {
    setLoading(true);
    try {
      const allOrders = await fetchOrders('FULFILLED');
      const orders = allOrders || [];
      const now = new Date();

      const filterByTimeFrame = (dateString: string | Date) => {
        const itemDate = new Date(dateString);
        if (timeFrame === "24h") return now.getTime() - itemDate.getTime() < 24 * 60 * 60 * 1000;
        if (timeFrame === "7d") return now.getTime() - itemDate.getTime() < 7 * 24 * 60 * 60 * 1000;
        if (timeFrame === "30d") return now.getTime() - itemDate.getTime() < 30 * 24 * 60 * 60 * 1000;
        return true;
      };

      const filteredOrders = orders.filter((o) => filterByTimeFrame(o.targetDate || new Date()));
      const filteredExpenses = expenses.filter((e) => filterByTimeFrame(e.date));

      const revenue = filteredOrders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
      const totalExp = filteredExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

      const productMap: Record<string, any> = {};
      filteredOrders.forEach((o) => {
        o.items.forEach((item: any) => {
          const name = item.product?.name || "Unknown Item";
          if (!productMap[name]) productMap[name] = { productName: name, quantity: 0, totalPrice: 0 };
          productMap[name].quantity += item.quantity || 0;
          productMap[name].totalPrice += (item.quantity || 0) * (item.priceAtTimeOfOrder || 0);
        });
      });

      const sortedProducts = Object.values(productMap)
        .sort((a, b) => b.totalPrice - a.totalPrice)
        .slice(0, 5);

      setReportData({
        totalRevenue: revenue,
        totalExpenses: totalExp,
        netProfit: revenue - totalExp,
        totalSales: filteredOrders.length,
        topProducts: sortedProducts as never[],
        rawSales: filteredOrders as never[],
      });
    } catch (err) {
      console.error("Report Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [timeFrame, expenses]);

  const exportToCSV = () => {
    if (reportData.rawSales.length === 0) return alert("No data available");
    const headers = ["Date", "Customer", "Product", "Qty", "Total"];
    const rows = reportData.rawSales.map((s: any) => [
      new Date(s.targetDate).toLocaleDateString(),
      s.customerName,
      s.items.map((i: any) => i.product?.name || 'Item').join(' & '),
      s.items.reduce((acc: number, curr: any) => acc + (curr.quantity || 0), 0),
      s.totalAmount,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `mamar_sales_${timeFrame}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && reportData.totalSales === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8 pt-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-border/40">
        <div className="space-y-1">
          <h1 className="text-4xl sm:text-5xl tracking-tight font-black text-foreground font-serif">
            Accounting Hub
          </h1>
          <p className="text-muted-foreground font-sans text-sm font-medium">
            Business intelligence and revenue tracking.
          </p>
        </div>

        <div className="flex bg-muted/30 p-1 rounded-2xl border border-border/40 shadow-sm">
          {["24h", "7d", "30d", "all"].map((t) => (
            <button
              key={t}
              onClick={() => setTimeFrame(t)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                timeFrame === t
                  ? "bg-foreground text-background shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card p-6 rounded-3xl border border-border/40 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2"><TrendingUp className="w-3 h-3 text-primary"/> Gross Revenue</p>
          <h3 className="text-3xl font-black text-foreground mt-4">{formatPHP(reportData.totalRevenue)}</h3>
          <p className="text-[10px] text-muted-foreground font-bold mt-2 uppercase tracking-widest">{reportData.totalSales} Orders Fulfilled</p>
        </div>
        <div className="bg-card p-6 rounded-3xl border border-border/40 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2"><ReceiptText className="w-3 h-3 text-destructive"/> Operating Expenses</p>
          <h3 className="text-3xl font-black text-foreground mt-4">{formatPHP(reportData.totalExpenses)}</h3>
          <p className="text-[10px] text-muted-foreground font-bold mt-2 uppercase tracking-widest">Ingredients & Overhead</p>
        </div>
        <div className="bg-foreground p-6 rounded-3xl shadow-xl flex flex-col justify-between text-background">
          <p className="text-[10px] font-black opacity-70 uppercase tracking-widest flex items-center gap-2"><Wallet className="w-3 h-3"/> Net Profit</p>
          <h3 className="text-4xl font-black mt-4">{formatPHP(reportData.netProfit)}</h3>
          <p className="text-[10px] opacity-70 font-bold mt-2 uppercase tracking-widest">Revenue - Expenses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-card rounded-3xl border border-border/40 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border/40 bg-muted/10">
            <h3 className="text-[11px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" /> Top Performers
            </h3>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-muted-foreground uppercase font-black bg-background border-b border-border/40">
              <tr>
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4 text-center">Volume</th>
                <th className="px-6 py-4 text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 bg-card">
              {reportData.topProducts.map((p: any, i) => (
                <tr key={i} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground text-sm">{p.productName}</td>
                  <td className="px-6 py-4 text-center text-muted-foreground font-black text-sm">{p.quantity}</td>
                  <td className="px-6 py-4 text-right font-black text-primary text-sm">{formatPHP(p.totalPrice)}</td>
                </tr>
              ))}
              {reportData.topProducts.length === 0 && (
                <tr><td colSpan={3} className="text-center py-8 text-muted-foreground text-xs font-bold">No sales data for this period.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-card rounded-3xl p-8 border border-border/40 shadow-sm flex flex-col justify-center min-h-[300px]">
          <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Export Data</h3>
          <p className="text-muted-foreground text-xs mb-8 font-medium">Download current timeframe as CSV for accounting.</p>
          <Button onClick={exportToCSV} className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">
            <Download className="w-4 h-4 mr-2" /> Download Report
          </Button>
        </div>
      </div>
    </div>
  );
}