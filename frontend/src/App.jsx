import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Removed BrowserRouter
import Sidebar from './components/Sidebar';
import Dashboard from './pages/DashboardPage';

function App() {
  return (
    <div className="flex min-h-screen bg-stone-50 text-stone-800">
      {/* Sidebar is fixed on the left */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          
          {/* Placeholder routes for other pages */}
          <Route path="/inventory" element={<div className="p-4">Inventory Page (Coming Soon)</div>} />
          <Route path="/orders" element={<div className="p-4">Orders Page (Coming Soon)</div>} />
          <Route path="/recipes" element={<div className="p-4">Recipes Page (Coming Soon)</div>} />
          <Route path="/settings" element={<div className="p-4">Settings Page (Coming Soon)</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;