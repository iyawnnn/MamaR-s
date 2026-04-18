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
  Plus, 
  Edit3, 
  Trash2, 
  Layers, 
  BookOpen, 
  Search,
  Package,
  Tag,
  Box
} from "lucide-react";
import { formatPHP } from "@/utils/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Type definition for internal product structure
type ProductRow = {
  _id: string;
  name: string;
  hasVariants: boolean;
  sellingPrice?: number;
  variants: { name: string; price: number }[];
};

const columnHelper = createColumnHelper<ProductRow>();

export default function CatalogPage() {
  const [data, setData] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
      setData(res.data.products || res.data || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Aggregate Catalog KPIs
  const stats = useMemo(() => {
    const totalMaster = data.length;
    const singleItems = data.filter((p) => !p.hasVariants).length;
    const variantFamilies = data.filter((p) => p.hasVariants).length;
    
    // Calculate total individual SKUs (Singles + sum of all variants)
    const totalSKUs = data.reduce((acc, p) => {
      return acc + (p.hasVariants && p.variants ? p.variants.length : 1);
    }, 0);

    return { totalMaster, singleItems, variantFamilies, totalSKUs };
  }, [data]);

  // Define Table Columns
  const columns = useMemo(() => [
    columnHelper.accessor("name", {
      header: "Item Designation",
      cell: info => (
        <div className="font-bold text-foreground text-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center border border-border/40">
            <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.display({
      id: "configuration",
      header: "Configuration",
      cell: info => {
        const { hasVariants, variants } = info.row.original;
        
        if (!hasVariants) {
          return (
            <Badge variant="outline" className="border-border/40 text-muted-foreground uppercase tracking-widest text-[9px] bg-muted/20 px-2 py-0.5">
              Standard Item
            </Badge>
          );
        }

        return (
          <div className="flex flex-wrap gap-1.5">
            {variants?.map((v, idx) => (
              <Badge key={idx} variant="secondary" className="bg-primary/10 text-primary uppercase tracking-widest text-[9px] hover:bg-primary/20 px-2 py-0.5">
                {v.name}
              </Badge>
            ))}
          </div>
        );
      }
    }),
    columnHelper.display({
      id: "pricing",
      header: () => <div className="text-right">Base Pricing</div>,
      cell: info => {
        const { hasVariants, variants, sellingPrice } = info.row.original;
        
        if (hasVariants && variants?.length > 0) {
          const prices = variants.map(v => v.price);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          
          return (
            <div className="text-right">
              <span className="font-black text-foreground text-sm">
                {min === max ? formatPHP(min) : `${formatPHP(min)} - ${formatPHP(max)}`}
              </span>
            </div>
          );
        }

        return (
          <div className="text-right">
            <span className="font-black text-foreground text-sm">{formatPHP(sellingPrice || 0)}</span>
          </div>
        );
      }
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: () => (
        <div className="flex items-center justify-end gap-2 opacity-40 hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/50 rounded-lg">
            <Edit3 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 rounded-lg">
            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
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
    <div className="flex-1 space-y-8 p-8 pt-6 min-h-screen animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-2">
          <h1 className="text-5xl sm:text-6xl font-serif font-black text-primary tracking-tighter leading-none">
            Product Catalog
          </h1>
          <p className="text-muted-foreground font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Define menu architecture, parameters, and variants.
          </p>
        </div>
        
        <Button
          className="group h-14 pl-6 pr-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-all duration-300 shadow-lg flex items-center gap-4 border-none"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.25em]">Add Product</span>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
            <Plus className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
        </Button>
      </div>

      {/* KPI Grid Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Master Items", value: stats.totalMaster, icon: BookOpen, isPrimary: true },
          { label: "Total SKUs", value: stats.totalSKUs, icon: Box, isPrimary: false },
          { label: "Variant Families", value: stats.variantFamilies, icon: Layers, isPrimary: false },
          { label: "Standard Items", value: stats.singleItems, icon: Tag, isPrimary: false },
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
            <span className={`mt-4 text-4xl sm:text-5xl font-black tracking-tighter relative z-10 truncate ${kpi.isPrimary ? 'text-primary' : 'text-foreground'}`}>
              {kpi.value.toString().padStart(2, "0")}
            </span>
          </div>
        ))}
      </div>

      {/* Data Table Section */}
      <div className="space-y-6">
        
        {/* Search Input */}
        <div className="relative w-full max-w-sm">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-muted-foreground" />
          </div>
          <Input 
            placeholder="Search catalog architecture..." 
            value={globalFilter ?? ""}
            onChange={e => setGlobalFilter(e.target.value)}
            className="pl-10 h-11 bg-card border-border/40 focus-visible:ring-1 focus-visible:ring-primary rounded-xl transition-all text-sm font-semibold shadow-sm w-full"
          />
        </div>

        {/* The Catalog Ledger */}
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
                      <span className="text-sm font-semibold tracking-tight animate-pulse">Syncing catalog parameters...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="border-none hover:bg-muted/10 transition-colors group">
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
                      <span className="text-sm font-semibold tracking-tight">No products found matching criteria.</span>
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