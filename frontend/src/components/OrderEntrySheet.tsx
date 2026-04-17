import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/services/api";
import { formatPHP } from "@/utils/currency";
import { Loader2, Plus, Trash2, ShoppingBag, Calendar, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Validation Schema
const orderSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  targetDate: z.string().min(1, "Fulfillment date is required"),
  paymentStatus: z.enum(["UNPAID", "PARTIAL", "PAID"]),
  amountPaid: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface OrderEntrySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function OrderEntrySheet({ open, onOpenChange, onSuccess }: OrderEntrySheetProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      paymentStatus: "UNPAID",
      amountPaid: 0,
    }
  });

  const paymentStatus = watch("paymentStatus");

  useEffect(() => {
    if (open) {
      api.get("/products").then(res => setProducts(res.data.products || res.data || []));
    } else {
      // Reset when closed
      reset();
      setCart([]);
    }
  }, [open, reset]);

  const addToCart = (product: any, variant?: any) => {
    setCart(prev => [...prev, {
      product: product._id,
      name: product.name,
      variantName: variant?.name,
      quantity: 1,
      priceAtTimeOfOrder: variant ? variant.price : product.sellingPrice
    }]);
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const newCart = [...prev];
      newCart[index].quantity = Math.max(1, newCart[index].quantity + delta);
      return newCart;
    });
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.priceAtTimeOfOrder * item.quantity), 0);

  const onSubmit = async (data: OrderFormValues) => {
    if (cart.length === 0) return alert("Please add items to the order.");
    
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        status: "PENDING",
        items: cart.map(item => ({
          product: item.product,
          quantity: item.quantity,
          priceAtTimeOfOrder: item.priceAtTimeOfOrder,
          variant: item.variantName
        }))
      };

      await api.post("/orders", payload);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("Failed to create order. Check console.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-background border-l-border/40 sm:rounded-l-3xl p-0">
        <div className="p-8 border-b border-border/40 bg-muted/10">
          <SheetHeader>
            <SheetTitle className="font-serif text-3xl font-black flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-primary" /> New Pre-Order
            </SheetTitle>
            <SheetDescription className="font-bold text-xs uppercase tracking-widest">
              Log incoming requests and schedule fulfillment.
            </SheetDescription>
          </SheetHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
          {/* Customer & Date */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <User className="w-3 h-3" /> Customer Name
              </Label>
              <Input {...register("customerName")} placeholder="Juan Dela Cruz" className="h-12 bg-muted/20 border-border/40 font-bold" />
              {errors.customerName && <p className="text-xs text-destructive">{errors.customerName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Fulfillment Date
              </Label>
              <Input type="date" {...register("targetDate")} className="h-12 bg-muted/20 border-border/40 font-bold" />
              {errors.targetDate && <p className="text-xs text-destructive">{errors.targetDate.message}</p>}
            </div>
          </div>

          {/* Catalog Selection */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quick Add Items</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {products.map(p => (
                p.hasVariants ? (
                  p.variants.map((v: any) => (
                    <Button key={`${p._id}-${v.name}`} type="button" variant="outline" onClick={() => addToCart(p, v)} className="h-auto py-3 flex flex-col items-start gap-1 border-border/40 hover:border-primary/50 text-left">
                      <span className="font-bold text-xs truncate w-full">{p.name}</span>
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground">{v.name} - {formatPHP(v.price)}</span>
                    </Button>
                  ))
                ) : (
                  <Button key={p._id} type="button" variant="outline" onClick={() => addToCart(p)} className="h-auto py-3 flex flex-col items-start gap-1 border-border/40 hover:border-primary/50 text-left">
                    <span className="font-bold text-xs truncate w-full">{p.name}</span>
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground">{formatPHP(p.sellingPrice)}</span>
                  </Button>
                )
              ))}
            </div>
          </div>

          {/* Cart Summary */}
          {cart.length > 0 && (
            <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
              <div className="p-4 bg-muted/20 border-b border-border/40">
                <Label className="text-[10px] font-black uppercase tracking-widest">Order Summary</Label>
              </div>
              <div className="divide-y divide-border/40">
                {cart.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.variantName || 'Standard'} • {formatPHP(item.priceAtTimeOfOrder)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-muted/30 rounded-lg border border-border/40">
                        <button type="button" onClick={() => updateQuantity(idx, -1)} className="px-3 py-1 font-black hover:text-primary">-</button>
                        <span className="font-bold text-sm min-w-[20px] text-center">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(idx, 1)} className="px-3 py-1 font-black hover:text-primary">+</button>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeFromCart(idx)} className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment & Submit */}
          <div className="pt-6 border-t border-border/40 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Payable</span>
              <span className="text-3xl font-black text-primary">{formatPHP(totalAmount)}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment Status</Label>
                <select {...register("paymentStatus")} className="w-full h-12 px-3 rounded-lg border border-border/40 bg-background font-bold outline-none focus:border-primary">
                  <option value="UNPAID">Unpaid</option>
                  <option value="PARTIAL">Partial / Downpayment</option>
                  <option value="PAID">Fully Paid</option>
                </select>
              </div>
              {paymentStatus === "PARTIAL" && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount Paid</Label>
                  <Input type="number" {...register("amountPaid")} className="h-12 bg-muted/20 border-border/40 font-bold" />
                </div>
              )}
            </div>

            <Button type="submit" disabled={submitting || cart.length === 0} className="w-full h-14 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5 mr-2" /> Confirm Pre-Order</>}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}