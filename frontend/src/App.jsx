import React, { useContext, useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";

// Components
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import SalesPage from "./pages/SalesPage";
import StockHistoryPage from "./pages/StockHistoryPage";
import ExpensesPage from "./pages/ExpensesPage";
import ReportsPage from "./pages/ReportsPage";
import LoginPage from "./pages/LoginPage";

import "./App.css";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="loading-screen">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

export default function App() {
  const { user } = useContext(AuthContext);
  
  // Define Mobile as 1024px (Tablet) and below
  const checkMobile = () => window.innerWidth <= 1024;
  
  const [sidebarOpen, setSidebarOpen] = useState(!checkMobile());
  const [isMobile, setIsMobile] = useState(checkMobile());
  const location = useLocation();

  // Wake up Render backend
  useEffect(() => {
    fetch("https://mamar-s.onrender.com/api/ping").catch(() => {});
  }, []);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = checkMobile();
      setIsMobile(mobile);
      // If we switch to Desktop, open sidebar automatically
      if (!mobile) setSidebarOpen(true);
      // If we switch to Mobile, close it by default
      if (mobile && !sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  // Set Page Titles
  useEffect(() => {
    const titles = {
      "/dashboard": "Dashboard",
      "/products": "Products",
      "/sales": "Sales",
      "/stock-history": "Stock",
      "/expenses": "Expenses",
      "/reports": "Reports",
      "/login": "Login"
    };
    const title = titles[location.pathname];
    document.title = title ? `${title} - Mama R's` : "Mama R's";
  }, [location.pathname]);

  const layoutClass = user ? "authenticated-layout" : "public-layout";

  return (
    <div className={`app-container ${layoutClass}`}>
      
      {/* Mobile Top Bar - Visible <= 1024px */}
      {user && isMobile && (
        <header className="mobile-header">
          <button 
            className="mobile-menu-btn" 
            onClick={() => setSidebarOpen(true)}
          >
            <i className="bi bi-list"></i>
          </button>
          <div className="mobile-brand">
            <i className="bi bi-shop-window"></i>
            <span>Mama R's</span>
          </div>
          <div className="mobile-spacer"></div>
        </header>
      )}

      {/* Sidebar */}
      {user && (
        <Sidebar 
          open={sidebarOpen} 
          isMobile={isMobile}
          onClose={() => setSidebarOpen(false)} 
        />
      )}

      {/* Overlay */}
      {user && isMobile && sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className={`main-content ${sidebarOpen && !isMobile ? "expanded" : ""}`}>
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/products" element={<PrivateRoute><ProductsPage /></PrivateRoute>} />
          <Route path="/sales" element={<PrivateRoute><SalesPage /></PrivateRoute>} />
          <Route path="/stock-history" element={<PrivateRoute><StockHistoryPage /></PrivateRoute>} />
          <Route path="/expenses" element={<PrivateRoute><ExpensesPage /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}