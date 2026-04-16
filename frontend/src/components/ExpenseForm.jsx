import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createExpense } from '../services/api';

export default function ExpenseForm() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Ingredients'
  });

  const mutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setFormData({ description: '', amount: '', category: 'Ingredients' });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;
    mutation.mutate({
      ...formData,
      amount: Number(formData.amount)
    });
  };

  return (
    <div className="bg-surface border border-border p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-text-main">Log New Expense</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        <div className="flex flex-col gap-1">
          <label className="text-sm text-text-muted">Description</label>
          <input 
            type="text" 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="bg-background border border-border p-2 rounded text-text-main focus:outline-none focus:border-primary transition-colors"
            placeholder="e.g., Flour delivery"
            required
          />
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm text-text-muted">Amount (PHP)</label>
            <input 
              type="number" 
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="bg-background border border-border p-2 rounded text-text-main focus:outline-none focus:border-primary transition-colors"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm text-text-muted">Category</label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="bg-background border border-border p-2 rounded text-text-main focus:outline-none focus:border-primary transition-colors"
            >
              <option value="Ingredients">Ingredients</option>
              <option value="Packaging">Packaging</option>
              <option value="Utilities">Utilities</option>
              <option value="Equipment">Equipment</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={mutation.isPending}
          className="mt-2 bg-primary hover:bg-primary-hover text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving...' : 'Record Expense'}
        </button>
      </form>
    </div>
  );
}