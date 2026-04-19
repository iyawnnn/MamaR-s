import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Minus, 
  Plus, 
  ShoppingBag, 
  Loader2, 
  CalendarIcon, 
  Trash2, 
  User, 
  PackageSearch,
  ShoppingCart,
  ChevronDown
} from "lucide-react";
import api, { updateOrder } from "@/services/api";
import { formatPHP } from "@/utils/currency";
import { cn } from "@/lib/utils";
import { IOrder } from "@/types";

interface OrderEntrySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: IOrder | null;
  order?: IOrder | null;
}

type CartItem = {
  id: string;
  product: any;
  variant: any | null;
  quantity: number;
};

export default function OrderEntrySheet({ open, onOpenChange, onSuccess, initialData }: OrderEntrySheetProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [catalog, setCatalog] = useState<any[]>([]);
  
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [targetDate, setTargetDate] = useState<Date | undefined>(new Date());
  
  const [cart, setCart] = useState<CartItem[]>([]);

  const isEditing = !!initialData;

  useEffect(() => {
    if (open) {
      loadCatalog();
      if (initialData) {
        setCustomerName(initialData.customerName);
        setCustomerContact(initialData.customerContact || "");
        setTargetDate(initialData.targetDate ? new Date(initialData.targetDate) : new Date());
        
        // Maps saved database items back into the local cart state format
        const hydratedCart = initialData.items.map((item: any) => ({
          id: item._id || Math.random().toString(36).substr(2, 9),
          product: item.product,
          variant: item.variant ? { name: item.variant, price: item.priceAtTimeOfOrder } : null,
          quantity: item.quantity,
        }));
        
        setCart(hydratedCart);
      } else {
        resetForm();
      }
    }
  }, [open, initialData]);

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

  const addToCart = (product: any, specificVariant: any = null) => {
    const variantToAdd = specificVariant || (product.hasVariants && product.variants?.length > 0 ? product.variants[0] : null);

    const existingItemIndex = cart.findIndex(
      item => item.product._id === product._id && item.variant?.name === variantToAdd?.name
    );

    if (existingItemIndex >= 0) {
      updateCartItemQuantity(cart[existingItemIndex].id, 1);
    } else {
      setCart([
        {
          id: Math.random().toString(36).substr(2, 9),
          product,
          variant: variantToAdd,
          quantity: 1,
        },
        ...cart,
      ]);
    }
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
      };

      if (isEditing && initialData) {
        await updateOrder(initialData._id, payload);
      } else {
        await api.post("/orders", {
          ...payload,
          status: "PENDING",
          paymentStatus: "UNPAID",
        });
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to execute order operation", error);
      alert("Failed to process request. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-5xl lg:max-w-6xl xl:max-w-7xl p-0 border-border/40 bg-card shadow-2xl overflow-hidden rounded-2xl gap-0 h-[85vh] max-h-[900px] flex flex-col">
        
        <div className="p-6 border-b border-border/40 bg-muted/10 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none">
             <ShoppingCart className="w-40 h-40 text-foreground" />
          </div>
          <DialogHeader className="relative z-10">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-serif font-black tracking-tight text-foreground">
                {isEditing ? "Modify Existing Order" : "Point of Sale Entry"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs font-medium text-muted-foreground ml-14">
              {isEditing ? "Adjust client details and product roster for this order." : "Construct a new client order and configure product sizing variants."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex flex-col-reverse lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden">
          
          <div className="w-full lg:w-[55%] flex flex-col border-t lg:border-t-0 lg:border-r border-border/40 bg-background min-w-0 shrink-0 lg:shrink">
            <div className="flex-1 lg:overflow-y-auto p-6 space-y-8 no-scrollbar">
              <form id="order-form" onSubmit={handleSubmit} className="space-y-8">
                
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 border-b border-border/40 pb-2">
                    <User className="w-3 h-3" /> Client Architecture
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Client Entity
                      </Label>
                      <Input 
                        required 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="h-12 bg-muted/10 border-border/40 focus-visible:ring-1 focus-visible:ring-primary rounded-xl font-bold px-4 text-sm w-full shadow-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2 min-w-0">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Contact Node
                        </Label>
                        <Input 
                          value={customerContact}
                          onChange={(e) => setCustomerContact(e.target.value)}
                          placeholder="+63 900..."
                          className="h-12 bg-muted/10 border-border/40 focus-visible:ring-1 focus-visible:ring-primary rounded-xl font-bold px-4 text-sm w-full shadow-sm"
                        />
                      </div>

                      <div className="space-y-2 flex flex-col min-w-0">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Target Execution
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "h-12 justify-start text-left font-bold rounded-xl border-border/40 bg-muted/10 hover:bg-muted/20 transition-all w-full px-4 shadow-sm truncate",
                                !targetDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-3 h-4 w-4 opacity-50 shrink-0" />
                              <span className="truncate">
                                {targetDate ? format(targetDate, "MMM d, yyyy") : "Select Date"}
                              </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 border-border/40 rounded-xl shadow-xl" align="end">
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

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <ShoppingCart className="w-3 h-3" /> Active Roster
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-muted/30 px-2 py-0.5 rounded-md text-muted-foreground">
                      {cart.length} Items
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {cart.length === 0 ? (
                      <div className="p-8 border border-dashed border-border/40 rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
                        <PackageSearch className="w-8 h-8 mb-3 opacity-20" />
                        <span className="text-xs font-bold uppercase tracking-widest text-center mt-2">Awaiting Selections <br/> <span className="text-[10px] opacity-60 normal-case">Add items from the catalog.</span></span>
                      </div>
                    ) : (
                      cart.map((item) => (
                        <div key={item.id} className="p-4 bg-muted/10 border border-border/40 rounded-xl flex flex-col gap-4 group relative transition-all hover:border-primary/30 hover:bg-muted/20">
                          
                          <div className="flex justify-between items-start gap-4">
                            <span className="font-black text-foreground tracking-tight truncate flex-1">
                              {item.product.name}
                            </span>
                            <button 
                              type="button" 
                              onClick={() => removeCartItem(item.id)}
                              className="text-muted-foreground hover:text-destructive transition-all shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            {item.product.hasVariants && item.product.variants?.length > 0 && (
                              <div className="w-full sm:w-[160px] shrink-0 min-w-0">
                                <Select 
                                  value={item.variant?.name || ""} 
                                  onValueChange={(val) => updateCartItemVariant(item.id, val)}
                                >
                                  <SelectTrigger className="h-9 bg-background border-border/40 font-bold text-xs rounded-lg focus:ring-primary shadow-sm w-full">
                                    <SelectValue placeholder="Select Size" />
                                  </SelectTrigger>
                                  <SelectContent className="border-border/40 rounded-lg">
                                    {item.product.variants.map((v: any) => (
                                      <SelectItem key={v.name} value={v.name} className="font-bold text-xs">
                                        {v.name} - {formatPHP(v.price)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                              <span className="text-sm font-black text-muted-foreground shrink-0">
                                {item.product.hasVariants 
                                  ? (item.variant ? formatPHP(item.variant.price) : "---")
                                  : formatPHP(item.product.price)}
                              </span>

                              <div className="flex items-center gap-1 shrink-0 bg-background border border-border/40 rounded-lg p-0.5 shadow-sm">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => updateCartItemQuantity(item.id, -1)}
                                  className="h-7 w-7 rounded-md hover:bg-muted/50"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-8 text-center font-black text-sm tabular-nums">
                                  {item.quantity}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => updateCartItemQuantity(item.id, 1)}
                                  className="h-7 w-7 rounded-md hover:bg-muted/50 text-primary"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 bg-muted/5 border-t border-border/40 shrink-0">
              <div className="flex items-center justify-between mb-4 gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground shrink-0">
                  Transaction Total
                </span>
                <span className="text-3xl sm:text-4xl font-black text-primary tracking-tighter tabular-nums leading-none text-right break-words max-w-[60%]">
                  {formatPHP(calculateTotal())}
                </span>
              </div>
              <Button 
                form="order-form"
                type="submit" 
                disabled={loading || cart.length === 0}
                className="w-full h-14 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-black uppercase tracking-widest text-[11px] transition-all disabled:opacity-50 shadow-lg"
              >
                {loading ? "Executing..." : (isEditing ? "Submit Modifications" : "Commit Order Request")}
              </Button>
            </div>
          </div>

          <div className="flex w-full lg:w-[45%] flex-col bg-muted/10 min-w-0 shrink-0 lg:shrink">
            <div className="p-6 border-b border-border/40 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <PackageSearch className="w-3 h-3" /> Catalog Directory
              </h3>
            </div>
            
            <div className="flex-1 lg:overflow-y-auto p-6 no-scrollbar">
              {fetchingProducts ? (
                <div className="flex justify-center items-center h-full py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-8">
                  {catalog.map((product) => {
                    const cardContent = (
                      <>
                        <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out pointer-events-none" />
                        <span className="text-sm font-black text-foreground tracking-tight group-hover:text-primary transition-colors truncate w-full relative z-10 pr-8">
                          {product.name}
                        </span>
                        <span className="text-[11px] font-bold text-muted-foreground mt-2 uppercase tracking-widest relative z-10 flex items-center gap-1">
                          {product.hasVariants ? (
                            <>Select Size <ChevronDown className="w-3 h-3" /></>
                          ) : (
                            formatPHP(product.price)
                          )}
                        </span>
                        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <Plus className="w-3 h-3 text-primary" />
                        </div>
                      </>
                    );

                    return product.hasVariants ? (
                      <Popover key={product._id}>
                        <PopoverTrigger asChild>
                          <button className="group flex flex-col items-start p-4 bg-background border border-border/40 rounded-xl shadow-sm hover:border-primary focus:border-primary focus:outline-none transition-all text-left relative overflow-hidden min-w-0 w-full">
                            {cardContent}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2 border-border/40 rounded-xl shadow-xl flex flex-col gap-1" align="start" side="bottom">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 py-1 mb-1">
                            Select Variant
                          </span>
                          {product.variants.map((v: any) => (
                            <button
                              key={v.name}
                              type="button"
                              onClick={() => addToCart(product, v)}
                              className="flex items-center justify-between px-3 py-2 hover:bg-primary hover:text-white rounded-lg transition-colors text-xs font-bold text-left w-full group/item"
                            >
                              <span>{v.name}</span>
                              <span className="opacity-70 group-hover/item:text-white group-hover/item:opacity-100 transition-colors">
                                {formatPHP(v.price)}
                              </span>
                            </button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <button
                        key={product._id}
                        type="button"
                        onClick={() => addToCart(product)}
                        className="group flex flex-col items-start p-4 bg-background border border-border/40 rounded-xl shadow-sm hover:border-primary focus:border-primary focus:outline-none transition-all text-left relative overflow-hidden min-w-0 w-full"
                      >
                        {cardContent}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}