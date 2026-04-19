import React, { useState, useEffect, useMemo } from "react";
import api from "@/services/api";
import { format } from "date-fns";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { 
  History, 
  Loader2, 
  ArrowRight, 
  ArrowDown, 
  ArrowUp,
  Activity,
  PackagePlus,
  PackageMinus,
  Search
} from "lucide-react";
import { IStockLog } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const columnHelper = createColumnHelper<IStockLog>();

export default function StockHistoryPage() {
  const [logs, setLogs] = useState<IStockLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get("/stock-logs");
        setLogs(res.data || []);
      } catch (err) {
        console.error("Failed to fetch stock logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const stats = useMemo(() => {
    const todayStr = new Date().toDateString();
    let todaysEvents = 0;
    let fulfillments = 0;
    let restocks = 0;

    logs.forEach((log) => {
      if (new Date(log.date).toDateString() === todayStr) {
        todaysEvents++;
      }
      if (log.changeType === "Fulfillment") {
        fulfillments++;
      }
      if (log.changeType === "Restock" || log.changeType === "Manual") {
        restocks++;
      }
    });

    return {
      total: logs.length,
      todaysEvents,
      fulfillments,
      restocks,
    };
  }, [logs]);

  const columns = useMemo(() => [
    columnHelper.accessor("date", {
      header: "Timestamp",
      cell: (info) => (
        <div className="font-black text-muted-foreground text-[10px] uppercase tracking-widest">
          {format(new Date(info.getValue()), "MMM dd, yyyy • h:mm a")}
        </div>
      ),
    }),
    columnHelper.accessor("productName", {
      header: "Item Designation",
      cell: (info) => (
        <div className="font-bold text-foreground text-sm">
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor("changeType", {
      header: "Event Trigger",
      cell: (info) => {
        const type = info.getValue();
        let badgeStyle = "bg-muted/50 text-muted-foreground border-border/40";
        
        if (type === "Fulfillment") {
          badgeStyle = "bg-primary/10 text-primary border-primary/20";
        } else if (type === "Restock" || type === "Manual") {
          badgeStyle = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
        }
        
        return (
          <Badge variant="outline" className={`uppercase tracking-widest text-[9px] font-black px-2 py-0.5 ${badgeStyle}`}>
            {type}
          </Badge>
        );
      },
    }),
    columnHelper.display({
      id: "movement",
      header: () => <div className="text-right">Stock Movement</div>,
      cell: (info) => {
        const row = info.row.original;
        const isAddition = row.changeAmount > 0;
        const isNeutral = row.changeAmount === 0;
        
        return (
          <div className="flex items-center justify-end gap-3">
            <span className="text-muted-foreground font-bold text-sm">{row.previousStock}</span>
            <ArrowRight className="w-3 h-3 text-muted-foreground/50" />
            <span className="text-foreground font-black text-sm">{row.newStock}</span>
            <span className={`flex items-center text-[10px] font-black ml-2 w-12 justify-end tracking-widest ${isNeutral ? 'text-muted-foreground' : isAddition ? 'text-emerald-500' : 'text-destructive'}`}>
              {isNeutral ? null : isAddition ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
              {isNeutral ? "N/A" : Math.abs(row.changeAmount)}
            </span>
          </div>
        );
      },
    }),
  ], []);

  const table = useReactTable({
    data: logs,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 min-h-screen">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-2">
          <h1 className="text-5xl sm:text-6xl font-serif font-black text-primary tracking-tighter leading-none">
            Audit Logs
          </h1>
          <p className="text-muted-foreground font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Immutable ledger of all inventory movements and operations.
          </p>
        </div>
      </div>

      {/* KPI Grid Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Records", value: stats.total, icon: History, isPrimary: false },
          { label: "Today's Events", value: stats.todaysEvents, icon: Activity, isPrimary: true },
          { label: "Restocks Executed", value: stats.restocks, icon: PackagePlus, isPrimary: false },
          { label: "Fulfillments", value: stats.fulfillments, icon: PackageMinus, isPrimary: false },
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
            <span className={`mt-4 text-4xl sm:text-5xl font-black tracking-tighter relative z-10 ${kpi.isPrimary ? 'text-primary' : 'text-foreground'}`}>
              {kpi.value.toString().padStart(2, "0")}
            </span>
          </div>
        ))}
      </div>

      {/* Main Content Section */}
      <div className="space-y-6">
        {/* Search Input */}
        <div className="relative w-full max-w-sm">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-muted-foreground" />
          </div>
          <Input 
            placeholder="Search records or products..." 
            value={globalFilter ?? ""}
            onChange={e => setGlobalFilter(e.target.value)}
            className="pl-10 h-11 bg-card border-border/40 focus-visible:ring-1 focus-visible:ring-primary rounded-xl transition-all text-sm font-semibold shadow-sm w-full"
          />
        </div>

        {/* Data Table */}
        <div className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/20 border-b border-border/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground h-16 px-6">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="divide-y divide-border/20">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <span className="text-sm font-semibold tracking-tight animate-pulse">Syncing audit ledger...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="border-none hover:bg-muted/10 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4 px-6 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <History className="w-8 h-8 mb-4 opacity-20" />
                      <span className="text-sm font-semibold tracking-tight">No ledger entries match criteria.</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-muted/5">
            <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              Page <span className="text-foreground">{table.getState().pagination.pageIndex + 1}</span> of{" "}
              {table.getPageCount() || 1}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-8 px-4 text-[10px] uppercase font-bold tracking-widest rounded-lg border-border/40 hover:bg-muted/20"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-8 px-4 text-[10px] uppercase font-bold tracking-widest rounded-lg border-border/40 hover:bg-muted/20"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}