import React, { useContext, Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthContext } from "./contexts/AuthContext";
import DefaultLayout from "./components/DefaultLayout";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const StockHistoryPage = lazy(() => import("./pages/StockHistoryPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const CatalogPage = lazy(() => import("./pages/CatalogPage")); 
const InventoryPage = lazy(() => import("./pages/InventoryPage"));
const ReconciliationPage = lazy(() => import("./pages/ReconciliationPage"));
const ExpensePage = lazy(() => import("./pages/ExpensePage"));

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
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <DefaultLayout>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/stock-history" element={<StockHistoryPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/expenses" element={<ExpensePage />} />
          <Route path="/reconciliation" element={<ReconciliationPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </DefaultLayout>
  );
}

export default App;