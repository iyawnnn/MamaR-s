import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RestockModalProps {
  product: any;
  onClose: () => void;
}

export default function RestockModal({ product, onClose }: RestockModalProps) {
  const [loading, setLoading] = useState(false);
  const [newStock, setNewStock] = useState<number | "">("");
  const [variantStocks, setVariantStocks] = useState<Record<string, number | "">>({});

  useEffect(() => {
    if (product) {
      if (product.hasVariants) {
        setVariantStocks(
          product.variants.reduce((acc: any, v: any) => ({ ...acc, [v.name]: v.stock }), {})
        );
      } else {
        setNewStock(product.stock);
      }
    } else {
      setNewStock("");
      setVariantStocks({});
    }
  }, [product]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    
    setLoading(true);
    try {
      if (product.hasVariants) {
        const updatedVariants = product.variants.map((v: any) => ({
          ...v,
          stock: Number(variantStocks[v.name] || 0)
        }));

        await api.put(`/products/${product._id}`, {
          variants: updatedVariants
        });
      } else {
        await api.put(`/products/${product._id}`, {
          stock: Number(newStock || 0)
        });
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Inventory update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  return (
    <Dialog open={!!product} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-6 border-border/40 bg-card shadow-lg rounded-xl gap-6">
        
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-serif font-black tracking-tight text-foreground">
            Adjust Stock Level
          </DialogTitle>
          <DialogDescription className="text-xs font-medium text-muted-foreground">
            Modifying records for <span className="font-bold text-foreground">{product?.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <form id="restock-form" onSubmit={handleSave} className="space-y-6">
          {product && !product.hasVariants ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                <span>Current Quantity</span>
                <span>{product.stock}</span>
              </div>
              <Input
                required
                type="number"
                min="0"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                className="h-12 text-lg font-bold bg-background border-border/40 focus-visible:ring-1 focus-visible:ring-primary rounded-lg transition-all"
                placeholder="Enter new physical count"
              />
            </div>
          ) : product && (
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 mb-2">
                <span>Variant</span>
                <span>Count</span>
              </div>
              <div className="space-y-2">
                {product.variants.map((v: any, i: number) => (
                  <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-border/20 last:border-0">
                    <div className="flex-1">
                      <p className="font-bold text-foreground text-sm">{v.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5">
                        Current: {v.stock}
                      </p>
                    </div>
                    <div className="w-24">
                      <Input 
                        type="number"
                        min="0"
                        className="h-10 text-center font-bold bg-background border-border/40 focus-visible:ring-1 focus-visible:ring-primary rounded-lg"
                        value={variantStocks[v.name] ?? ""}
                        onChange={(e) => setVariantStocks({...variantStocks, [v.name]: e.target.value})}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-lg text-xs transition-all shadow-sm"
            >
              {loading ? "Saving Records..." : "Confirm Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}