import { useState, useEffect, useCallback, useRef } from "react";
import { fetchOrders, updateOrderStatus, deleteOrder } from "@/services/api";
import { IOrder } from "@/types";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { columns } from "./orders/columns";
import OrderEntrySheet from "@/components/OrderEntrySheet";
import { Plus, LayoutGrid, Clock, PackageCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReactToPrint } from "react-to-print";
import ReceiptPrint from "@/components/ReceiptPrint";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<IOrder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [printOrder, setPrintOrder] = useState<IOrder | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    onAfterPrint: () => setPrintOrder(null),
  });

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOrders(activeTab);
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, { status: newStatus });
      await loadOrders();
    } catch (error) {
      console.error("Status update failed", error);
    }
  };

  const handleFulfillAndPrint = async (order: IOrder) => {
    try {
      await updateOrderStatus(order._id, { status: "FULFILLED" });
      setPrintOrder(order);
      setTimeout(() => {
        handlePrint();
      }, 100);
      await loadOrders();
    } catch (error) {
      console.error("Fulfillment failed", error);
    }
  };

  const handleEdit = (order: IOrder) => {
    setSelectedOrder(order);
    setTimeout(() => setIsSheetOpen(true), 50);
  };

  const handleDeleteRequest = (order: IOrder) => {
    setOrderToDelete(order);
    setTimeout(() => setIsDeleteModalOpen(true), 50);
  };

  const executeDelete = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      await deleteOrder(orderToDelete._id);
      await loadOrders();
      setIsDeleteModalOpen(false);
      setTimeout(() => setOrderToDelete(null), 200);
    } catch (error) {
      console.error("Failed to delete order:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const stats = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "PENDING").length,
    preparing: orders.filter((o) => o.status === "PREPARING").length,
    ready: orders.filter((o) => o.status === "READY").length,
  };

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    meta: {
      updateStatus: handleStatusChange,
      fulfillAndPrint: handleFulfillAndPrint,
      onEdit: handleEdit,
      onDelete: handleDeleteRequest,
    },
  });

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 min-h-screen animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-2">
          <h1 className="text-5xl sm:text-6xl font-serif font-black text-primary tracking-tighter leading-none">
            Active Orders
          </h1>
          <p className="text-muted-foreground font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Real-time fulfillment operations.
          </p>
        </div>
        
        <Button
          onClick={() => {
            setSelectedOrder(null);
            setIsSheetOpen(true);
          }}
          className="group h-14 pl-6 pr-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-all duration-300 shadow-lg flex items-center gap-4 border-none"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.25em]">New Pre-Order</span>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
            <Plus className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Active", value: stats.all, icon: LayoutGrid, isPrimary: false },
          { label: "Pending", value: stats.pending, icon: Clock, isPrimary: false },
          { label: "Preparing", value: stats.preparing, icon: PackageCheck, isPrimary: false },
          { label: "Ready", value: stats.ready, icon: CheckCircle2, isPrimary: true },
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
            <span className={`mt-4 text-5xl font-black tracking-tighter relative z-10 ${kpi.isPrimary ? 'text-primary' : 'text-foreground'}`}>
              {kpi.value.toString().padStart(2, "0")}
            </span>
          </div>
        ))}
      </div>

      <Tabs
        defaultValue="all"
        className="space-y-6"
        onValueChange={setActiveTab}
      >
        <TabsList className="bg-muted/40 p-1.5 rounded-xl w-fit h-auto gap-2 border border-border/40">
          {[
            { id: "all", label: "All Records" },
            { id: "pending", label: "Pending" },
            { id: "preparing", label: "Preparing" },
            { id: "ready", label: "Ready" },
          ].map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="rounded-lg px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border-border/40 text-muted-foreground hover:text-foreground border border-transparent"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/20 border-b border-border/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="hover:bg-transparent border-none"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground h-16 px-6"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
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
                      <span className="text-sm font-semibold tracking-tight animate-pulse">Syncing order architecture...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-none hover:bg-muted/10 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-5 px-6 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-48 text-center"
                  >
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <LayoutGrid className="w-8 h-8 mb-4 opacity-20" />
                      <span className="text-sm font-semibold tracking-tight">No active orders matching this criteria.</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between px-8 py-5 border-t border-border/40 bg-muted/5">
            <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              Page <span className="text-foreground">{table.getState().pagination.pageIndex + 1}</span> of{" "}
              {table.getPageCount() || 1}
            </span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-9 px-4 text-[10px] uppercase font-bold tracking-widest rounded-lg border-border/40 hover:bg-muted/20"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-9 px-4 text-[10px] uppercase font-bold tracking-widest rounded-lg border-border/40 hover:bg-muted/20"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </Tabs>

      <OrderEntrySheet
        open={isSheetOpen}
        onOpenChange={(open) => {
          setIsSheetOpen(open);
          if (!open) setTimeout(() => setSelectedOrder(null), 200); 
        }}
        order={selectedOrder}
        initialData={selectedOrder}
        onSuccess={() => {
          setActiveTab("all");
          loadOrders();
        }}
      />

      {isDeleteModalOpen && orderToDelete && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border/40 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-2xl text-foreground tracking-tight">Revoke Order</h3>
                <p className="text-sm text-muted-foreground">
                  Are you certain you want to permanently delete order <span className="font-black text-foreground">#{String(orderToDelete._id).slice(-6).toUpperCase()}</span>? This action bypasses the standard cancellation workflow and cannot be reversed.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-border/40 bg-muted/10 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setTimeout(() => setOrderToDelete(null), 200);
                }}
                className="h-11 px-6 rounded-xl text-xs font-bold uppercase tracking-widest"
                disabled={isDeleting}
              >
                Abort
              </Button>
              <Button
                variant="destructive"
                onClick={executeDelete}
                disabled={isDeleting}
                className="h-11 px-8 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg"
              >
                {isDeleting ? "Syncing..." : "Execute Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ReceiptPrint ref={receiptRef} order={printOrder} />
    </div>
  );
}