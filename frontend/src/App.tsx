import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthContext } from "./contexts/AuthContext";

import DefaultLayout from "./components/DefaultLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import OrdersPage from "./pages/OrdersPage";
import StockHistoryPage from "./pages/StockHistoryPage";
import ReportsPage from "./pages/ReportsPage";
import CatalogPage from "./pages/CatalogPage"; 
import InventoryPage from "./pages/InventoryPage";
import ReconciliationPage from "./pages/ReconciliationPage";
import ExpensePage from "./pages/ExpensePage"; // Added import

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-background text-primary gap-4">
    <Loader2 className="w-10 h-10 animate-spin" />
    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
      Mama R's System
    </span>
  </div>
);

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <LoadingScreen />;

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <DefaultLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/stock-history" element={<StockHistoryPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/expenses" element={<ExpensePage />} /> {/* Registered Route */}
        <Route path="/reconciliation" element={<ReconciliationPage />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DefaultLayout>
  );
}

export default App;