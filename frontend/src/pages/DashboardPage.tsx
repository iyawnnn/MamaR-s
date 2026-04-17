import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
import { DollarSign, ShoppingBag, TrendingUp, Loader2, Package, Layers, Calendar, Award, ClipboardList, ArrowRight, Plus, PiggyBank, History } from "lucide-react";
import api, { fetchOrders } from "@/services/api";
import { IOrder, IInventoryItem, IExpense } from "@/types";
import { AuthContext } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Peso: React.FC = () => (
  <span className="font-sans font-semibold text-current opacity-90 mr-0.5">₱</span>
);

interface TopProduct {
  name: string;
  sold: number;
  revenue: number;
}

interface DashboardData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalOrders: number;
  totalItemsSold: number;
  averageOrderValue: number;
  recentSales: IOrder[];
  inventory: IInventoryItem[];
  topProducts: TopProduct[];
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<DashboardData>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalOrders: 0,
    totalItemsSold: 0,
    averageOrderValue: 0,
    recentSales: [],
    inventory: [],
    topProducts: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [allOrders, productsRes, expensesRes] = await Promise.all([
          fetchOrders(),
          api.get<{ products: IInventoryItem[] } | IInventoryItem[]>("/products"),
          api.get<IExpense[]>("/expenses"),
        ]);

        const fulfilledOrders = allOrders.filter((o: IOrder) => o.status === 'FULFILLED');
        const allProducts = ('products' in productsRes.data ? productsRes.data.products : productsRes.data) || [];
        const expenses = expensesRes.data || [];

        const totalRev = fulfilledOrders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
        const totalExp = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        
        let totalItems = 0;
        fulfilledOrders.forEach((o) => {
          o.items.forEach(i => totalItems += (i.quantity || 0));
        });
        
        const totalOrds = fulfilledOrders.length;
        const netProfit = totalRev - totalExp;

        const recent = [...fulfilledOrders]
          .sort((a, b) => new Date(b.targetDate || b.createdAt || new Date()).getTime() - new Date(a.targetDate || a.createdAt || new Date()).getTime())
          .slice(0, 4);

        const productPerformance: Record<string, TopProduct> = {};
        fulfilledOrders.forEach((order) => {
          order.items.forEach((item) => {
            const pName = (item.product as any)?.name || "Unknown Item";
            if (!productPerformance[pName]) {
              productPerformance[pName] = { name: pName, sold: 0, revenue: 0 };
            }
            productPerformance[pName].sold += (item.quantity || 0);
            productPerformance[pName].revenue += ((item.quantity || 0) * (item.priceAtTimeOfOrder || 0));
          });
        });

        setData({
          totalRevenue: totalRev,
          totalExpenses: totalExp,
          netProfit: netProfit,
          totalOrders: totalOrds,
          totalItemsSold: totalItems,
          averageOrderValue: totalOrds > 0 ? totalRev / totalOrds : 0,
          recentSales: recent,
          inventory: allProducts,
          topProducts: Object.values(productPerformance)
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 4),
        });
      } catch (error) {
        console.error("Dashboard data fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Configuration for KPI cards to maintain a clean render map
  const kpis = [
    { title: "Revenue", value: data.totalRevenue.toLocaleString(), prefix: <Peso />, sub: "Gross Sales", icon: DollarSign },
    { title: "Orders", value: data.totalOrders, prefix: null, sub: "Total Transac.", icon: ShoppingBag },
    { title: "Units Sold", value: data.totalItemsSold, prefix: null, sub: "Item Volume", icon: Layers },
    { title: "Avg. Sale", value: data.averageOrderValue.toFixed(0), prefix: <Peso />, sub: "Per Customer", icon: TrendingUp },
    { title: "Net Profit", value: data.netProfit.toLocaleString(), prefix: <Peso />, sub: "Revenue - Expenses", icon: PiggyBank },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div className="space-y-1">
          <h1 className="font-serif text-4xl sm:text-5xl font-black text-foreground tracking-tight leading-none">
            Dashboard
          </h1>
          <p className="text-muted-foreground font-sans text-sm font-medium">
            Real-time operational metrics for {new Date().toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
          <Calendar className="w-4 h-4" />
          Live Data
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="rounded-2xl border-none shadow-sm bg-card transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black text-muted-foreground tracking-[0.15em] uppercase">
                {kpi.title}
              </CardTitle>
              <div className="p-2 rounded-xl bg-muted/50 text-foreground">
                <kpi.icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-2xl lg:text-3xl font-black text-foreground tracking-tighter">
                {kpi.prefix}{kpi.value}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-border" />
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  {kpi.sub}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Activity & Top Products */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          
          <Card className="rounded-3xl border-none shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border/40 flex justify-between items-center bg-muted/20">
              <h3 className="font-black text-foreground uppercase text-[11px] tracking-[0.2em]">
                Recent Activity
              </h3>
              <Button variant="link" onClick={() => navigate("/orders")} className="text-[10px] font-black text-primary hover:text-primary/80 uppercase tracking-widest gap-2 p-0 h-auto">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <tbody className="divide-y divide-border/40">
                  {data.recentSales.map((order, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-[10px] text-muted-foreground font-black uppercase whitespace-nowrap">
                        {new Date((order as any).targetDate || (order as any).createdAt || new Date()).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground text-sm">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-[11px] italic truncate max-w-[150px]">
                        {order.items.map((item: any) => item.product?.name || 'Item').join(', ')}
                      </td>
                      <td className="px-6 py-4 font-black text-foreground text-right text-sm whitespace-nowrap">
                        <Peso />{order.totalAmount?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm p-6">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-primary" />
                  <h3 className="font-black text-foreground uppercase text-[11px] tracking-[0.2em]">
                    Top Products
                  </h3>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.topProducts.map((prod, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/40 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="w-10 h-10 shrink-0 flex items-center justify-center bg-foreground text-background rounded-xl text-[11px] font-black shadow-md">
                        #{index + 1}
                      </span>
                      <span className="text-xs font-bold text-foreground truncate">
                        {prod.name}
                      </span>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-[10px] font-black text-muted-foreground">
                        {prod.sold} SOLD
                      </p>
                      <p className="text-[11px] text-foreground font-black">
                        <Peso />{prod.revenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
          </Card>
        </div>

        {/* Right Column: High-Contrast Action Terminal */}
        <div className="flex flex-col h-full min-h-[360px]">
          <div className="bg-foreground rounded-3xl p-8 text-background shadow-xl flex flex-col justify-between h-full">
            <div>
              <h3 className="font-black uppercase text-[11px] tracking-[0.3em] text-muted-foreground flex items-center gap-3 mb-8">
                <ClipboardList className="w-4 h-4 text-primary" /> Core Terminal
              </h3>
              <div className="space-y-4">
                <Button
                  onClick={() => navigate("/orders")}
                  className="w-full py-7 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20"
                >
                  <Plus className="w-4 h-4" /> New Order
                </Button>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/products")}
                    className="h-auto py-5 bg-background/5 hover:bg-background/10 text-background border-border/20 font-black rounded-2xl flex flex-col items-center gap-3 transition-all active:scale-95"
                  >
                    <Package className="w-5 h-5 text-muted-foreground" />
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Inventory</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/stock-history")}
                    className="h-auto py-5 bg-background/5 hover:bg-background/10 text-background border-border/20 font-black rounded-2xl flex flex-col items-center gap-3 transition-all active:scale-95"
                  >
                    <History className="w-5 h-5 text-muted-foreground" />
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Logs</span>
                  </Button>
                </div>
              </div>
            </div>
            <div className="pt-8 mt-4 border-t border-border/20">
              <div className="flex items-center justify-between opacity-60">
                <span className="text-[9px] font-black tracking-widest uppercase italic text-muted-foreground">
                  System Status
                </span>
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;