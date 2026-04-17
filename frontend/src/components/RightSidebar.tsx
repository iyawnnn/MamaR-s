import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Plus,
  ReceiptText,
  ShoppingBag,
  AlertTriangle,
  Loader2
} from "lucide-react";
import api, { fetchOrders } from "@/services/api";

export default function RightSidebar() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
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
          fetchOrders('all'),
          api.get("/products")
        ]);

        const today = new Date();
        const isToday = (dateString: string | Date) => {
          const d = new Date(dateString);
          return d.getDate() === today.getDate() &&
                 d.getMonth() === today.getMonth() &&
                 d.getFullYear() === today.getFullYear();
        };

        const dueToday = orders.filter((o: any) => 
          isToday(o.targetDate) && o.status !== 'FULFILLED' && o.status !== 'CANCELLED'
        );

        const products = productsRes.data.products || productsRes.data || [];
        let lowStockCount = 0;
        products.forEach((p: any) => {
          if (p.hasVariants) {
            p.variants.forEach((v: any) => {
              if (v.stock <= (v.lowStockThreshold || p.lowStockThreshold || 5)) lowStockCount++;
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
    <aside className="flex h-full w-full flex-col bg-background text-foreground p-8 pb-12 overflow-y-auto no-scrollbar border-l border-border/40">
      
      {/* 1. Temporal Anchor (Clean Sans-Serif) */}
      <div className="flex flex-col mb-8 shrink-0">
         <h2 className="font-serif text-5xl font-black text-foreground tracking-tighter">
           {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
         </h2>
         <p className="font-sans text-[10px] font-black text-primary uppercase tracking-widest mt-2">
           {time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
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
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-black rounded-xl shadow-md shadow-primary/20",
            day_today: "bg-primary/10 text-primary font-black rounded-xl",
            head_cell: "text-[10px] font-black uppercase tracking-widest text-muted-foreground",
            cell: "text-sm font-medium",
            nav_button: "hover:bg-muted/50 rounded-lg transition-colors",
          }}
        />
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-8">
        
        {/* 3. Action Pills (Side-by-Side Grid) */}
        <div className="shrink-0">
          <h3 className="font-sans text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => navigate('/orders')} 
              className="h-14 rounded-2xl flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" aria-hidden="true" /> 
              Pre-Order
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/reports')} 
              className="h-14 rounded-2xl flex items-center justify-center gap-2 bg-muted/20 border-border/40 hover:bg-muted/50 text-foreground transition-all font-black uppercase tracking-widest text-[10px]"
            >
              <ReceiptText className="w-4 h-4 text-muted-foreground" aria-hidden="true" /> 
              Expense
            </Button>
          </div>
        </div>

        {/* 4. Live System Pulse (Side-by-Side Grid) */}
        <div className="shrink-0">
           <h3 className="font-sans text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
            System Pulse
            {loading && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Orders Due Today */}
            <div 
              onClick={() => navigate('/orders')}
              className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between min-h-[100px] ${
                pulseMetrics.pendingToday > 0 
                  ? 'bg-primary/5 border-primary/20 hover:border-primary/40' 
                  : 'bg-muted/20 border-border/40 hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShoppingBag className={`w-3.5 h-3.5 ${pulseMetrics.pendingToday > 0 ? 'text-primary' : ''}`} />
                <span className="font-bold text-[9px] uppercase tracking-widest">Due Today</span>
              </div>
              <span className={`font-black text-3xl tracking-tighter ${pulseMetrics.pendingToday > 0 ? 'text-primary animate-pulse' : 'text-foreground'}`}>
                {pulseMetrics.pendingToday}
              </span>
            </div>

            {/* Low Stock Alert */}
            <div 
              onClick={() => navigate('/inventory')}
              className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between min-h-[100px] ${
                pulseMetrics.lowStockItems > 0 
                  ? 'bg-destructive/5 border-destructive/20 hover:border-destructive/40' 
                  : 'bg-muted/20 border-border/40 hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertTriangle className={`w-3.5 h-3.5 ${pulseMetrics.lowStockItems > 0 ? 'text-destructive' : ''}`} />
                <span className="font-bold text-[9px] uppercase tracking-widest">Low Stock</span>
              </div>
              <span className={`font-black text-3xl tracking-tighter ${pulseMetrics.lowStockItems > 0 ? 'text-destructive' : 'text-foreground'}`}>
                {pulseMetrics.lowStockItems}
              </span>
            </div>
          </div>
        </div>

        {/* Scroll Margin Spacer to ensure it breathes on 1440px screens */}
        <div className="h-4 shrink-0 pointer-events-none" />
      </div>
    </aside>
  );
}