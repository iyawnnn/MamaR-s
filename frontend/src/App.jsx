// frontend/src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import axios from './api/axios';
import ProductsPage from './pages/ProductsPage';
import SalesPage from './pages/SalesPage';
import StockHistoryPage from './pages/StockHistoryPage';
import ExpensesPage from './pages/ExpensesPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';

export default function App() {
  // Set dev auth header for now (devtoken defined in backend)
  useEffect(() => {
    axios.devAuth();
  }, []);

  return (
    <BrowserRouter>
      <div style={{ padding: 16, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <header style={{ marginBottom: 16 }}>
          <h1>DIOFANY'S Bakery — Inventory</h1>
          <nav style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <Link to="/">Dashboard</Link>
            <Link to="/products">Products</Link>
            <Link to="/sales">Sales</Link>
            <Link to="/stock-history">Stock History</Link>
            <Link to="/expenses">Expenses</Link>
            <Link to="/report">Report</Link>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/stock-history" element={<StockHistoryPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/report" element={<ReportsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
