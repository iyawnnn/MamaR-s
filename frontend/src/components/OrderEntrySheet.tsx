import React, { useState, useEffect } from "react";
import { format } from "date-fns";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Minus, Plus, ShoppingBag, Loader2, CalendarIcon, ChevronDown, Trash2 } from "lucide-react";
import api from "@/services/api";
import { formatPHP } from "@/utils/currency";
import { cn } from "@/lib/utils";

interface OrderEntrySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Represents an item added to the active order
type CartItem = {
  id: string; // Unique ID for the cart row
  product: any;
  variant: any | null;
  quantity: number;
};

export default function OrderEntrySheet({ open, onOpenChange, onSuccess }: OrderEntrySheetProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [catalog, setCatalog] = useState<any[]>([]);
  
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [targetDate, setTargetDate] = useState<Date | undefined>(new Date());
  
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    if (open) {
      loadCatalog();
      resetForm();
    }
  }, [open]);

  const loadCatalog = async () => {
    setFetchingProducts(true);
    try {
      const response = await api.get("/products");
      const data = response.data.products || response.data || [];
      setCatalog(data);
    } catch (error) {
      console.error("Failed to load catalog", error);
    } finally {
      setFetchingProducts(false);
    }
  };

  const resetForm = () => {
    setCustomerName("");
    setCustomerContact("");
    setTargetDate(new Date());
    setCart([]);
  };

  // Add a base product to the cart
  const addToCart = (product: any) => {
    const defaultVariant = product.hasVariants && product.variants?.length > 0 ? product.variants[0] : null;
    setCart([
      ...cart,
      {
        id: Math.random().toString(36).substr(2, 9),
        product,
        variant: defaultVariant,
        quantity: 1,
      },
    ]);
  };

  const updateCartItemQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const updateCartItemVariant = (id: string, variantName: string) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const selectedVariant = item.product.variants.find((v: any) => v.name === variantName);
          return { ...item, variant: selectedVariant };
        }
        return item;
      })
    );
  };

  const removeCartItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => {
      const price = item.variant ? item.variant.price : item.product.price;
      return sum + price * item.quantity;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Order requires at least one item.");
    if (!customerName || !targetDate) return alert("Required customer details are missing.");

    setLoading(true);
    try {
      const payload = {
        customerName,
        customerContact,
        targetDate: targetDate.toISOString(),
        items: cart.map((item) => ({
          product: item.product._id,
          variant: item.variant ? item.variant.name : undefined,
          quantity: item.quantity,
          priceAtTimeOfOrder: item.variant ? item.variant.price : item.product.price,
        })),
        totalAmount: calculateTotal(),
        status: "PENDING",
        paymentStatus: "UNPAID",
      };

      await api.post("/orders", payload);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create order", error);
      alert("Failed to submit order. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Strict solid background (bg-white) to prevent lag and bleed-through */}
      <SheetContent className="w-full sm:max-w-[500px] p-0 flex flex-col bg-white border-l border-border/20 shadow-2xl">
        
        {/* Header */}
        <div className="p-8 pb-6 border-b border-border/20 shrink-0">
          <SheetHeader>
            <SheetTitle className="font-serif text-4xl font-black tracking-tight text-foreground">
              New Order
            </SheetTitle>
            <SheetDescription className="text-xs font-semibold text-muted-foreground mt-1">
              Configure fulfillment request and client details.
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* High-Performance Native Scroll Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
          <form id="order-form" onSubmit={handleSubmit} className="space-y-10">
            
            {/* 1. Client Information */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary border-b border-border/20 pb-2">
                Client Architecture
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Client Name</Label>
                  <Input 
                    required 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="h-11 bg-white border-border/40 rounded-lg shadow-sm font-semibold focus-visible:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Contact</Label>
                    <Input 
                      value={customerContact}
                      onChange={(e) => setCustomerContact(e.target.value)}
                      placeholder="+63 900..."
                      className="h-11 bg-white border-border/40 rounded-lg shadow-sm font-semibold focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-2 flex flex-col">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Target Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-11 justify-start text-left font-semibold rounded-lg border-border/40 bg-white shadow-sm hover:bg-muted/20",
                            !targetDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-3 h-4 w-4 opacity-50" />
                          {targetDate ? format(targetDate, "MMM d, yyyy") : <span>Select</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white border-border/40 rounded-xl shadow-xl" align="start">
                        <Calendar
                          mode="single"
                          selected={targetDate}
                          onSelect={setTargetDate}
                          initialFocus
                          className="p-3"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Active Cart */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary border-b border-border/20 pb-2">
                Active Order ({cart.length})
              </h3>
              
              <div className="space-y-3">
                {cart.length === 0 ? (
                  <div className="p-8 border border-dashed border-border/60 rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
                    <ShoppingBag className="w-8 h-8 mb-3 opacity-20" />
                    <span className="text-sm font-medium">Select items from the catalog below.</span>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="p-4 bg-white border border-border/40 rounded-xl shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-foreground tracking-tight">{item.product.name}</span>
                        <button 
                          type="button" 
                          onClick={() => removeCartItem(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Custom Select for Variants to avoid extra package installs */}
                        {item.product.hasVariants && item.product.variants?.length > 0 && (
                          <div className="relative flex-1">
                            <select
                              value={item.variant?.name || ""}
                              onChange={(e) => updateCartItemVariant(item.id, e.target.value)}
                              className="w-full h-9 pl-3 pr-8 text-xs font-semibold bg-muted/20 border border-border/40 rounded-lg appearance-none outline-none focus:border-primary"
                            >
                              {item.product.variants.map((v: any) => (
                                <option key={v.name} value={v.name}>
                                  {v.name} - {formatPHP(v.price)}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                          </div>
                        )}

                        {!item.product.hasVariants && (
                          <span className="flex-1 text-sm font-semibold text-muted-foreground">
                            {formatPHP(item.product.price)}
                          </span>
                        )}

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-1 shrink-0 bg-muted/20 border border-border/40 rounded-lg p-0.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => updateCartItemQuantity(item.id, -1)}
                            className="h-7 w-7 rounded-md hover:bg-white"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center font-bold text-sm tabular-nums">
                            {item.quantity}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => updateCartItemQuantity(item.id, 1)}
                            className="h-7 w-7 rounded-md hover:bg-white text-primary"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 3. Catalog Selection */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary border-b border-border/20 pb-2">
                Product Catalog
              </h3>
              
              {fetchingProducts ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {catalog.map((product) => (
                    <button
                      key={product._id}
                      type="button"
                      onClick={() => addToCart(product)}
                      className="flex flex-col items-start p-3 bg-white border border-border/40 rounded-xl shadow-sm hover:border-primary/40 hover:bg-primary/5 transition-all text-left group"
                    >
                      <span className="text-sm font-bold text-foreground tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                        {product.name}
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground mt-1">
                        {product.hasVariants ? "Multiple Sizes" : formatPHP(product.price)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-4" /> {/* Scroll margin */}
          </form>
        </div>

        {/* Pinned Footer */}
        <div className="p-8 bg-white border-t border-border/20 shrink-0 z-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
          <div className="flex items-end justify-between mb-5 px-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Total Order Value
            </span>
            <span className="text-3xl font-black text-foreground tracking-tighter tabular-nums">
              {formatPHP(calculateTotal())}
            </span>
          </div>
          <Button 
            form="order-form"
            type="submit" 
            disabled={loading || cart.length === 0}
            className="w-full h-14 rounded-xl bg-primary text-white hover:bg-primary/90 font-bold uppercase tracking-widest text-xs shadow-md shadow-primary/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 mb-0.5" /> 
                Finalize Order
              </>
            )}
          </Button>
        </div>

      </SheetContent>
    </Sheet>
  );
}