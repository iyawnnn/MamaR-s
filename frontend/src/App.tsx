import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthContext } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import DefaultLayout from "./components/DefaultLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import OrdersPage from "./pages/OrdersPage";
import StockHistoryPage from "./pages/StockHistoryPage";
import ReportsPage from "./pages/ReportsPage";
import ExpensePage from "./pages/ExpensePage";

// We will build these two next to replace ProductsPage
import CatalogPage from "./pages/CatalogPage"; 
import InventoryPage from "./pages/InventoryPage";

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
        <Route path="/" element={<DashboardPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        
        {/* Separated Product & Inventory Routes */}
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        
        <Route path="/stock-history" element={<StockHistoryPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <ExpensePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DefaultLayout>
  );
}

export default App;