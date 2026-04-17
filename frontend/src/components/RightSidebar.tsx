import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  AlertCircle,
  TrendingUp,
  Package,
  Wallet,
  Receipt,
  CheckCircle2,
  Plus,
  ArrowDownToLine
} from "lucide-react";

const RightSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "gcash">("cash");

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isSalesPage = location.pathname === "/sales";
  const isToday = selectedDate?.toDateString() === new Date().toDateString();

  // --- ORDER LOGGER VIEW (Exclusive to /sales) ---
  if (isSalesPage) {
    return (
      <aside className="flex h-full w-full flex-col bg-muted/5 text-foreground p-8 no-scrollbar">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border/40">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <Receipt className="w-5 h-5" aria-hidden="true" />
          </div>
          <h2 className="font-serif text-2xl font-black tracking-tight text-foreground">
            Log Order
          </h2>
        </div>

        <div className="flex-1 flex flex-col gap-8">
          <div className="flex flex-col items-center justify-center text-center py-6">
             <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
               Transaction Total
             </p>
             <h3 className="font-serif text-6xl font-black text-foreground tracking-tighter">
               ₱ 0.00
             </h3>
          </div>

          <div className="space-y-4">
             <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
               Payment Method
             </p>
             <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant={paymentMethod === "cash" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("cash")}
                  className={`h-14 rounded-xl font-bold transition-all ${paymentMethod === "cash" ? "bg-primary text-primary-foreground" : "bg-transparent border-border/50 text-muted-foreground hover:bg-muted/50"}`}
                >
                  <Wallet className="mr-2 w-4 h-4" aria-hidden="true" /> Cash
                </Button>
                <Button 
                  variant={paymentMethod === "gcash" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("gcash")}
                  className={`h-14 rounded-xl font-bold transition-all ${paymentMethod === "gcash" ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-transparent border-border/50 text-muted-foreground hover:bg-muted/50"}`}
                >
                  <span className="font-black mr-2">₱</span> GCash
                </Button>
             </div>
          </div>
        </div>

        <div className="shrink-0 pt-6">
          <Button className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all hover:bg-primary/90">
            <CheckCircle2 className="mr-2 w-5 h-5" aria-hidden="true" />
            Save Transaction
          </Button>
        </div>
      </aside>
    );
  }

  // --- COMMAND CONTEXT VIEW (Dashboard & Standard Pages) ---
  return (
    <aside className="flex h-full w-full flex-col bg-background text-foreground p-8 overflow-y-auto no-scrollbar">
      
      {/* Minimal Temporal Anchor */}
      <div className="flex flex-col mb-8 shrink-0">
         <h2 className="font-serif text-4xl font-black text-foreground tracking-tight">
           {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
         </h2>
         <p className="font-sans text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">
           {time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
         </p>
      </div>

      {/* Flat Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-8 shrink-0">
        <Button variant="secondary" onClick={() => navigate('/expenses')} className="h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-muted/30 hover:bg-muted/60 text-foreground">
          <ArrowDownToLine className="w-3.5 h-3.5 mr-2" aria-hidden="true" /> Expense
        </Button>
        <Button variant="secondary" onClick={() => navigate('/products')} className="h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-muted/30 hover:bg-muted/60 text-foreground">
          <Plus className="w-3.5 h-3.5 mr-2" aria-hidden="true" /> Product
        </Button>
      </div>

      {/* Completely Flat Calendar */}
      <div className="mb-8 shrink-0 w-full flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="w-full"
          classNames={{
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-black",
            day_today: "bg-muted text-foreground font-black",
          }}
        />
      </div>

      {/* Dynamic Context Feed */}
      <div className="flex-1 min-h-0">
        <h3 className="font-serif text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">
          {isToday ? "Live Alerts" : `Snapshot: ${selectedDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
        </h3>

        {isToday ? (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-background border border-border/50 shadow-sm flex gap-3 cursor-pointer group hover:border-amber-500/50 transition-colors">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-sans text-xs font-bold text-foreground group-hover:text-amber-600 transition-colors">Inventory Warning</p>
                <p className="font-sans text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Croissants (Almond) below threshold (12 units).
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 animate-in slide-in-from-right-4 duration-300">
            <div className="p-4 rounded-2xl bg-background border border-border/50 shadow-sm flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <TrendingUp className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                 <p className="font-sans text-xs font-bold text-muted-foreground uppercase tracking-widest">Revenue</p>
               </div>
               <p className="font-sans text-sm font-black">₱ 12,150.00</p>
            </div>
            <div className="p-4 rounded-2xl bg-background border border-border/50 shadow-sm flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <Package className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                 <p className="font-sans text-xs font-bold text-muted-foreground uppercase tracking-widest">Units Sold</p>
               </div>
               <p className="font-sans text-sm font-black">184</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default RightSidebar;