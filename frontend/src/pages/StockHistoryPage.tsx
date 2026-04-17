import React, { useState, useEffect, useMemo } from "react";
import api from "@/services/api";
import { format } from "date-fns";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { History, Loader2, ArrowRight, ArrowDown, ArrowUp } from "lucide-react";
import { IStockLog } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const columns = useMemo(() => [
    columnHelper.accessor("date", {
      header: "Timestamp",
      cell: (info) => (
        <div className="font-bold text-muted-foreground text-xs uppercase tracking-widest">
          {format(new Date(info.getValue()), "MMM dd, yyyy • h:mm a")}
        </div>
      ),
    }),
    columnHelper.accessor("productName", {
      header: "Product",
      cell: (info) => <div className="font-black text-foreground">{info.getValue()}</div>,
    }),
    columnHelper.accessor("changeType", {
      header: "Event Trigger",
      cell: (info) => {
        const type = info.getValue();
        let badgeStyle = "bg-muted text-muted-foreground";
        if (type === "Fulfillment") badgeStyle = "bg-primary/10 text-primary border-primary/20";
        if (type === "Restock") badgeStyle = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
        
        return (
          <Badge variant="outline" className={`uppercase tracking-widest text-[9px] font-black ${badgeStyle}`}>
            {type}
          </Badge>
        );
      },
    }),
    columnHelper.display({
      id: "movement",
      header: "Stock Movement",
      cell: (info) => {
        const row = info.row.original;
        const isAddition = row.changeAmount > 0;
        
        return (
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground font-bold">{row.previousStock}</span>
            <ArrowRight className="w-3 h-3 text-border" />
            <span className="text-foreground font-black">{row.newStock}</span>
            <span className={`flex items-center text-xs font-black ml-2 ${isAddition ? 'text-emerald-500' : 'text-destructive'}`}>
              {isAddition ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
              {Math.abs(row.changeAmount)}
            </span>
          </div>
        );
      },
    }),
  ], []);

  const table = useReactTable({
    data: logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div className="space-y-1">
          <h1 className="text-4xl sm:text-5xl tracking-tight font-black text-foreground" style={{ fontFamily: '"Instrument Serif", serif' }}>
            Audit Logs
          </h1>
          <p className="text-muted-foreground font-sans text-sm font-medium">
            Immutable ledger of all inventory movements and fulfillments.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center shrink-0 border border-border/40">
          <History className="w-5 h-5 text-primary" />
        </div>
      </div>

      <div className="rounded-3xl border border-border/40 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border/40">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground h-14 px-6">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="divide-y divide-border/40">
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/10 transition-colors border-0">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 px-6">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground font-bold">
                  No stock logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-muted/10">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="text-[10px] font-black uppercase tracking-widest border-border/40"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="text-[10px] font-black uppercase tracking-widest border-border/40"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}