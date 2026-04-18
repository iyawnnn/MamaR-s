import React, { useState, useEffect, useMemo, useCallback } from "react";
import api from "@/services/api";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { 
  Search, 
  AlertTriangle, 
  RefreshCcw, 
  Layers, 
  CheckCircle2, 
  XCircle,
  Package
} from "lucide-react";
import { Input } from "@/components/ui/input";
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
import RestockModal from "@/components/RestockModal";

type InventoryRow = {
  id: string;
  productId: string;
  name: string;
  variantName?: string;
  stock: number;
  threshold: number;
  originalProduct: any;
};

const columnHelper = createColumnHelper<InventoryRow>();

export default function InventoryPage() {
  const [data, setData] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [restockTarget, setRestockTarget] = useState<any>(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/products");
      const products = res.data.products || res.data || [];
      
      const flattenedData: InventoryRow[] = products.flatMap((p: any) => {
        if (p.hasVariants) {
          return p.variants.map((v: any, index: number) => ({
            id: `${p._id}-${index}`,
            productId: p._id,
            name: p.name,
            variantName: v.name,
            stock: v.stock,
            threshold: v.lowStockThreshold || p.lowStockThreshold || 5,
            originalProduct: p,
          }));
        } else {
          return [{
            id: p._id,
            productId: p._id,
            name: p.name,
            stock: p.stock,
            threshold: p.lowStockThreshold || 5,
            originalProduct: p,
          }];
        }
      });

      setData(flattenedData);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const stats = useMemo(() => {
    const total = data.length;
    const outOfStock = data.filter((d) => d.stock === 0).length;
    const lowStock = data.filter((d) => d.stock > 0 && d.stock <= d.threshold).length;
    const healthy = total - outOfStock - lowStock;
    
    return { total, outOfStock, lowStock, healthy };
  }, [data]);

  const columns = useMemo(() => [
    columnHelper.accessor("name", {
      header: "Item Designation",
      cell: info => (
        <div className="font-bold text-foreground text-sm flex items-center gap-2">
          {info.getValue()}
          {info.row.original.variantName && (
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground bg-muted/50 border border-border/40 px-2 py-0.5 rounded-md">
              {info.row.original.variantName}
            </span>
          )}
        </div>
      ),
    }),
    columnHelper.accessor("stock", {
      header: () => <div className="text-right">Current Stock</div>,
      cell: info => {
        const stock = info.getValue();
        const threshold = info.row.original.threshold;
        const isLow = stock <= threshold;
        const isOut = stock === 0;
        
        let colorClass = "text-emerald-500";
        if (isOut) colorClass = "text-destructive";
        else if (isLow) colorClass = "text-amber-500";

        return (
          <div className={`font-black text-right text-lg ${colorClass}`}>
            {stock.toString().padStart(2, "0")}
          </div>
        );
      },
    }),
    columnHelper.accessor("threshold", {
      header: () => <div className="text-right">Threshold</div>,
      cell: info => <div className="text-muted-foreground font-bold text-right">&lt; {info.getValue()}</div>,
    }),
    columnHelper.display({
      id: "status",
      header: () => <div className="text-center">Status</div>,
      cell: info => {
        const { stock, threshold } = info.row.original;
        if (stock === 0) return (
          <div className="flex justify-center">
            <Badge variant="destructive" className="uppercase tracking-widest text-[9px] px-2 py-0.5">Out of Stock</Badge>
          </div>
        );
        if (stock <= threshold) return (
          <div className="flex justify-center">
            <Badge variant="outline" className="border-amber-500/50 text-amber-500 uppercase tracking-widest text-[9px] bg-amber-500/10 px-2 py-0.5">
              <AlertTriangle className="w-3 h-3 mr-1"/> Low Stock
            </Badge>
          </div>
        );
        return (
          <div className="flex justify-center">
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 uppercase tracking-widest text-[9px] hover:bg-emerald-500/20 px-2 py-0.5">
              In Stock
            </Badge>
          </div>
        );
      }
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: info => (
        <div className="text-right">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setRestockTarget(info.row.original.originalProduct)}
            className="text-[10px] font-bold uppercase tracking-widest h-9 px-4 rounded-lg border-border/40 hover:bg-muted/20 transition-all text-muted-foreground hover:text-foreground"
          >
            Adjust
          </Button>
        </div>
      ),
    })
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-2">
          <h1 className="text-5xl sm:text-6xl font-serif font-black text-primary tracking-tighter leading-none">
            Stock Levels
          </h1>
          <p className="text-muted-foreground font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Monitor inventory thresholds and process supply adjustments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Tracked", value: stats.total, icon: Layers, isPrimary: false },
          { label: "Healthy Stock", value: stats.healthy, icon: CheckCircle2, isPrimary: true },
          { label: "Low Warning", value: stats.lowStock, icon: AlertTriangle, isPrimary: false },
          { label: "Depleted", value: stats.outOfStock, icon: XCircle, isPrimary: false },
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

      <div className="space-y-6">
        <div className="relative w-full max-w-sm">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-muted-foreground" />
          </div>
          <Input 
            placeholder="Search catalog or variants..." 
            value={globalFilter ?? ""}
            onChange={e => setGlobalFilter(e.target.value)}
            className="pl-10 h-11 bg-card border-border/40 focus-visible:ring-1 focus-visible:ring-primary rounded-xl transition-all text-sm font-semibold shadow-sm w-full"
          />
        </div>

        <div className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/20 border-b border-border/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground h-14 px-6">
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
                      <span className="text-sm font-semibold tracking-tight animate-pulse">Syncing inventory data...</span>
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
                      <Package className="w-8 h-8 mb-4 opacity-20" />
                      <span className="text-sm font-semibold tracking-tight">No items found matching criteria.</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

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

      <RestockModal 
        product={restockTarget} 
        onClose={() => {
          setRestockTarget(null);
          fetchInventory();
        }} 
      />
    </div>
  );
}