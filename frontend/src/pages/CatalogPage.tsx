import React, { useState, useEffect, useCallback } from "react";
import api from "@/services/api";
import { Plus, Edit3, Trash2, Layers, BookOpen, Loader2 } from "lucide-react";
import { formatPHP } from "@/utils/currency";
import { Button } from "@/components/ui/button";

// We will recreate the ProductForm in a future step to use react-hook-form
// For now, we stub the actions so the UI is fully functional visually.

export default function CatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
      setProducts(res.data.products || res.data || []);
    } catch (err) {
      console.error("fetch products", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div className="space-y-1">
          <h1 className="text-4xl sm:text-5xl tracking-tight font-black text-foreground" style={{ fontFamily: '"Instrument Serif", serif' }}>
            Product Catalog
          </h1>
          <p className="text-muted-foreground font-sans text-sm font-medium">
            Define your menu, pricing, and product variants.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl uppercase tracking-widest text-[10px] gap-2 px-6 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      {loading ? (
        <div className="flex h-[40vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {products.map((p) => (
            <div 
              key={p._id} 
              className="group bg-card rounded-3xl border-none shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-border/40 bg-muted/20 flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-foreground flex items-center justify-center shrink-0 shadow-inner">
                    <BookOpen className="w-5 h-5 text-background" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-foreground tracking-tight">{p.name}</h3>
                    <div className="flex gap-2 mt-2">
                       {p.hasVariants ? (
                         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                           <Layers className="w-3 h-3" /> {p.variants.length} Sizes
                         </span>
                       ) : (
                         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                           Single Item
                         </span>
                       )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1">
                {p.hasVariants ? (
                  <div className="bg-background rounded-2xl border border-border/40 overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/30 text-muted-foreground uppercase text-[10px] font-black tracking-widest">
                        <tr>
                          <th className="px-5 py-3">Variant Size</th>
                          <th className="px-5 py-3 text-right">Base Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {p.variants.map((v: any, i: number) => (
                          <tr key={i} className="hover:bg-muted/10 transition-colors">
                            <td className="px-5 py-4 font-bold text-foreground">{v.name}</td>
                            <td className="px-5 py-4 text-right font-black text-primary">
                              {formatPHP(v.price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-background p-5 rounded-2xl border border-border/40">
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Base Selling Price</p>
                      <p className="text-3xl font-black text-foreground mt-1">{formatPHP(p.sellingPrice)}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-muted/10 border-t border-border/40 grid grid-cols-2 gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" className="w-full font-bold tracking-widest text-[10px] uppercase border-border/40 hover:bg-background">
                  <Edit3 className="w-3.5 h-3.5 mr-2" /> Edit Details
                </Button>
                <Button variant="outline" className="w-full font-bold tracking-widest text-[10px] uppercase border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}