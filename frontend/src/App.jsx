import React, { useContext, useState, useEffect } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import SalesPage from "./pages/SalesPage";
import StockHistoryPage from "./pages/StockHistoryPage";
import ExpensesPage from "./pages/ExpensesPage";
import ReportsPage from "./pages/ReportsPage";
import LoginPage from "./pages/LoginPage";
import "./App.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

export default function App() {
  const { user, logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation(); // Get the current location to check route changes

  // Update isMobile and auto-close sidebar on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Dynamically update the title based on the current route
  useEffect(() => {
    const path = location.pathname;
    switch (path) {
      case "/dashboard":
        document.title = "Dashboard - Mama R's";
        break;
      case "/products":
        document.title = "Products - Mama R's";
        break;
      case "/sales":
        document.title = "Sales - Mama R's";
        break;
      case "/stock-history":
        document.title = "Stock History - Mama R's";
        break;
      case "/expenses":
        document.title = "Expenses - Mama R's";
        break;
      case "/reports":
        document.title = "Reports - Mama R's";
        break;
      default:
        document.title = "Mama R's"; // Default title
        break;
    }
  }, [location.pathname]); // Run this effect whenever the route changes

  return (
    <div className={`app-container ${sidebarOpen ? "sidebar-open" : ""}`}>
      {/* === SIDEBAR === */}
      {user && (
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <h2 className="sidebar-title">Mama R's</h2>

          <nav className="sidebar-nav">
            <Link to="/dashboard" className="nav-link">
              <i className="bi bi-speedometer2"></i>
              <span>Dashboard</span>
            </Link>
            <Link to="/products" className="nav-link">
              <i className="bi bi-box-seam"></i>
              <span>Products</span>
            </Link>
            <Link to="/sales" className="nav-link">
              <i className="bi bi-receipt"></i>
              <span>Sales</span>
            </Link>
            <Link to="/stock-history" className="nav-link">
              <i className="bi bi-clock-history"></i>
              <span>Stock History</span>
            </Link>
            <Link to="/expenses" className="nav-link">
              <i className="bi bi-cash-coin"></i>
              <span>Expenses</span>
            </Link>
            <Link to="/reports" className="nav-link">
              <i className="bi bi-graph-up"></i>
              <span>Reports</span>
            </Link>
          </nav>

          <button className="logout-btn" onClick={logout}>
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </aside>
      )}

      {/* === OVERLAY === */}
      {user && isMobile && sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* === MAIN CONTENT === */}
      <main className="main-content">
        {/* Sidebar toggle button on mobile */}
        {user && isMobile && (
          <button
            className="toggle-sidebar-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className="bi bi-list"></i>
          </button>
        )}

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
