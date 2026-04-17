import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IOrder, OrderStatus, PaymentStatus } from "@/types";
import { formatPHP } from "@/utils/currency";

export const columns: ColumnDef<IOrder>[] = [
  {
    accessorKey: "targetDate",
    header: "Fulfillment Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("targetDate"));
      return <div className="font-medium">{format(date, "MMM dd, yyyy")}</div>;
    },
  },
  {
    accessorKey: "customerName",
    header: "Customer",
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string;
      const amount = row.original.totalAmount;
      
      return (
        <div className="flex items-center gap-2">
          <span>{formatPHP(amount)}</span>
          <Badge 
            variant="outline" 
            className={`border-0 ${status === PaymentStatus.PAID ? 'bg-green-900/20 text-green-400' : 'bg-zinc-800 text-zinc-400'}`}
          >
            {status}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant="secondary" className="bg-zinc-900 text-zinc-300 hover:bg-zinc-800">
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const order = row.original;
      // Extract both mutation functions safely
      const updateStatus = (table.options.meta as any)?.updateStatus;
      const fulfillAndPrint = (table.options.meta as any)?.fulfillAndPrint;

      return (
        <DropdownMenu>
          {/* ... Trigger code remains exactly the same ... */}
          <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            
            {order.status !== OrderStatus.READY && (
              <DropdownMenuItem 
                onClick={() => updateStatus(order._id, OrderStatus.READY)}
              >
                Mark as Ready
              </DropdownMenuItem>
            )}
            
            {/* UPDATE THIS BUTTON HERE */}
            {order.status === OrderStatus.READY && (
              <DropdownMenuItem 
                onClick={() => fulfillAndPrint(order)}
                className="text-green-400 font-bold"
              >
                Fulfill & Print Receipt
              </DropdownMenuItem>
            )}

            <DropdownMenuItem className="text-red-400">Cancel Order</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];