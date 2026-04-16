import React, { useState, useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Menu, Loader2, Wheat } from "lucide-react";
import { AuthContext } from "./contexts/AuthContext";

// Components
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import SalesPage from "./pages/SalesPage";
import StockHistoryPage from "./pages/StockHistoryPage";
import ReportsPage from "./pages/ReportsPage";
import ExpensePage from "./pages/ExpensePage";

// Professional loading spinner
const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 text-amber-600 gap-4">
    <Loader2 className="w-10 h-10 animate-spin" />
    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
      Mama R's System
    </span>
  </div>
);

function App() {
  const { user, loading } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) return <LoadingScreen />;

  // Force Login if no user
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    /* ✅ Added overflow-x-hidden here as a global safety net */
    <div className="flex min-h-screen bg-stone-100 font-sans text-stone-800 antialiased overflow-x-hidden">
      {/* STYLISH MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-stone-900/95 backdrop-blur-md text-white px-4 z-40 flex items-center justify-between border-b border-stone-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Wheat className="text-stone-950 w-5 h-5" />
          </div>
          <h1 className="text-lg font-black tracking-tighter font-display uppercase">
            Mama R's
          </h1>
        </div>

        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 bg-stone-800 text-stone-300 hover:text-white rounded-xl transition-all cursor-pointer border border-stone-700/50"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      {/* ✅ Added overflow-x-hidden to main to prevent the table from pushing the screen width */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen transition-all duration-300 overflow-x-hidden">
        {/* ✅ DYNAMIC PADDING & DESKTOP SPACING:
            - p-4: Mobile (Very tight)
            - lg:px-10: Fixes the 1024px-1280px squeeze
            - xl:px-16 2xl:px-24: Luxury margins for big monitors
        */}
        <div className="p-4 sm:p-8 lg:px-10 lg:py-12 xl:px-16 2xl:px-24 max-w-[1600px] mx-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/sales" element={<SalesPage />} />
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
        </div>
      </main>
    </div>
  );
}

export default App;
