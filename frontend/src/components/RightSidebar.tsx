import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Plus,
  ReceiptText,
  Loader2,
  PackagePlus,
  CheckSquare,
} from "lucide-react";
import api, { fetchOrders } from "@/services/api";

export default function RightSidebar() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  const [loading, setLoading] = useState(true);
  const [pulseMetrics, setPulseMetrics] = useState({
    pendingToday: 0,
    lowStockItems: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchPulseData = async () => {
      try {
        const [orders, productsRes] = await Promise.all([
          fetchOrders("all"),
          api.get("/products"),
        ]);

        const today = new Date();
        const isToday = (dateString: string | Date) => {
          const d = new Date(dateString);
          return (
            d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear()
          );
        };

        const dueToday = orders.filter(
          (o: any) =>
            isToday(o.targetDate) &&
            o.status !== "FULFILLED" &&
            o.status !== "CANCELLED",
        );

        const products = productsRes.data.products || productsRes.data || [];
        let lowStockCount = 0;
        products.forEach((p: any) => {
          if (p.hasVariants) {
            p.variants.forEach((v: any) => {
              if (v.stock <= (v.lowStockThreshold || p.lowStockThreshold || 5))
                lowStockCount++;
            });
          } else {
            if (p.stock <= (p.lowStockThreshold || 5)) lowStockCount++;
          }
        });

        setPulseMetrics({
          pendingToday: dueToday.length,
          lowStockItems: lowStockCount,
        });
      } catch (error) {
        console.error("Failed to load pulse metrics", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPulseData();
    const interval = setInterval(fetchPulseData, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    // Added pb-12 here and a spacer at the bottom to guarantee scroll margin on laptops
    <aside className="flex h-full w-full flex-col bg-transparent text-foreground p-8 pb-12 overflow-y-auto no-scrollbar border-l border-border/40">
      {/* 1. Temporal Anchor (Clean Sans-Serif) */}
      <div className="flex flex-col mb-8 shrink-0">
        <h2 className="font-serif text-5xl font-black text-foreground tracking-tighter">
          {time.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </h2>
        <p className="font-sans text-[10px] font-black text-primary uppercase tracking-widest mt-2">
          {time.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* 2. Calendar (Brand Red Highlights) */}
      <div className="mb-8 shrink-0 w-full flex justify-center bg-muted/30 p-2 rounded-3xl border border-border/40">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="w-full bg-transparent"
          classNames={{
            day_selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-black rounded-xl shadow-md shadow-primary/20",
            day_today: "bg-primary/10 text-primary font-black rounded-xl",
            head_cell:
              "text-[10px] font-black uppercase tracking-widest text-muted-foreground",
            cell: "text-sm font-medium",
            nav_button: "hover:bg-muted/50 rounded-lg transition-colors",
          }}
        />
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-8">
        {/* 3. Quick Actions - Minimalist Command Rows */}
        <div className="shrink-0 mb-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 px-2">
            Actions
          </h3>
          <div className="flex flex-col gap-0.5">
            <Button
              variant="ghost"
              onClick={() => navigate("/orders")}
              className="w-full justify-between h-11 px-3 rounded-lg hover:bg-muted/50 text-foreground transition-all group"
            >
              <div className="flex items-center gap-3">
                <Plus
                  className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium tracking-tight">
                  New Pre-Order
                </span>
              </div>
              <span className="text-muted-foreground/30 group-hover:text-foreground/50 transition-colors opacity-0 group-hover:opacity-100">
                →
              </span>
            </Button>

            <Button
              variant="ghost"
              onClick={() => navigate("/inventory")}
              className="w-full justify-between h-11 px-3 rounded-lg hover:bg-muted/50 text-foreground transition-all group"
            >
              <div className="flex items-center gap-3">
                <PackagePlus
                  className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium tracking-tight">
                  Quick Restock
                </span>
              </div>
              <span className="text-muted-foreground/30 group-hover:text-foreground/50 transition-colors opacity-0 group-hover:opacity-100">
                →
              </span>
            </Button>

            <Button
              variant="ghost"
              onClick={() => navigate("/expenses")}
              className="w-full justify-between h-11 px-3 rounded-lg hover:bg-muted/50 text-foreground transition-all group"
            >
              <div className="flex items-center gap-3">
                <ReceiptText
                  className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium tracking-tight">
                  Log Expense
                </span>
              </div>
              <span className="text-muted-foreground/30 group-hover:text-foreground/50 transition-colors opacity-0 group-hover:opacity-100">
                →
              </span>
            </Button>
          </div>
        </div>

        {/* 4. System Pulse - Stacked closer to Actions */}
        <div className="shrink-0">
          <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Pulse
            </h3>
            {loading && (
              <Loader2 className="w-3 h-3 animate-spin text-primary/60" />
            )}
          </div>

          <div className="flex flex-col gap-0.5">
            {/* Metric Row: Due Today */}
            <div
              onClick={() => navigate("/orders")}
              className="group flex items-center justify-between h-12 px-3 rounded-lg hover:bg-muted/50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="relative flex h-2 w-2 items-center justify-center">
                  {pulseMetrics.pendingToday > 0 ? (
                    <>
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                    </>
                  ) : (
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                  )}
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors tracking-tight">
                  Due Today
                </span>
              </div>
              <span className="text-base font-semibold tracking-tight text-foreground">
                {pulseMetrics.pendingToday}
              </span>
            </div>

            {/* Metric Row: Low Stock */}
            <div
              onClick={() => navigate("/inventory")}
              className="group flex items-center justify-between h-12 px-3 rounded-lg hover:bg-muted/50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="relative flex h-2 w-2 items-center justify-center">
                  {pulseMetrics.lowStockItems > 0 ? (
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-destructive" />
                  ) : (
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                  )}
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors tracking-tight">
                  Low Stock
                </span>
              </div>
              <span className="text-base font-semibold tracking-tight text-foreground">
                {pulseMetrics.lowStockItems}
              </span>
            </div>
          </div>
        </div>

        <div className="h-4 shrink-0 pointer-events-none" />
      </div>
    </aside>
  );
}
