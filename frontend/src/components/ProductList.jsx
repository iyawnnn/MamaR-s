import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { 
  Plus, Edit3, Trash2, RefreshCcw, 
  AlertTriangle, Layers 
} from "lucide-react";
import ProductForm from "./ProductForm";
import RestockModal from "./RestockModal";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [restockTarget, setRestockTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

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

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${productToDelete._id}`);
      fetchProducts();
      setShowDeleteModal(false);
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <div>
          <h2 className="text-3xl font-bold text-stone-800 font-display">Inventory</h2>
          <p className="text-stone-500 mt-1">Manage stock, prices, and product variants.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-amber-500 text-stone-900 px-6 py-3 rounded-xl hover:bg-amber-400 transition-all font-bold shadow-lg shadow-amber-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-stone-400">Loading inventory...</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {products.map((p) => {
            const isLowStock = p.lowStock;

            return (
              <div key={p._id} className={`bg-white rounded-2xl border-2 ${isLowStock ? 'border-red-100 shadow-red-50' : 'border-stone-100'} shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col`}>
                
                <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-stone-800 font-display">{p.name}</h3>
                    <div className="flex gap-2 mt-2">
                       {p.hasVariants ? (
                         <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
                           <Layers className="w-3 h-3" /> {p.variants.length} Sizes
                         </span>
                       ) : (
                         <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-wider">
                           Single Item
                         </span>
                       )}
                       {isLowStock && (
                         <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider">
                           <AlertTriangle className="w-3 h-3" /> Low Stock
                         </span>
                       )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="block text-xs font-bold text-stone-400 uppercase tracking-wider">Total Stock</span>
                    <span className={`text-3xl font-bold ${isLowStock ? 'text-red-600' : 'text-emerald-600'}`}>
                      {p.stock}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1">
                  {p.hasVariants ? (
                    <div className="bg-stone-50 rounded-xl border border-stone-200 overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-stone-100 text-stone-500 uppercase text-xs font-bold">
                          <tr>
                            <th className="px-4 py-2">Size</th>
                            <th className="px-4 py-2">Price</th>
                            <th className="px-4 py-2 text-right">Stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                          {p.variants.map((v, i) => (
                            <tr key={i} className={v.stock <= (v.lowStockThreshold || 5) ? "bg-red-50" : ""}>
                              <td className="px-4 py-3 font-medium text-stone-800">{v.name}</td>
                              <td className="px-4 py-3 text-stone-600">₱{v.price}</td>
                              <td className={`px-4 py-3 text-right font-bold ${v.stock <= (v.lowStockThreshold || 5) ? "text-red-600" : "text-emerald-600"}`}>
                                {v.stock}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-stone-50 p-4 rounded-xl border border-stone-200">
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase">Selling Price</p>
                        <p className="text-2xl font-bold text-amber-600">₱{p.sellingPrice.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-stone-400 uppercase">Alert Level</p>
                        <p className="text-lg font-bold text-stone-700">&lt; {p.lowStockThreshold}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-stone-50 border-t border-stone-100 grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => setRestockTarget(p)} 
                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white border border-stone-200 text-stone-600 font-bold text-sm hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm"
                  >
                    <RefreshCcw className="w-4 h-4" /> Restock
                  </button>
                  <button 
                    onClick={() => { setEditing(p); setShowForm(true); }} 
                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white border border-stone-200 text-stone-600 font-bold text-sm hover:border-amber-500 hover:text-amber-600 transition-all shadow-sm"
                  >
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                  <button 
                    onClick={() => { setProductToDelete(p); setShowDeleteModal(true); }} 
                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white border border-stone-200 text-stone-600 font-bold text-sm hover:border-red-500 hover:text-red-600 transition-all shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {showForm && <ProductForm product={editing} onClose={() => { setShowForm(false); fetchProducts(); }} />}
      {restockTarget && <RestockModal product={restockTarget} onClose={() => { setRestockTarget(null); fetchProducts(); }} />}
      
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm text-center">
            <h3 className="text-lg font-bold text-stone-800 mb-2">Delete Product?</h3>
            <p className="text-stone-500 text-sm mb-6">Are you sure? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 border border-stone-200 rounded-xl font-bold text-stone-600">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}