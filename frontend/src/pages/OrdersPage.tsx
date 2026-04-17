import { useState, useEffect, useCallback } from "react";
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
import { columns } from "./orders/columns";
import OrderEntrySheet from "@/components/OrderEntrySheet";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
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
    content: () => receiptRef.current,
    onAfterPrint: () => setPrintOrder(null), // Clear the data after printing
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
      // 1. Update the database
      await updateOrderStatus(order._id, { status: "FULFILLED" });

      // 2. Set the data into the hidden receipt
      setPrintOrder(order);

      // 3. Trigger the print dialog (timeout ensures React renders the new state first)
      setTimeout(() => {
        handlePrint();
      }, 100);

      // 4. Refresh the table
      await loadOrders();
    } catch (error) {
      console.error("Fulfillment failed", error);
    }
  };

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateStatus: handleStatusChange,
      fulfillAndPrint: handleFulfillAndPrint, // Add this new property
    },
  });

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 pb-2 border-b border-border/40">
        <h2
          className="text-4xl tracking-tight font-black text-foreground"
          style={{ fontFamily: '"Instrument Serif", serif' }}
        >
          Active Orders
        </h2>
        <Button
          onClick={() => setIsSheetOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl uppercase tracking-widest text-[10px] gap-2 px-6 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> New Order
        </Button>
      </div>

      <Tabs
        defaultValue="all"
        className="space-y-4"
        onValueChange={setActiveTab}
      >
        <TabsList className="bg-transparent p-0 border-b border-zinc-800 w-full justify-start rounded-none h-auto">
          <TabsTrigger
            value="all"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent px-4 py-2"
          >
            All Active
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent px-4 py-2"
          >
            Pending
          </TabsTrigger>
          <TabsTrigger
            value="preparing"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent px-4 py-2"
          >
            Preparing
          </TabsTrigger>
          <TabsTrigger
            value="ready"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent px-4 py-2"
          >
            Ready
          </TabsTrigger>
        </TabsList>

        <div className="rounded-md border-0 bg-transparent">
          <Table>
            <TableHeader className="border-zinc-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-zinc-800 hover:bg-transparent"
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="text-zinc-500 font-normal"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-zinc-800/50 hover:bg-zinc-900/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4">
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
                    className="h-24 text-center text-zinc-500"
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
