// frontend/src/components/ExpenseForm.jsx
import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

const CATEGORIES = ['Ingredients','Rent','Utilities','Packaging','Salaries','Other'];

export default function ExpenseForm({ expense = null, onClose }) {
  const [form, setForm] = useState({
    name: '',
    amount: '',
    category: 'Other',
    date: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (expense) {
      setForm({
        name: expense.name,
        amount: expense.amount,
        category: expense.category || 'Other',
        date: expense.date ? new Date(expense.date).toISOString().slice(0,10) : '',
        notes: expense.notes || ''
      });
    }
  }, [expense]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || form.amount === '' || Number(form.amount) < 0) return alert('Please enter valid name and amount');

    setSaving(true);
    try {
      if (expense) {
        await axios.put(`/expenses/${expense._id}`, {
          name: form.name,
          amount: Number(form.amount),
          category: form.category,
          date: form.date,
          notes: form.notes
        });
      } else {
        await axios.post('/expenses', {
          name: form.name,
          amount: Number(form.amount),
          category: form.category,
          date: form.date,
          notes: form.notes
        });
      }
      onClose();
    } catch (err) {
      alert(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.2)' }}>
      <form onSubmit={handleSubmit} style={{ background:'white', padding:16, borderRadius:6, minWidth:320 }}>
        <h3>{expense ? 'Edit' : 'Add'} Expense</h3>
        <label>Name</label>
        <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />

        <label>Amount (₱)</label>
        <input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />

        <label>Category</label>
        <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label>Date</label>
        <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />

        <label>Notes</label>
        <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />

        <div style={{ marginTop:12 }}>
          <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>{' '}
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
