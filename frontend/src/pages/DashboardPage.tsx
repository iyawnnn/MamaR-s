// frontend/src/pages/DashboardPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Loader2,
  Package,
  Layers,
  Calendar,
  Award,
  ClipboardList,
  History,
  ArrowRight,
  Plus,
  PiggyBank,
  LucideIcon
} from "lucide-react";
import api from "../services/api";
import { ISale, IInventoryItem, IExpense } from "../types";

const Peso: React.FC = () => (
  <span className="font-sans font-semibold text-current opacity-90 mr-0.5">
    ₱
  </span>
);

interface StatsCardProps {
  title: string;
  value: React.ReactNode | number | string;
  subtext?: string;
  icon: LucideIcon;
  type?: "default" | "success" | "warning" | "info";
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtext, icon: Icon, type = "default" }) => {
  const styles = {
    default: {
      bg: "bg-white",
      iconBg: "bg-stone-100",
      iconColor: "text-stone-600",
      border: "border-stone-200",
    },
    success: {
      bg: "bg-white",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      border: "border-stone-200",
    },
    warning: {
      bg: "bg-white",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      border: "border-stone-200",
    },
    info: {
      bg: "bg-white",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      border: "border-stone-200",
    },
  };
  const style = styles[type] || styles.default;

  return (
    <div
      className={`${style.bg} p-5 lg:p-6 rounded-2xl border ${style.border} shadow-sm h-full transition-all duration-300 hover:shadow-md hover:-translate-y-1`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black text-stone-400 tracking-[0.15em] uppercase truncate">
            {title}
          </p>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-stone-800 mt-2 tracking-tighter truncate">
            {value}
          </h3>
          {subtext && (
            <div className="text-[10px] text-stone-500 font-bold mt-3 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-200" />
              {subtext}
            </div>
          )}
        </div>
        <div
          className={`p-2.5 lg:p-3 rounded-xl flex-shrink-0 ${style.iconBg} ${style.iconColor}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

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
  recentSales: ISale[];
  inventory: IInventoryItem[];
  topProducts: TopProduct[];
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
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
        const [salesRes, productsRes, expensesRes] = await Promise.all([
          api.get<{ sales: ISale[] } | ISale[]>("/sales"),
          api.get<{ products: IInventoryItem[] } | IInventoryItem[]>("/products"),
          api.get<IExpense[]>("/expenses"),
        ]);

        const sales = ('sales' in salesRes.data ? salesRes.data.sales : salesRes.data) || [];
        const allProducts = ('products' in productsRes.data ? productsRes.data.products : productsRes.data) || [];
        const expenses = expensesRes.data || [];

        const totalRev = sales.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
        const totalExp = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        const totalItems = sales.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
        const totalOrds = sales.length;
        const netProfit = totalRev - totalExp;

        const recent = [...sales]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 4);

        const productPerformance: Record<string, TopProduct> = {};
        sales.forEach((sale) => {
          const pName = sale.productName || "Unknown Item";
          if (!productPerformance[pName]) {
            productPerformance[pName] = { name: pName, sold: 0, revenue: 0 };
          }
          productPerformance[pName].sold += sale.quantity || 0;
          productPerformance[pName].revenue += sale.totalPrice || 0;
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
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="text-left">
          <h2 className="font-serif text-5xl text-foreground tracking-tight">
            Dashboard
          </h2>
          <p className="text-stone-500 font-medium text-sm mt-1">
            Real-time bakery performance metrics.
          </p>
        </div>
        <div className="inline-flex items-center gap-3 text-[10px] font-black bg-white border border-stone-200 text-stone-500 px-5 py-3 rounded-xl shadow-sm tracking-[0.15em] uppercase">
          <Calendar className="w-4 h-4 text-amber-500" />
          {new Date().toLocaleDateString("en-PH", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 sm:gap-6">
        <StatsCard
          title="Revenue"
          value={<><Peso />{data.totalRevenue.toLocaleString()}</>}
          subtext="Gross Sales"
          icon={DollarSign}
          type="success"
        />
        <StatsCard
          title="Orders"
          value={data.totalOrders}
          subtext="Total Transac."
          icon={ShoppingBag}
          type="warning"
        />
        <StatsCard
          title="Units Sold"
          value={data.totalItemsSold}
          subtext="Item Volume"
          icon={Layers}
          type="info"
        />
        <StatsCard
          title="Avg. Sale"
          value={<><Peso />{data.averageOrderValue.toFixed(0)}</>}
          subtext="Per Customer"
          icon={TrendingUp}
          type="default"
        />
        <StatsCard
          title="Net Profit"
          value={<><Peso />{data.netProfit.toLocaleString()}</>}
          subtext="Revenue - Expenses"
          icon={PiggyBank}
          type="success"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        <div className="xl:col-span-2 flex flex-col min-w-0">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/40">
              <h3 className="font-black text-stone-800 uppercase text-[11px] tracking-[0.2em]">
                Recent Activity
              </h3>
              <button
                onClick={() => navigate("/sales")}
                className="text-[10px] font-black text-amber-600 hover:text-amber-700 uppercase flex items-center gap-2 transition-all cursor-pointer"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <tbody className="divide-y divide-stone-50">
                  {data.recentSales.map((sale, i) => (
                    <tr key={i} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-5 text-[10px] text-stone-400 font-black uppercase whitespace-nowrap">
                        {new Date(sale.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-5 font-bold text-stone-800 text-xs sm:text-sm">
                        {sale.customerName}
                      </td>
                      <td className="px-6 py-5 text-stone-500 text-[11px] italic truncate max-w-[120px] sm:max-w-none">
                        {sale.productName}
                      </td>
                      <td className="px-6 py-5 font-black text-emerald-600 text-right text-xs sm:text-sm whitespace-nowrap">
                        <Peso />{sale.totalPrice?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-stone-900 rounded-2xl p-8 text-white shadow-xl flex flex-col justify-between h-full min-h-[320px]">
            <div>
              <h3 className="font-black uppercase text-[11px] tracking-[0.3em] text-stone-500 flex items-center gap-3 mb-8">
                <ClipboardList className="w-4 h-4 text-amber-500" /> Terminal
              </h3>
              <div className="space-y-4">
                <button
                  onClick={() => navigate("/sales")}
                  className="w-full py-5 bg-amber-500 hover:bg-amber-400 text-stone-900 font-black rounded-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> New Sale Transaction
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => navigate("/products")}
                    className="py-5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-black rounded-xl flex flex-col items-center gap-3 transition-all active:scale-95 border border-stone-700/50 cursor-pointer"
                  >
                    <Package className="w-5 h-5 text-stone-400" />
                    <span className="text-[9px] uppercase tracking-widest">Inventory</span>
                  </button>
                  <button
                    onClick={() => navigate("/stock-history")}
                    className="py-5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-black rounded-xl flex flex-col items-center gap-3 transition-all active:scale-95 border border-stone-700/50 cursor-pointer"
                  >
                    <History className="w-5 h-5 text-stone-400" />
                    <span className="text-[9px] uppercase tracking-widest">Logs</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="pt-8 mt-4 border-t border-stone-800/50">
              <div className="flex items-center justify-between opacity-40">
                <span className="text-[9px] font-black tracking-widest uppercase italic">
                  Operational Status
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-3">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 h-full">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-50">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-stone-800 uppercase text-[11px] tracking-[0.2em]">
                  Top Products
                </h3>
              </div>
              <button
                onClick={() => navigate("/reports")}
                className="text-[10px] font-black text-stone-400 hover:text-stone-800 uppercase tracking-widest cursor-pointer"
              >
                Insights
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4 sm:gap-6">
              {data.topProducts.map((prod, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-5 rounded-2xl bg-stone-50 border border-stone-100 hover:border-amber-200 transition-all group cursor-default"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-stone-900 text-white rounded-xl text-[11px] font-black shadow-lg shadow-stone-900/10">
                      #{index + 1}
                    </span>
                    <span className="text-xs font-bold text-stone-700 truncate">
                      {prod.name}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-[10px] font-black text-stone-900">
                      {prod.sold} SOLD
                    </p>
                    <p className="text-[10px] text-emerald-600 font-black">
                      <Peso />{prod.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;