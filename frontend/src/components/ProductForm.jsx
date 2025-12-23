import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { X, Save, Plus, Trash2 } from 'lucide-react';

export default function ProductForm({ product, onClose }) {
  const [form, setForm] = useState({
    name: '',
    hasVariants: false,
    sellingPrice: 0,
    stock: 0,
    lowStockThreshold: 5,
    variants: [] 
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        hasVariants: product.hasVariants || false,
        sellingPrice: product.sellingPrice || 0,
        stock: product.stock || 0,
        lowStockThreshold: product.lowStockThreshold || 5,
        variants: product.variants || []
      });
    }
  }, [product]);

  const addVariant = () => {
    setForm({
      ...form,
      variants: [...form.variants, { name: '', price: 0, stock: 0, lowStockThreshold: 5 }]
    });
  };

  const removeVariant = (index) => {
    const newVariants = [...form.variants];
    newVariants.splice(index, 1);
    setForm({ ...form, variants: newVariants });
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...form.variants];
    newVariants[index][field] = value;
    setForm({ ...form, variants: newVariants });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // VALIDATION: Ensure variants have names if enabled
    if (form.hasVariants) {
      if (form.variants.length === 0) {
        alert("Please add at least one size variant.");
        return;
      }
      for (const v of form.variants) {
        if (!v.name.trim()) {
          alert("All size variants must have a name.");
          return;
        }
      }
    }

    setSaving(true);
    try {
      console.log("Submitting:", form); // Debug log to see what is sent
      if (product) {
        await axios.put(`/products/${product._id}`, form);
      } else {
        await axios.post('/products', form);
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <form onSubmit={handleSubmit} className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
          <h3 className="font-bold text-lg text-stone-800 font-display">{product ? 'Edit' : 'Add'} Product</h3>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Product Name</label>
            <input 
              required 
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })} 
              className="w-full p-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              placeholder="e.g. Creamy Choco"
            />
          </div>

          {/* Variants Toggle */}
          <div className="flex items-center gap-3 py-2 bg-amber-50 px-4 rounded-lg border border-amber-100">
            <input 
              type="checkbox" 
              id="hasVariants"
              checked={form.hasVariants}
              onChange={e => setForm({ ...form, hasVariants: e.target.checked })}
              className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="hasVariants" className="text-sm font-bold text-stone-700 cursor-pointer select-none">
              This product has different sizes/prices
            </label>
          </div>

          {!form.hasVariants ? (
            <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-100">
              <div className="col-span-2">
                 <p className="text-xs font-semibold text-stone-400 uppercase mb-3">Standard Pricing</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">Price (₱)</label>
                <input 
                  type="number" step="0.01" required
                  value={form.sellingPrice} 
                  onChange={e => setForm({ ...form, sellingPrice: Number(e.target.value) })} 
                  className="w-full p-2 border border-stone-200 rounded-lg focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">Stock Qty</label>
                <input 
                  type="number" required
                  value={form.stock} 
                  onChange={e => setForm({ ...form, stock: Number(e.target.value) })} 
                  className="w-full p-2 border border-stone-200 rounded-lg focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">Alert Threshold</label>
                <input 
                  type="number" 
                  value={form.lowStockThreshold} 
                  onChange={e => setForm({ ...form, lowStockThreshold: Number(e.target.value) })} 
                  className="w-full p-2 border border-stone-200 rounded-lg focus:border-amber-500 outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="block text-xs font-bold text-stone-500 uppercase">Product Sizes</label>
                <span className="text-xs text-stone-400">{form.variants.length} sizes added</span>
              </div>
              
              {form.variants.map((variant, index) => (
                <div key={index} className="flex gap-2 items-start bg-stone-50 p-3 rounded-lg border border-stone-200 animate-fade-in">
                  <div className="flex-1 space-y-2">
                    <input 
                      placeholder="Size Name (e.g. Mini, Regular)" 
                      value={variant.name}
                      onChange={e => handleVariantChange(index, 'name', e.target.value)}
                      className="w-full p-2 text-sm border border-stone-200 rounded focus:border-amber-500 outline-none"
                    />
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <span className="text-[10px] text-stone-400 uppercase font-bold">Price</span>
                        <input 
                          type="number" placeholder="0.00" 
                          value={variant.price}
                          onChange={e => handleVariantChange(index, 'price', Number(e.target.value))}
                          className="w-full p-2 text-sm border border-stone-200 rounded focus:border-amber-500 outline-none"
                        />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] text-stone-400 uppercase font-bold">Stock</span>
                        <input 
                          type="number" placeholder="0" 
                          value={variant.stock}
                          onChange={e => handleVariantChange(index, 'stock', Number(e.target.value))}
                          className="w-full p-2 text-sm border border-stone-200 rounded focus:border-amber-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeVariant(index)}
                    className="mt-6 text-stone-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              
              <button 
                type="button" 
                onClick={addVariant}
                className="w-full py-3 border-2 border-dashed border-stone-300 text-stone-500 rounded-xl text-sm font-bold hover:border-amber-400 hover:text-amber-500 hover:bg-amber-50 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Add Size Variant
              </button>
            </div>
          )}

        </div>

        <div className="p-6 border-t border-stone-100 bg-stone-50 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-2.5 text-stone-600 font-bold hover:bg-stone-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={saving} 
            className="px-8 py-2.5 bg-amber-500 text-stone-900 font-bold rounded-xl hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {saving ? 'Saving...' : <><Save size={18} /> Save Product</>}
          </button>
        </div>
      </form>
    </div>
  );
}