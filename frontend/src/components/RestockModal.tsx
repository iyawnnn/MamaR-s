import React, { useState } from 'react';
import api from '../services/api';
import { X, Package, Save, ArrowRight, Layers, Loader2, TrendingUp, TrendingDown } from 'lucide-react';

export default function RestockModal({ product, onClose }) {
  const [loading, setLoading] = useState(false);
  
  // State for Single Product (Initialize with current stock)
  const [newStock, setNewStock] = useState(product.hasVariants ? '' : product.stock);

  // State for Variants (Initialize with their current actual stock)
  const [variantStocks, setVariantStocks] = useState(
    product.hasVariants 
      ? product.variants.reduce((acc, v) => ({ ...acc, [v.name]: v.stock }), {}) 
      : {}
  );

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (product.hasVariants) {
        // Map the existing variants but replace the stock with the new user input
        const updatedVariants = product.variants.map(v => ({
          ...v,
          stock: Number(variantStocks[v.name])
        }));

        await api.put(`/products/${product._id}`, {
          variants: updatedVariants
        });

      } else {
        // Update the main stock field for single items
        await api.put(`/products/${product._id}`, {
          stock: Number(newStock)
        });
      }

      onClose();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
              <Package size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-stone-800 font-display">Update Inventory Count</h3>
              <p className="text-xs text-stone-500">{product.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="restock-form" onSubmit={handleSave} className="space-y-6">
            
            {!product.hasVariants ? (
              /* --- SINGLE ITEM VIEW --- */
              <div className="bg-stone-50 p-6 rounded-xl border border-stone-200">
                <div className="grid grid-cols-2 gap-6 items-center">
                  <div className="text-center border-r border-stone-200">
                    <p className="text-[10px] font-bold text-stone-400 uppercase mb-1 tracking-wider">Current</p>
                    <div className="text-3xl font-bold text-stone-400">{product.stock}</div>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-amber-600 uppercase mb-1 tracking-wider">New Actual Count</p>
                    <input 
                      type="number" 
                      min="0"
                      className="w-full h-14 text-center border-2 border-amber-200 rounded-xl focus:border-amber-500 outline-none font-bold text-2xl text-stone-800 bg-white"
                      value={newStock}
                      onChange={e => setNewStock(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
                
                {/* Visual indicator of change */}
                <div className="mt-4 flex justify-center">
                  {Number(newStock) > product.stock && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <TrendingUp size={14} /> Increasing stock by {Number(newStock) - product.stock}
                    </span>
                  )}
                  {Number(newStock) < product.stock && (
                    <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                      <TrendingDown size={14} /> Decreasing stock by {product.stock - Number(newStock)}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              /* --- VARIANTS VIEW --- */
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                   <Layers size={14} className="text-stone-400" />
                   <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Adjust Stock per Size</span>
                </div>
                
                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                  {product.variants.map((v, i) => (
                    <div key={i} className="flex items-center gap-4 bg-stone-50 p-4 rounded-xl border border-stone-100">
                      <div className="flex-1">
                        <p className="font-bold text-stone-800 text-sm">{v.name}</p>
                        <p className="text-[10px] text-stone-400 uppercase font-bold tracking-tighter">Was: {v.stock}</p>
                      </div>
                      
                      <div className="w-32">
                        <input 
                          type="number"
                          min="0"
                          className="w-full h-11 text-center font-bold text-stone-800 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                          value={variantStocks[v.name]}
                          onChange={(e) => setVariantStocks({...variantStocks, [v.name]: e.target.value})}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-stone-100 bg-stone-50 flex gap-3">
          <button 
            onClick={onClose}
            type="button"
            className="flex-1 py-3 text-stone-600 font-bold bg-white border border-stone-200 rounded-xl hover:bg-stone-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="restock-form"
            disabled={loading}
            className="flex-1 py-3 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save size={18} />}
            Set Actual Stock
          </button>
        </div>

      </div>
    </div>
  );
}