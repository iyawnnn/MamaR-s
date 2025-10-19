import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

export default function Dashboard() {
  const [sales, setSales] = useState([]);
  const [expensesList, setExpensesList] = useState([]);
  const [grossSales, setGrossSales] = useState(0);
  const [cogs, setCogs] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [grossProfit, setGrossProfit] = useState(0);
  const [netProfit, setNetProfit] = useState(0);

  // ✅ Fetch sales and expenses
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, expensesRes] = await Promise.all([
          axios.get('/sales'),
          axios.get('/expenses')
        ]);

        const salesData = salesRes.data;
        const expenseData = expensesRes.data;

        setSales(salesData);
        setExpensesList(expenseData);

        // 🧮 Compute totals
        const totalGross = salesData.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
        const totalCOGS = salesData.reduce(
          (sum, sale) => sum + ((sale.productId?.costPrice || 0) * sale.quantity),
          0
        );
        const totalExpenses = expenseData.reduce((sum, e) => sum + (e.amount || 0), 0);

        const grossProfit = totalGross - totalCOGS;
        const netProfit = grossProfit - totalExpenses;

        setGrossSales(totalGross);
        setCogs(totalCOGS);
        setExpenses(totalExpenses);
        setGrossProfit(grossProfit);
        setNetProfit(netProfit);
      } catch (err) {
        console.error('❌ Failed to load dashboard data:', err);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>DIOFANY'S Bakery — Inventory</h2>
      <h3>Dashboard</h3>

      <div style={{ lineHeight: '1.8em' }}>
        <p>Gross Sales: ₱{grossSales.toFixed(2)}</p>
        <p>COGS: ₱{cogs.toFixed(2)}</p>
        <p>Gross Profit: ₱{grossProfit.toFixed(2)}</p>
        <p>Expenses: ₱{expenses.toFixed(2)}</p>
        <p>Net Profit: ₱{netProfit.toFixed(2)}</p>
      </div>
    </div>
  );
}
