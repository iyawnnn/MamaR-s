import { ColumnDef } from "@tanstack/react-table";
import { format, differenceInHours } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Clock } from "lucide-react";
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
      const hoursRemaining = differenceInHours(date, new Date());
      const isUrgent = hoursRemaining < 24 && hoursRemaining >= 0;

      return (
        <div className="flex flex-col gap-1">
          <div className="font-medium text-foreground">{format(date, "MMM dd, yyyy")}</div>
          {isUrgent && (
            <Badge className="w-fit bg-red-600 text-white border-0 text-[10px] py-0 h-4 px-1.5 animate-pulse">
              <Clock className="w-2.5 h-2.5 mr-1" />
              {hoursRemaining}h left
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "orderInfo",
    header: "Order & Customer",
    cell: ({ row }) => {
      const id = row.original._id.slice(-6).toUpperCase();
      const name = row.original.customerName;
      return (
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">#{id}</span>
          <span className="font-bold text-foreground">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "customerContact",
    header: "Contact",
    cell: ({ row }) => {
      return <span className="text-muted-foreground tabular-nums">{row.original.customerContact || '---'}</span>
    }
  },
  {
    id: "products",
    header: "Products",
    cell: ({ row }) => {
      const items = row.original.items;
      return (
        <div className="flex flex-col gap-0.5">
          {items.map((item, idx) => (
            <div key={idx} className="text-xs text-foreground/80 leading-tight">
              <span className="font-black text-primary">{item.quantity}x</span> {item.product?.name}
              {item.product?.variant && <span className="text-muted-foreground ml-1">- {item.product.variant}</span>}
            </div>
          ))}
        </div>
      );
    }
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string;
      const amount = row.original.totalAmount;
      
      return (
        <div className="flex flex-col">
           <span className="font-bold text-foreground">{formatPHP(amount)}</span>
          <Badge 
            variant="outline" 
            className={`w-fit text-[10px] px-1 h-4 border-0 ${status === PaymentStatus.PAID ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
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
      const status = row.getValue("status") as OrderStatus;
      
      if (status === OrderStatus.PENDING) {
        return (
          <Badge className="bg-[#fffae9] text-[#af0e0e] border border-[#af0e0e]/20 hover:bg-[#fffae9] font-bold shadow-none">
            {status}
          </Badge>
        );
      }
      
      if (status === OrderStatus.READY) {
        return (
          <Badge className="bg-primary text-primary-foreground hover:bg-primary font-bold shadow-none">
            {status}
          </Badge>
        );
      }

      return (
        <Badge variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary/80 font-bold">
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const order = row.original;
      const updateStatus = (table.options.meta as any)?.updateStatus;
      const fulfillAndPrint = (table.options.meta as any)?.fulfillAndPrint;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-secondary">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            
            {order.status !== OrderStatus.READY && order.status !== OrderStatus.FULFILLED && (
              <DropdownMenuItem 
                onClick={() => updateStatus(order._id, OrderStatus.READY)}
              >
                Mark as Ready
              </DropdownMenuItem>
            )}
            
            {order.status === OrderStatus.READY && (
              <DropdownMenuItem 
                onClick={() => fulfillAndPrint(order)}
                className="text-primary font-bold"
              >
                Fulfill & Print Receipt
              </DropdownMenuItem>
            )}

            <DropdownMenuItem className="text-destructive">Cancel Order</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];