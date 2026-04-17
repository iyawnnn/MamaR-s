import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthContext } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Components & Layout
import DefaultLayout from "./components/DefaultLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import SalesPage from "./pages/SalesPage";
import StockHistoryPage from "./pages/StockHistoryPage";
import ReportsPage from "./pages/ReportsPage";
import ExpensePage from "./pages/ExpensePage";
import OrdersPage from "./pages/OrdersPage";

// Minimalist loading screen matching the new high-contrast theme
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

  // Enforce authentication routing
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // The DefaultLayout now handles the Sidebar, Mobile Header, and responsive padding globally.
  // All pages rendered inside these routes will automatically fit into the main content area.
  return (
    <DefaultLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/stock-history" element={<StockHistoryPage />} />
        <Route path="/orders" element={<OrdersPage />} />
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