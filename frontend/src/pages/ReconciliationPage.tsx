import React, { useState, useEffect, useRef, useMemo } from "react";
import { fetchOrders, fetchExpenses } from "@/services/api";
import { formatPHP } from "@/utils/currency";
import { format } from "date-fns";
import { 
  Loader2, 
  Printer, 
  Lock, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useReactToPrint } from "react-to-print";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type TimelineEvent = {
  id: string;
  time: Date;
  type: "INFLOW" | "OUTFLOW";
  description: string;
  amount: number;
};

export default function ReconciliationPage() {
  const [loading, setLoading] = useState(true);
  const [actualCash, setActualCash] = useState<string>("");
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
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

        // Build the unified ledger timeline
        const events: TimelineEvent[] = [
          ...todaysOrders.map((o: any) => ({
            id: `ord-${o._id}`,
            time: new Date(o.updatedAt || o.targetDate),
            type: "INFLOW" as const,
            description: `Order Fulfillment (${o.items.length} items)`,
            amount: o.amountPaid || o.totalAmount || 0,
          })),
          ...todaysExpenses.map((e: any) => ({
            id: `exp-${e._id || Math.random()}`,
            time: new Date(e.date),
            type: "OUTFLOW" as const,
            description: `Expense: ${e.description} (${e.category})`,
            amount: e.amount,
          }))
        ].sort((a, b) => b.time.getTime() - a.time.getTime()); // Sort newest first

        setTimeline(events);

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
  const hasInput = actualCash !== "";
  const isBalanced = discrepancy === 0 && hasInput;

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 min-h-screen animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-2">
          <h1 className="text-5xl sm:text-6xl font-serif font-black text-primary tracking-tighter leading-none">
            End of Day
          </h1>
          <p className="text-muted-foreground font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Register reconciliation for {format(new Date(), "MMMM dd, yyyy")}.
          </p>
        </div>

        <Button
          onClick={() => handlePrint()}
          className="group h-14 pl-6 pr-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-all duration-300 shadow-lg flex items-center gap-4 border-none"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.25em]">Print Z-Report</span>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:-translate-y-1 transition-transform duration-300">
            <Printer className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
        </Button>
      </div>

      {/* KPI Grid Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Cash Inflows", value: formatPHP(metrics.expectedRevenue), icon: TrendingUp, isPrimary: false },
          { label: "Cash Outflows", value: formatPHP(metrics.dailyExpenses), icon: TrendingDown, isPrimary: false },
          { label: "Expected Drawer", value: formatPHP(metrics.netExpectedCash), icon: Wallet, isPrimary: true },
          { 
            label: "Audit Status", 
            value: !hasInput ? "Pending" : isBalanced ? "Balanced" : formatPHP(Math.abs(discrepancy)), 
            icon: Activity, 
            isPrimary: false,
            colorClass: !hasInput ? "text-foreground" : isBalanced ? "text-emerald-500" : "text-destructive"
          },
        ].map((kpi, idx) => (
          <div
            key={idx}
            className="flex flex-col p-6 rounded-xl border border-border/60 bg-card relative overflow-hidden shadow-sm"
          >
            <kpi.icon 
              className={`absolute -right-6 -bottom-6 w-32 h-32 opacity-[0.04] ${kpi.isPrimary ? 'text-primary' : 'text-foreground'}`} 
              aria-hidden="true" 
            />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] relative z-10 flex justify-between">
              {kpi.label}
              {idx === 3 && hasInput && !isBalanced && (
                <span className="text-destructive animate-pulse">{discrepancy > 0 ? 'OVER' : 'SHORT'}</span>
              )}
            </span>
            <span className={`mt-4 text-3xl lg:text-4xl font-black tracking-tighter relative z-10 truncate ${kpi.colorClass || (kpi.isPrimary ? 'text-primary' : 'text-foreground')}`}>
              {kpi.value}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Unified Ledger (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-sm flex flex-col h-full min-h-[500px]">
            <div className="p-6 border-b border-border/40 bg-muted/10">
              <h3 className="text-[11px] font-black text-foreground uppercase tracking-[0.25em] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" /> Today's Ledger
              </h3>
            </div>
            
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader className="bg-muted/5 border-b border-border/40 sticky top-0 z-10">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground h-14 px-6">Time</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground h-14 px-6">Event</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground h-14 px-6 text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/20">
                  {timeline.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-48 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Activity className="w-8 h-8 mb-4 opacity-20" />
                          <span className="text-sm font-semibold tracking-tight">No financial events recorded today.</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    timeline.map((event) => (
                      <TableRow key={event.id} className="border-none hover:bg-muted/10 transition-colors">
                        <TableCell className="py-4 px-6 font-bold text-muted-foreground text-xs align-middle whitespace-nowrap">
                          {format(event.time, "h:mm a")}
                        </TableCell>
                        <TableCell className="py-4 px-6 align-middle">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={`uppercase tracking-widest text-[9px] px-2 py-0.5 border-none ${event.type === 'INFLOW' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                              {event.type}
                            </Badge>
                            <span className="font-bold text-foreground text-sm">{event.description}</span>
                          </div>
                        </TableCell>
                        <TableCell className={`py-4 px-6 text-right font-black text-sm align-middle ${event.type === 'INFLOW' ? 'text-foreground' : 'text-destructive'}`}>
                          {event.type === 'INFLOW' ? '+' : '-'} {formatPHP(event.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Count Vault (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border/40 p-8 shadow-sm flex flex-col h-full relative overflow-hidden">
            
            {/* Background Icon */}
            <Lock className="absolute -right-10 -bottom-10 w-64 h-64 opacity-[0.02] text-foreground pointer-events-none" />

            <div className="flex-1 space-y-8 relative z-10">
              <div>
                <h3 className="text-[11px] font-black text-foreground uppercase tracking-[0.25em] flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-primary" /> The Vault
                </h3>
                <p className="text-xs font-medium text-muted-foreground">
                  Execute physical cash audit. Ensure all denominations are accounted for.
                </p>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <ArrowRight className="w-3 h-3 text-primary" /> Actual Cash Declaration
                </Label>
                
                <div className={`relative flex items-center bg-background border-2 rounded-xl transition-all h-20 px-6 overflow-hidden focus-within:ring-4 ${!hasInput ? 'border-border/40 focus-within:border-primary focus-within:ring-primary/20' : isBalanced ? 'border-emerald-500 focus-within:ring-emerald-500/20' : 'border-destructive focus-within:ring-destructive/20'}`}>
                  <span className={`text-2xl font-black mr-2 transition-colors ${!hasInput ? 'text-muted-foreground' : isBalanced ? 'text-emerald-500' : 'text-destructive'}`}>
                    ₱
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={actualCash}
                    onChange={(e) => setActualCash(e.target.value)}
                    className={`flex-1 w-full bg-transparent border-none text-4xl font-black outline-none focus:outline-none focus:ring-0 p-0 shadow-none placeholder:text-muted/30 h-full [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] transition-colors ${!hasInput ? 'text-foreground' : isBalanced ? 'text-emerald-500' : 'text-destructive'}`}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {hasInput && (
                <div className="animate-in slide-in-from-bottom-4 fade-in duration-300">
                  <div className={`p-5 rounded-xl border flex flex-col gap-3 ${isBalanced ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
                    <div className="flex items-center gap-2">
                      {isBalanced ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                      <p className="font-black text-sm uppercase tracking-widest">
                        {isBalanced ? "Ledger Balanced" : "Discrepancy Detected"}
                      </p>
                    </div>
                    <p className="text-xs font-bold leading-relaxed opacity-90">
                      {isBalanced 
                        ? "Physical count perfectly matches expected system calculations. Safe to close register." 
                        : `Drawer is ${discrepancy > 0 ? 'OVER' : 'SHORT'} by ${formatPHP(Math.abs(discrepancy))}. Review today's ledger to verify expenses and inflows.`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 relative z-10 pt-6 border-t border-border/40">
              <Button 
                disabled={!hasInput} 
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl text-[11px] uppercase tracking-widest shadow-lg transition-all"
              >
                Close Register & Log Day
              </Button>
            </div>
          </div>
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