import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShoppingCart, Plus, Loader2, User, DollarSign, Calendar, Package, Layers, Hash } from 'lucide-react';

export default function SalesForm({ onSaleRecorded }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [price, setPrice] = useState(''); 
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data.products || res.data || []);
      } catch (err) {
        console.error("Error loading products", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (!selectedProduct) {
      setPrice('');
      return;
    }
    if (selectedProduct.hasVariants && selectedVariant) {
      const variant = selectedProduct.variants.find(v => v.name === selectedVariant);
      if (variant) setPrice(variant.price);
    } else if (!selectedProduct.hasVariants) {
      setPrice(selectedProduct.sellingPrice);
    }
  }, [selectedProduct, selectedVariant]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    if (selectedProduct.hasVariants && !selectedVariant) {
      alert("Please select a size for this product.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName: customerName || 'Walk-in',
        targetDate: saleDate,
        status: 'FULFILLED',
        paymentStatus: 'PAID',
        items: [{
          product: selectedProduct._id,
          quantity: Number(quantity),
          priceAtTimeOfOrder: Number(price),
          variant: selectedVariant || undefined
        }]
      };

      await api.post('/orders', payload);
      
      setQuantity(1);
      setCustomerName('');
      setSelectedProduct(null);
      setSelectedVariant(null);
      setPrice('');
      
      if (onSaleRecorded) onSaleRecorded(); 
    } catch (err) {
      alert(err.response?.data?.message || 'Sale failed');
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = (Number(price) || 0) * (Number(quantity) || 1);
  const inputClass = "w-full h-12 px-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium text-stone-800 text-sm appearance-none";

  if (loading) return <div className="p-4 text-center text-stone-400">Loading products...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm mb-8 animate-fade-in">
      <div className="flex items-center gap-2 mb-6 border-b border-stone-100 pb-4">
        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
          <ShoppingCart size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-stone-800 leading-none">New Transaction</h3>
          <p className="text-xs text-stone-400 mt-1">Record a sale manually</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div>
            <label className="text-xs font-bold text-stone-500 uppercase mb-1 flex items-center gap-1">
              <Calendar size={12} /> Date
            </label>
            <input type="date" required className={inputClass} value={saleDate} onChange={e => setSaleDate(e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-500 uppercase mb-1 flex items-center gap-1">
              <User size={12} /> Customer
            </label>
            <input type="text" placeholder="John Doe" className={inputClass} value={customerName} onChange={e => setCustomerName(e.target.value)} />
          </div>

          <div className="relative">
            <label className="text-xs font-bold text-stone-500 uppercase mb-1 flex items-center gap-1">
              <Package size={12} /> Product
            </label>
            <select 
              className={inputClass} 
              value={selectedProduct?._id || ''} 
              onChange={(e) => {
                const prod = products.find(p => p._id === e.target.value);
                setSelectedProduct(prod);
                setSelectedVariant(null);
              }} 
              required
            >
              <option value="" disabled>Select a product</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name} {p.hasVariants ? '(Sizes Available)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-500 uppercase mb-1 flex items-center gap-1">
              <Layers size={12} /> Size / Variant
            </label>
            <select 
              className={`${inputClass} ${selectedProduct?.hasVariants ? 'bg-amber-50 border-amber-200 text-stone-900 font-bold' : 'opacity-50'}`} 
              value={selectedVariant || ''} 
              onChange={(e) => setSelectedVariant(e.target.value)} 
              disabled={!selectedProduct?.hasVariants}
            >
              <option value="" disabled>{selectedProduct?.hasVariants ? "Choose a size" : "Standard Size"}</option>
              {selectedProduct?.variants.map((v, idx) => (
                <option key={idx} value={v.name}>{v.name} (Stock: {v.stock})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-500 uppercase mb-1 flex items-center gap-1">
               <DollarSign size={12} /> Unit Price (₱)
            </label>
            <input type="number" step="0.01" required className={`${inputClass} font-bold text-emerald-700`} value={price} onChange={e => setPrice(e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-500 uppercase mb-1 flex items-center gap-1">
              <Hash size={12} /> Quantity
            </label>
            <div className="flex items-center h-12">
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-full px-4 bg-stone-100 rounded-l-xl border border-r-0 border-stone-200 hover:bg-stone-200 font-bold">-</button>
              <input type="number" min="1" required className="w-full h-full text-center border-y border-stone-200 outline-none font-bold bg-white" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
              <button type="button" onClick={() => setQuantity(quantity + 1)} className="h-full px-4 bg-stone-100 rounded-r-xl border border-l-0 border-stone-200 hover:bg-stone-200 font-bold">+</button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="text-right">
                <span className="block text-xs font-bold text-stone-400 uppercase tracking-wider">Total Payable</span>
                <span className="block text-3xl font-bold text-stone-800">₱{totalAmount.toLocaleString()}</span>
             </div>
          </div>
          
          <button type="submit" disabled={submitting || !selectedProduct} className="w-full md:w-auto px-8 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
            {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus size={20} />}
            Confirm Sale
          </button>
        </div>
      </form>
    </div>
  );
}