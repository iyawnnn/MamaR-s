import React from "react";
import Sidebar from "./Sidebar";

export default function DefaultLayout({ children }: React.PropsWithChildren<unknown>) {
  return (
    <div className="flex h-screen bg-background text-text-main overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background p-6 md:p-10">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}