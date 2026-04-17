import { useState, useEffect, useCallback, useRef } from "react";
import { fetchOrders, updateOrderStatus } from "@/services/api";
import { IOrder } from "@/types";
import {
  useReactTable,
  getCoreRowModel,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { columns } from "./orders/columns";
import OrderEntrySheet from "@/components/OrderEntrySheet";
import { Plus, ShoppingBag, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReactToPrint } from "react-to-print";
import ReceiptPrint from "@/components/ReceiptPrint";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
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
    meta: {
      updateStatus: handleStatusChange,
      fulfillAndPrint: handleFulfillAndPrint,
    },
  });

  return (
    <div className="flex-1 space-y-10 p-8 pt-6 bg-muted/30 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/60">
        <div className="space-y-1">
          <h2
            className="text-5xl md:text-6xl font-black text-foreground tracking-tighter leading-none"
            style={{ fontFamily: '"Instrument Serif", serif' }}
          >
            Active Orders
          </h2>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Processing {stats.all} active orders today
          </p>
        </div>
        <Button
          onClick={() => setIsSheetOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl uppercase tracking-[0.2em] text-[10px] h-14 px-8 shadow-xl shadow-primary/20 transition-all active:scale-95 flex gap-3"
        >
          <Plus className="w-5 h-5" /> New Order
        </Button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Active",
            value: stats.all,
            icon: ShoppingBag,
            color: "text-foreground",
          },
          {
            label: "Pending",
            value: stats.pending,
            icon: Clock,
            color: "text-amber-600",
          },
          {
            label: "Preparing",
            value: stats.preparing,
            icon: Clock,
            color: "text-blue-600",
          },
          {
            label: "Ready",
            value: stats.ready,
            icon: CheckCircle2,
            color: "text-primary",
          },
        ].map((kpi, idx) => (
          <Card
            key={idx}
            className="rounded-3xl border-none shadow-sm bg-card hover:shadow-md transition-all group overflow-hidden relative"
          >
            <div
              className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${kpi.color}`}
            >
              <kpi.icon className="w-12 h-12" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase">
                {kpi.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-4xl font-black tracking-tighter ${kpi.color}`}
                style={{ fontFamily: '"Instrument Serif", serif' }}
              >
                {kpi.value.toString().padStart(2, "0")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Layout Area */}
      <Tabs
        defaultValue="all"
        className="space-y-8"
        onValueChange={setActiveTab}
      >
        <TabsList className="bg-muted p-1.5 rounded-[20px] w-fit h-auto gap-1 border border-border/50">
          {[
            { id: "all", label: "All Active" },
            { id: "pending", label: "Pending" },
            { id: "preparing", label: "Preparing" },
            { id: "ready", label: "Ready" },
          ].map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="rounded-[14px] px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all
                       data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg shadow-primary/20
                       data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted-foreground/10"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="rounded-[32px] border border-border/40 bg-card overflow-hidden shadow-sm shadow-primary/5">
          <Table>
            <TableHeader className="bg-muted/40 border-b border-border/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="hover:bg-transparent border-none"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground h-14 px-6"
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
            <TableBody className="divide-y divide-border/30">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-none hover:bg-muted/10 transition-colors group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-6 px-6">
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
                    className="h-48 text-center text-muted-foreground italic font-black text-xl"
                    style={{ fontFamily: '"Instrument Serif", serif' }}
                  >
                    No active orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Tabs>

      <OrderEntrySheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSuccess={() => {
          setActiveTab("all");
          loadOrders();
        }}
      />
      <ReceiptPrint ref={receiptRef} order={printOrder} />
    </div>
  );
}
