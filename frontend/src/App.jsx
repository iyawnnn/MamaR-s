import React, { useContext } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import SalesPage from "./pages/SalesPage";
import StockHistoryPage from "./pages/StockHistoryPage";
import ExpensesPage from "./pages/ExpensesPage";
import ReportsPage from "./pages/ReportsPage";
import LoginPage from "./pages/LoginPage";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>; // or a spinner

  return user ? children : <Navigate to="/login" />;
};

export default function App() {
  const { user, logout } = useContext(AuthContext);

  return (

    <div>
      {user && (
        <header style={{ marginBottom: 16 }}>
          <h1>Bakery — Inventory</h1>
          <nav style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/products">Products</Link>
            <Link to="/sales">Sales</Link>
            <Link to="/stock-history">Stock History</Link>
            <Link to="/expenses">Expenses</Link>
            <Link to="/reports">Reports</Link>
            <button
              onClick={logout}
              style={{ marginLeft: 20, color: "red", cursor: "pointer" }}
            >
              Logout
            </button>
          </nav>
        </header>
      )}

      <main>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/products"
            element={
              <PrivateRoute>
                <ProductsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <PrivateRoute>
                <SalesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/stock-history"
            element={
              <PrivateRoute>
                <StockHistoryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <PrivateRoute>
                <ExpensesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <ReportsPage />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}
