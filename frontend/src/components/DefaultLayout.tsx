import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";
import { Menu, ShoppingCart, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import logoUrl from "@/assets/logo/mama-rs-logo.png";

export default function DefaultLayout({ children }: React.PropsWithChildren<unknown>) {
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(false);
  const location = useLocation();
  
  const isSalesPage = location.pathname === "/sales";

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      
      {/* Desktop Left Navigation */}
      <div className="hidden lg:flex w-64 shrink-0 border-r border-border/40 bg-background z-20">
        <Sidebar />
      </div>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background relative z-10">
        
        {/* Mobile & Tablet Header */}
        <header className="xl:hidden flex items-center justify-between p-4 shrink-0 border-b border-border/40 bg-background/80 backdrop-blur-md z-30">
          
          {/* Left: Navigation Trigger */}
          <Sheet open={isLeftOpen} onOpenChange={setIsLeftOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted/50 rounded-xl h-10 w-10 shrink-0">
                <Menu className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Toggle mobile menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 border-none bg-background shadow-2xl">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <Sidebar onClose={() => setIsLeftOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Center: Brand */}
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Mama R's Logo" className="h-8 w-8 object-contain" />
            <span className="font-sans text-lg font-black uppercase tracking-tighter text-primary">
              Mama R's
            </span>
          </div>
          
          {/* Right: Context / Cart Trigger */}
          <Sheet open={isRightOpen} onOpenChange={setIsRightOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted/50 rounded-xl h-10 w-10 shrink-0 relative">
                {isSalesPage ? (
                   <>
                     <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                     {/* Notification dot for an active cart could go here */}
                     <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
                   </>
                ) : (
                   <Bell className="h-5 w-5" aria-hidden="true" />
                )}
                <span className="sr-only">Toggle context menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-[85vw] sm:w-96 border-none bg-background shadow-2xl">
              <SheetTitle className="sr-only">Context Menu</SheetTitle>
              {/* RightSidebar handles its own internal rendering logic! */}
              <RightSidebar />
            </SheetContent>
          </Sheet>

        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-8 pt-6 md:px-10 md:pb-12 md:pt-10 scroll-smooth no-scrollbar">
          <div className="mx-auto w-full max-w-[1400px]">
            {children}
          </div>
        </div>
      </main>

      {/* Desktop Right Context Panel (Hidden on screens smaller than xl) */}
      <div className="hidden xl:flex w-80 shrink-0 border-l border-border/40 bg-background z-20">
        <RightSidebar />
      </div>

    </div>
  );
}