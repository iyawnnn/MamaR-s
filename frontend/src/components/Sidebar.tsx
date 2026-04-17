import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import logoUrl from "@/assets/logo/mama-rs-logo.png";

export default function DefaultLayout({ children }: React.PropsWithChildren<unknown>) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      
      {/* Desktop Navigation - Full Width Sidebar */}
      <div className="hidden lg:flex w-64 shrink-0 border-r border-border/40 bg-background z-20">
        <Sidebar />
      </div>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background relative z-10">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="lg:hidden flex items-center justify-between p-4 shrink-0 border-b border-border/40 bg-background/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Mama R's Logo" className="h-8 w-8 object-contain" />
            <span className="font-display text-lg font-black uppercase tracking-tighter text-foreground">
              Mama R's
            </span>
          </div>
          
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted/50 rounded-xl h-10 w-10">
                <Menu className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Toggle mobile menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 border-none bg-background shadow-2xl">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <Sidebar onClose={() => setIsMobileOpen(false)} />
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content Render Area */}
        <div className="flex-1 overflow-y-auto px-4 pb-8 pt-6 md:px-10 md:pb-12 md:pt-10 scroll-smooth">
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}