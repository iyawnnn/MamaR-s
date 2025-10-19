import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Other');
  const [notes, setNotes] = useState('');

  const loadExpenses = async () => {
    const { data } = await axios.get('/expenses');
    setExpenses(data);
  };

  useEffect(() => { loadExpenses(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/expenses', { name, amount: Number(amount), category, notes });
    setName(''); setAmount(''); setCategory('Other'); setNotes('');
    await loadExpenses();
    alert('✅ Expense recorded!');
  };

  return (
    <div>
      <h2>Expenses</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
        <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required />
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option>Supplies</option>
          <option>Utilities</option>
          <option>Rent</option>
          <option>Wages</option>
          <option>Other</option>
        </select>
        <textarea placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} />
        <button type="submit">Add Expense</button>
      </form>

      <h3>Expense Records</h3>
      <ul>
        {expenses.map(e => (
          <li key={e._id}>
            {e.name} — ₱{e.amount.toFixed(2)} ({e.category})
          </li>
        ))}
      </ul>
    </div>
  );
}
