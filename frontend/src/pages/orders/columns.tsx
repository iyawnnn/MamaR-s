import { ColumnDef } from "@tanstack/react-table";
import { format, differenceInHours } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings2, Clock, Edit3, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
          <div className="text-sm font-medium text-foreground">
            {format(date, "MMM dd, yyyy")}
          </div>
          {isUrgent && (
            <span className="w-fit inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 border border-red-100">
              <Clock className="w-3 h-3 mr-1.5" />
              {hoursRemaining}h left
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "orderInfo",
    header: "Order ID & Customer",
    cell: ({ row }) => {
      const id = row.original._id.slice(-6).toUpperCase();
      const name = row.original.customerName;
      return (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">
            #{id}
          </span>
          <span className="text-sm font-medium text-foreground">
            {name}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "customerContact",
    header: "Contact Details",
    cell: ({ row }) => {
      return (
        <span className="text-sm font-medium text-muted-foreground">
          {row.original.customerContact || "---"}
        </span>
      );
    },
  },
  {
    id: "products",
    header: "Items",
    cell: ({ row }) => {
      const items = row.original.items;
      return (
        <div className="flex flex-col gap-1.5">
          {items.map((item, idx) => (
            <div key={idx} className="text-sm text-foreground font-medium flex items-start gap-2">
              <span className="text-primary bg-primary/10 px-1.5 py-0.5 rounded-md text-xs">
                {item.quantity}x
              </span>
              <span className="mt-0.5">
                {item.product?.name}
                {item.product?.variant && (
                  <span className="text-muted-foreground ml-1">
                    ({item.product.variant})
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string;
      const amount = row.original.totalAmount;
      
      return (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">
            {formatPHP(amount)}
          </span>
          <span
            className={`w-fit text-xs font-medium capitalize px-2 py-0.5 rounded-md border ${
              status === PaymentStatus.PAID
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-muted/30 text-muted-foreground border-border/40"
            }`}
          >
            {status.toLowerCase()}
          </span>
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
          <Badge variant="outline" className="bg-transparent text-muted-foreground border-border/60 shadow-none font-medium text-xs capitalize py-1 px-2.5 rounded-md">
            {status.toLowerCase()}
          </Badge>
        );
      }
      
      if (status === OrderStatus.READY) {
        return (
          <Badge className="bg-primary/10 text-primary shadow-none font-medium text-xs capitalize py-1 px-2.5 rounded-md border border-primary/20 hover:bg-primary/20">
            {status.toLowerCase()}
          </Badge>
        );
      }

      return (
        <Badge variant="secondary" className="bg-muted text-foreground hover:bg-muted/80 shadow-none font-medium text-xs capitalize py-1 px-2.5 rounded-md border border-border/40">
          {status.toLowerCase()}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const order = row.original;
      // Extract all necessary action handlers injected via the table meta property
      const updateStatus = (table.options.meta as any)?.updateStatus;
      const fulfillAndPrint = (table.options.meta as any)?.fulfillAndPrint;
      const onEdit = (table.options.meta as any)?.onEdit;
      const onDelete = (table.options.meta as any)?.onDelete;

      return (
        <div className="flex justify-end pr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-muted/20 border border-transparent hover:border-border/40 transition-colors">
                <Settings2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card border-border/40 shadow-sm rounded-lg p-1.5">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-medium px-2 pb-1.5">
                Operations
              </DropdownMenuLabel>
              
              <DropdownMenuItem 
                onClick={() => onEdit?.(order)}
                className="text-sm font-medium rounded-md cursor-pointer focus:bg-muted/10 transition-colors flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4 text-muted-foreground" />
                Edit Details
              </DropdownMenuItem>

              {order.status !== OrderStatus.READY && order.status !== OrderStatus.FULFILLED && (
                <DropdownMenuItem 
                  onClick={() => updateStatus?.(order._id, OrderStatus.READY)}
                  className="text-sm font-medium rounded-md cursor-pointer focus:bg-muted/10 transition-colors"
                >
                  Mark as Ready
                </DropdownMenuItem>
              )}
              
              {order.status === OrderStatus.READY && (
                <DropdownMenuItem 
                  onClick={() => fulfillAndPrint?.(order)}
                  className="text-foreground font-medium text-sm rounded-md cursor-pointer focus:bg-muted/10 transition-colors"
                >
                  Fulfill & Print
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator className="bg-border/40 my-1" />
              
              <DropdownMenuItem 
                onClick={() => updateStatus?.(order._id, OrderStatus.CANCELLED)}
                className="text-sm font-medium rounded-md cursor-pointer focus:bg-muted/10 transition-colors"
              >
                Cancel Order
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => onDelete?.(order)}
                className="text-destructive text-sm font-medium rounded-md cursor-pointer focus:bg-red-50 focus:text-destructive transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Record
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];