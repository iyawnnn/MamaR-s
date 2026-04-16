import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

export default function DefaultLayout({ children }) {
  // If you had state for mobile toggling here previously, you can re-add it, 
  // but this is the core structural wrapper required for the new theme.
  
  return (
    <div className="flex h-screen bg-background text-text-main overflow-hidden font-sans">
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-background p-6 md:p-10">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}