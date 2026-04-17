import React, { useState, useEffect, useMemo } from "react";
import api from "@/services/api";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Package, Search, AlertTriangle, RefreshCcw, Loader2 } from "lucide-react";
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

// Define the flattened inventory type
type InventoryRow = {
  id: string;
  productId: string;
  name: string;
  variantName?: string;
  stock: number;
  threshold: number;
  originalProduct: any; // Kept to pass into your existing RestockModal
};

const columnHelper = createColumnHelper<InventoryRow>();

export default function InventoryPage() {
  const [data, setData] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [restockTarget, setRestockTarget] = useState<any>(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products");
      const products = res.data.products || res.data || [];
      
      // Flatten products and variants into a single array of rows
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
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const columns = useMemo(() => [
    columnHelper.accessor("name", {
      header: "Item Name",
      cell: info => (
        <div className="font-bold text-foreground">
          {info.getValue()}
          {info.row.original.variantName && (
            <span className="ml-2 text-[10px] uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
              {info.row.original.variantName}
            </span>
          )}
        </div>
      ),
    }),
    columnHelper.accessor("stock", {
      header: "Current Stock",
      cell: info => {
        const stock = info.getValue();
        const threshold = info.row.original.threshold;
        const isLow = stock <= threshold;
        
        return (
          <div className={`font-black text-lg ${isLow ? 'text-destructive' : 'text-emerald-500'}`}>
            {stock}
          </div>
        );
      },
    }),
    columnHelper.accessor("threshold", {
      header: "Alert Level",
      cell: info => <div className="text-muted-foreground font-bold">&lt; {info.getValue()}</div>,
    }),
    columnHelper.display({
      id: "status",
      header: "Status",
      cell: info => {
        const { stock, threshold } = info.row.original;
        if (stock === 0) return <Badge variant="destructive" className="uppercase tracking-widest text-[9px]">Out of Stock</Badge>;
        if (stock <= threshold) return <Badge variant="outline" className="border-amber-500/50 text-amber-500 uppercase tracking-widest text-[9px] bg-amber-500/10"><AlertTriangle className="w-3 h-3 mr-1"/> Low Stock</Badge>;
        return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 uppercase tracking-widest text-[9px] hover:bg-emerald-500/20">In Stock</Badge>;
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
            className="text-[10px] font-black uppercase tracking-widest"
          >
            <RefreshCcw className="w-3 h-3 mr-2" /> Restock
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
  });

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div className="space-y-1">
          <h1 className="text-4xl sm:text-5xl tracking-tight font-black text-foreground" style={{ fontFamily: '"Instrument Serif", serif' }}>
            Stock Levels
          </h1>
          <p className="text-muted-foreground font-sans text-sm font-medium">
            Monitor inventory thresholds and process restocks globally.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 bg-background p-1 rounded-xl border border-border/40 max-w-sm shadow-sm">
        <Search className="w-4 h-4 ml-3 text-muted-foreground" />
        <Input 
          placeholder="Search items or variants..." 
          value={globalFilter ?? ""}
          onChange={e => setGlobalFilter(e.target.value)}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
        />
      </div>

      <div className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border/40">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground h-12">
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
                <TableRow key={row.id} className="hover:bg-muted/20 transition-colors border-0">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground font-medium">
                  No items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mount existing Restock Modal */}
      {restockTarget && (
        <RestockModal 
          product={restockTarget} 
          onClose={() => {
            setRestockTarget(null);
            fetchInventory();
          }} 
        />
      )}
    </div>
  );
}