import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { X, Save, Plus, Trash2, Box, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Variant {
  name: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
}

interface ProductFormProps {
  product?: any;
  onClose: () => void;
}

export default function ProductForm({ product, onClose }: ProductFormProps) {
  const [form, setForm] = useState({
    name: "",
    hasVariants: false,
    sellingPrice: 0,
    stock: 0,
    lowStockThreshold: 5,
    variants: [] as Variant[],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        hasVariants: product.hasVariants || false,
        sellingPrice: product.sellingPrice || 0,
        stock: product.stock || 0,
        lowStockThreshold: product.lowStockThreshold || 5,
        variants: product.variants || [],
      });
    }
  }, [product]);

  const addVariant = () => {
    setForm({
      ...form,
      variants: [
        ...form.variants,
        { name: "", price: 0, stock: 0, lowStockThreshold: 5 },
      ],
    });
  };

  const removeVariant = (index: number) => {
    const newVariants = [...form.variants];
    newVariants.splice(index, 1);
    setForm({ ...form, variants: newVariants });
  };

  const handleVariantChange = (index: number, field: keyof Variant, value: any) => {
    const newVariants = [...form.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setForm({ ...form, variants: newVariants });
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.hasVariants) {
      if (form.variants.length === 0) {
        alert("Please add at least one configuration variant.");
        return;
      }
      for (const v of form.variants) {
        if (!v.name.trim()) {
          alert("All variants must have a designated name.");
          return;
        }
      }
    }

    setSaving(true);
    try {
      if (product) {
        await api.put(`/products/${product._id}`, form);
      } else {
        await api.post("/products", form);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      const data = err?.response?.data;
      
      if (data?.error === 'Validation failed' && data?.details) {
        const zodErrors = data.details.map((d: any) => d.message).join(" | ");
        alert(`Validation Error: ${zodErrors}`);
      } else {
        alert(data?.message || data?.error || "Save operation failed.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <form
        onSubmit={handleSubmit}
        className="bg-card w-full max-w-xl rounded-2xl border border-border/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300"
      >
        <div className="px-8 py-5 border-b border-border/40 flex justify-between items-center bg-muted/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Box className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-bold text-lg text-foreground tracking-tight">
              {product ? "Update Architecture" : "New Item Designation"}
            </h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-8 overflow-y-auto space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              Primary Designation
            </label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-12 bg-background border-border/40 focus-visible:ring-1 focus-visible:ring-primary text-base"
              placeholder="Enter product identifier..."
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-xl border border-border/40">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                id="hasVariants"
                checked={form.hasVariants}
                onChange={(e) =>
                  setForm({ ...form, hasVariants: e.target.checked })
                }
                className="w-5 h-5 accent-primary cursor-pointer"
              />
            </div>
            <label
              htmlFor="hasVariants"
              className="text-sm font-semibold text-foreground cursor-pointer select-none flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-muted-foreground" />
              Enable multi-variant architecture
            </label>
          </div>

          {!form.hasVariants ? (
            <div className="grid grid-cols-2 gap-6 p-6 rounded-xl border border-border/40 bg-card shadow-sm">
              <div className="col-span-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                  Standard Parameters
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Base Rate (₱)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={form.sellingPrice}
                  onChange={(e) =>
                    setForm({ ...form, sellingPrice: Number(e.target.value) })
                  }
                  className="bg-background border-border/40 focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Initial Stock
                </label>
                <Input
                  type="number"
                  required
                  value={form.stock}
                  onChange={(e) =>
                    setForm({ ...form, stock: Number(e.target.value) })
                  }
                  className="bg-background border-border/40 focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Depletion Alert Threshold
                </label>
                <Input
                  type="number"
                  value={form.lowStockThreshold}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lowStockThreshold: Number(e.target.value),
                    })
                  }
                  className="bg-background border-border/40 focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-end pb-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  Configured Variants
                </label>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 px-2 py-1 rounded-md">
                  {form.variants.length} active
                </span>
              </div>

              {form.variants.map((variant, index) => (
                <div
                  key={index}
                  className="flex gap-4 items-start bg-muted/10 p-4 rounded-xl border border-border/40 animate-in slide-in-from-top-2 duration-200"
                >
                  <div className="flex-1 space-y-4">
                    <Input
                      placeholder="Variant Identifier (e.g. Pro, Basic)"
                      value={variant.name}
                      onChange={(e) =>
                        handleVariantChange(index, "name", e.target.value)
                      }
                      className="bg-background border-border/40 h-10"
                    />
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-1.5">
                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">
                          Rate (₱)
                        </span>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={variant.price}
                          onChange={(e) =>
                            handleVariantChange(index, "price", Number(e.target.value))
                          }
                          className="bg-background border-border/40 h-9 text-sm"
                        />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">
                          Stock
                        </span>
                        <Input
                          type="number"
                          placeholder="0"
                          value={variant.stock}
                          onChange={(e) =>
                            handleVariantChange(index, "stock", Number(e.target.value))
                          }
                          className="bg-background border-border/40 h-9 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVariant(index)}
                    className="mt-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg h-10 w-10 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addVariant}
                className="w-full h-12 border-dashed border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-muted/20 transition-all rounded-xl mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="text-[11px] font-bold uppercase tracking-widest">
                  Append Configuration
                </span>
              </Button>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border/40 bg-muted/10 flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="h-11 px-6 rounded-xl text-xs font-bold uppercase tracking-widest"
          >
            Abort
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="h-11 px-8 bg-primary text-white hover:bg-primary/90 shadow-lg rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
          >
            {saving ? (
              <span className="animate-pulse">Syncing...</span>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Commit Record
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}