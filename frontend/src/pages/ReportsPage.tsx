import React, { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api, { fetchOrders, fetchExpenses } from "@/services/api";
import { formatPHP } from "@/utils/currency";
import {
  TrendingUp,
  PieChart,
  Download,
  Loader2,
  Wallet,
  ReceiptText,
  PackageCheck,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    if (reportData.rawSales.length === 0) return alert("No data available to export.");
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
    link.setAttribute("download", `mamar_ledger_${timeFrame}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 min-h-screen">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-2">
          <h1 className="text-5xl sm:text-6xl font-serif font-black text-primary tracking-tighter leading-none">
            Accounting Hub
          </h1>
          <p className="text-muted-foreground font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Business intelligence and revenue tracking.
          </p>
        </div>

        <Button
          onClick={exportToCSV}
          className="group h-14 pl-6 pr-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-all duration-300 shadow-lg flex items-center gap-4 border-none"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.25em]">Export Ledger</span>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:-translate-y-1 transition-transform duration-300">
            <Download className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
        </Button>
      </div>

      {/* KPI Grid Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Gross Revenue", value: formatPHP(reportData.totalRevenue), icon: TrendingUp, isPrimary: false },
          { label: "Operating Expenses", value: formatPHP(reportData.totalExpenses), icon: ReceiptText, isPrimary: false },
          { label: "Net Profit", value: formatPHP(reportData.netProfit), icon: Wallet, isPrimary: true },
          { label: "Total Volume", value: reportData.totalSales.toString().padStart(2, "0"), icon: PackageCheck, isPrimary: false },
        ].map((kpi, idx) => (
          <div
            key={idx}
            className="flex flex-col p-6 rounded-xl border border-border/60 bg-card relative overflow-hidden shadow-sm"
          >
            <kpi.icon 
              className={`absolute -right-6 -bottom-6 w-32 h-32 opacity-[0.04] ${kpi.isPrimary ? 'text-primary' : 'text-foreground'}`} 
              aria-hidden="true" 
            />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] relative z-10">
              {kpi.label}
            </span>
            {/* Reduced from text-5xl to text-2xl lg:text-3xl to accommodate large financial figures safely */}
            <span className={`mt-4 text-2xl lg:text-3xl font-black tracking-tighter relative z-10 truncate ${kpi.isPrimary ? 'text-primary' : 'text-foreground'}`}>
              {kpi.value}
            </span>
          </div>
        ))}
      </div>

      {/* Timeframe Controls & Data Section */}
      <div className="space-y-6">
        
        {/* Unified Tab-Style Timeframe Selector */}
        <div className="bg-muted/40 p-1.5 rounded-xl w-fit h-auto flex flex-wrap gap-2 border border-border/40">
          {[
            { id: "24h", label: "Last 24 Hours" },
            { id: "7d", label: "Last 7 Days" },
            { id: "30d", label: "Last 30 Days" },
            { id: "all", label: "All-Time Records" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeFrame(t.id)}
              className={`rounded-lg px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all border ${
                timeFrame === t.id
                  ? "bg-card text-foreground shadow-sm border-border/40"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Top Performers Table */}
        <div className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border/40 bg-muted/10">
            <h3 className="text-[11px] font-black text-foreground uppercase tracking-[0.25em] flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" /> Top Performers by Revenue
            </h3>
          </div>
          
          <Table>
            <TableHeader className="bg-muted/5 border-b border-border/40">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground h-14 px-6">Item Designation</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground h-14 px-6 text-center">Volume Moved</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground h-14 px-6 text-right">Revenue Generated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/20">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <span className="text-sm font-semibold tracking-tight animate-pulse">Compiling ledger data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : reportData.topProducts.length ? (
                reportData.topProducts.map((p: any, i) => (
                  <TableRow key={i} className="border-none hover:bg-muted/10 transition-colors">
                    <TableCell className="py-4 px-6 font-bold text-foreground text-sm align-middle">
                      {p.productName}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-center text-muted-foreground font-black text-sm align-middle">
                      {p.quantity}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right font-black text-foreground text-sm align-middle">
                      {formatPHP(p.totalPrice)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <LayoutGrid className="w-8 h-8 mb-4 opacity-20" />
                      <span className="text-sm font-semibold tracking-tight">No sales data recorded for this period.</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}