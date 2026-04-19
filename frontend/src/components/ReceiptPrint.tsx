import React, { forwardRef } from 'react';
import { IOrder } from '@/types';
import { formatPHP } from '@/utils/currency';
import { format } from 'date-fns';

interface ReceiptPrintProps {
  order: IOrder | null;
}

// forwardRef is strictly required by react-to-print
const ReceiptPrint = forwardRef<HTMLDivElement, ReceiptPrintProps>(({ order }, ref) => {
  if (!order) return null;

  return (
    <div className="hidden">
      {/* This div is only visible to the printer. 
        We use strict inline widths (w-[80mm]) and standard serif/mono fonts 
        to ensure thermal printer compatibility.
      */}
      <div ref={ref} className="w-[80mm] p-4 bg-white text-black font-mono text-sm print:block print:w-full print:m-0 print:p-2">
        <div className="text-center mb-4">
          <h1 className="font-serif text-2xl font-black uppercase tracking-tighter">Mama R's</h1>
          <p className="text-xs uppercase tracking-widest mt-1">Pre-Order Bakery</p>
          <p className="text-[10px] mt-1 border-b border-dashed border-black pb-4">
            San Fernando, Pampanga
          </p>
        </div>

        <div className="mb-4 text-xs space-y-1 border-b border-dashed border-black pb-4">
          <p><span className="font-bold">Date:</span> {format(new Date(), "MMM dd, yyyy h:mm a")}</p>
          <p><span className="font-bold">Target:</span> {format(new Date(order.targetDate), "MMM dd, yyyy")}</p>
          <p><span className="font-bold">Customer:</span> {order.customerName}</p>
          <p><span className="font-bold">Order ID:</span> {order._id.slice(-6).toUpperCase()}</p>
        </div>

        <table className="w-full text-xs mb-4">
          <thead>
            <tr className="border-b border-dashed border-black">
              <th className="text-left pb-1">Qty</th>
              <th className="text-left pb-1">Item</th>
              <th className="text-right pb-1">Total</th>
            </tr>
          </thead>
          <tbody className="align-top">
            {order.items.map((item: any, idx: number) => {
              // Ensure we extract the name whether it's populated or not
              const itemName = item.product?.name || item.name || 'Pastry';
              return (
                <tr key={idx}>
                  <td className="py-1 font-bold">{item.quantity}x</td>
                  <td className="py-1 pr-2">
                    {itemName}
                    {item.variant && <span className="block text-[10px] italic">{item.variant}</span>}
                  </td>
                  <td className="py-1 text-right">{formatPHP(item.priceAtTimeOfOrder * item.quantity)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="border-t border-dashed border-black pt-2 text-sm space-y-1">
          <div className="flex justify-between font-bold">
            <span>Total Payable:</span>
            <span>{formatPHP(order.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Status:</span>
            <span className="uppercase">{order.paymentStatus}</span>
          </div>
          {order.paymentStatus === 'PARTIAL' && (
            <div className="flex justify-between text-xs">
              <span>Amount Paid:</span>
              <span>{formatPHP(order.amountPaid)}</span>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-[10px] border-t border-dashed border-black pt-4">
          <p className="font-bold uppercase tracking-widest">Thank you for ordering!</p>
          <p className="mt-1">Enjoy your freshly baked goods.</p>
        </div>
      </div>
    </div>
  );
});

ReceiptPrint.displayName = 'ReceiptPrint';
export default ReceiptPrint;