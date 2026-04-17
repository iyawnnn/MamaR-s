import React, { useState, useEffect, useRef } from "react";
import { fetchOrders, fetchExpenses } from "@/services/api";
import { formatPHP } from "@/utils/currency";
import { format } from "date-fns";
import { Loader2, Calculator, CheckCircle, AlertTriangle, Printer, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useReactToPrint } from "react-to-print";

export default function ReconciliationPage() {
  const [loading, setLoading] = useState(true);
  const [actualCash, setActualCash] = useState<string>("");
  const printRef = useRef<HTMLDivElement>(null);
  
  const [metrics, setMetrics] = useState({
    expectedRevenue: 0,
    dailyExpenses: 0,
    netExpectedCash: 0,
    fulfilledCount: 0,
  });

  useEffect(() => {
    const loadDailyData = async () => {
      try {
        const [orders, expenses] = await Promise.all([
          fetchOrders('FULFILLED'),
          fetchExpenses()
        ]);

        const today = new Date();
        const isToday = (dateString: string | Date) => {
          const d = new Date(dateString);
          return d.getDate() === today.getDate() &&
                 d.getMonth() === today.getMonth() &&
                 d.getFullYear() === today.getFullYear();
        };

        const todaysOrders = orders.filter((o: any) => isToday(o.updatedAt || o.targetDate));
        const todaysExpenses = (expenses as any[]).filter(e => isToday(e.date));

        const expectedRev = todaysOrders.reduce((acc, curr: any) => acc + (curr.amountPaid || curr.totalAmount || 0), 0);
        const dailyExp = todaysExpenses.reduce((acc, curr: any) => acc + (curr.amount || 0), 0);

        setMetrics({
          expectedRevenue: expectedRev,
          dailyExpenses: dailyExp,
          netExpectedCash: expectedRev - dailyExp,
          fulfilledCount: todaysOrders.length,
        });
      } catch (error) {
        console.error("Failed to load EOD data", error);
      } finally {
        setLoading(false);
      }
    };

    loadDailyData();
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const actualCashNum = Number(actualCash) || 0;
  const discrepancy = actualCashNum - metrics.netExpectedCash;
  const isBalanced = discrepancy === 0 && actualCash !== "";

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div className="space-y-1">
          <h1 className="text-4xl sm:text-5xl tracking-tight font-black text-foreground" style={{ fontFamily: '"Instrument Serif", serif' }}>
            End of Day
          </h1>
          <p className="text-muted-foreground font-sans text-sm font-medium">
            Daily register reconciliation for {format(new Date(), "MMMM dd, yyyy")}.
          </p>
        </div>
        <Button onClick={() => handlePrint()} variant="outline" className="font-black rounded-xl uppercase tracking-widest text-[10px] gap-2 px-6 border-border/40 hover:bg-muted/20">
          <Printer className="w-4 h-4" /> Print Z-Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Step 1: System Calculations */}
        <div className="bg-card rounded-3xl border border-border/40 p-8 shadow-sm space-y-6">
          <h3 className="text-[11px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-2 border-b border-border/40 pb-4">
            <Calculator className="w-4 h-4 text-primary" /> Step 1: System Totals
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted/10 rounded-xl border border-border/40">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Today's Revenue</span>
              <span className="text-lg font-black text-foreground">{formatPHP(metrics.expectedRevenue)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted/10 rounded-xl border border-border/40">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Today's Expenses</span>
              <span className="text-lg font-black text-destructive">- {formatPHP(metrics.dailyExpenses)}</span>
            </div>
            <div className="flex justify-between items-center p-5 bg-foreground text-background rounded-xl shadow-md">
              <span className="text-xs font-bold opacity-80 uppercase tracking-widest">Expected Register Cash</span>
              <span className="text-2xl font-black">{formatPHP(metrics.netExpectedCash)}</span>
            </div>
          </div>
        </div>

        {/* Step 2: Physical Count */}
        <div className="bg-card rounded-3xl border border-border/40 p-8 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-[11px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-2 border-b border-border/40 pb-4 mb-6">
              <Lock className="w-4 h-4 text-primary" /> Step 2: Physical Count
            </h3>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actual Cash in Drawer</Label>
              <Input 
                type="number" 
                value={actualCash}
                onChange={(e) => setActualCash(e.target.value)}
                placeholder="Enter physical cash amount..." 
                className="h-16 text-2xl px-4 bg-muted/20 border-border/40 font-black focus:border-primary" 
              />
            </div>

            {actualCash !== "" && (
              <div className={`mt-6 p-4 rounded-xl border flex items-start gap-3 ${isBalanced ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
                {isBalanced ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />}
                <div>
                  <p className="font-black text-sm uppercase tracking-widest">{isBalanced ? "Register is Balanced" : "Discrepancy Detected"}</p>
                  <p className="text-xs font-bold mt-1">
                    {isBalanced 
                      ? "The physical count matches the system expectations perfectly." 
                      : `You are ${discrepancy > 0 ? 'over' : 'short'} by ${formatPHP(Math.abs(discrepancy))}.`}
                  </p>
                </div>
              </div>
            )}
          </div>

          <Button 
            disabled={actualCash === ""} 
            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
          >
            Close Register & Log Day
          </Button>
        </div>
      </div>

      {/* Hidden Print Template */}
      <div className="hidden">
        <div ref={printRef} className="w-[80mm] p-4 bg-white text-black font-mono text-sm print:block print:w-full print:m-0 print:p-2">
          <div className="text-center mb-4">
            <h1 className="font-serif text-2xl font-black uppercase tracking-tighter">Mama R's</h1>
            <p className="text-xs uppercase tracking-widest mt-1">End of Day Report</p>
            <p className="text-[10px] mt-1 border-b border-dashed border-black pb-4">
              {format(new Date(), "MMM dd, yyyy • h:mm a")}
            </p>
          </div>
          <div className="space-y-2 border-b border-dashed border-black pb-4 mb-4">
            <div className="flex justify-between"><span>Orders Fulfilled:</span><span className="font-bold">{metrics.fulfilledCount}</span></div>
            <div className="flex justify-between"><span>Gross Revenue:</span><span className="font-bold">{formatPHP(metrics.expectedRevenue)}</span></div>
            <div className="flex justify-between"><span>Expenses Logged:</span><span className="font-bold">- {formatPHP(metrics.dailyExpenses)}</span></div>
            <div className="flex justify-between pt-2 border-t border-dashed border-black">
              <span>Expected Cash:</span><span className="font-bold">{formatPHP(metrics.netExpectedCash)}</span>
            </div>
          </div>
          <div className="space-y-2 border-b border-dashed border-black pb-4 mb-4">
            <div className="flex justify-between"><span>Actual Cash:</span><span className="font-bold">{formatPHP(actualCashNum)}</span></div>
            <div className="flex justify-between"><span>Discrepancy:</span><span className="font-bold">{formatPHP(discrepancy)}</span></div>
          </div>
          <div className="mt-8 pt-4 text-center">
            <div className="border-b border-black w-3/4 mx-auto mb-1"></div>
            <p className="text-[10px] uppercase tracking-widest">Manager Signature</p>
          </div>
        </div>
      </div>

    </div>
  );
}