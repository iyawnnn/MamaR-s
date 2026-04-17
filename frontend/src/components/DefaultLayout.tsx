import React, { useState } from "react";
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";
import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import logoUrl from "@/assets/logo/mama-rs-logo.png";

export default function DefaultLayout({
  children,
}: React.PropsWithChildren<unknown>) {
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      {/* 1. Desktop Left Sidebar - Now using the slightly darker muted background */}
      <div className="hidden lg:flex w-64 shrink-0 border-r border-border/40 bg-muted/30 z-20">
        <Sidebar />
      </div>

      {/* 2. Main Workspace - Now using the primary light background */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background relative z-10">
        <header className="xl:hidden flex items-center justify-between p-4 shrink-0 border-b border-border/40 bg-muted/30 backdrop-blur-md z-30">
          <Sheet open={isLeftOpen} onOpenChange={setIsLeftOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:bg-muted/50 rounded-xl h-10 w-10 shrink-0"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Toggle mobile menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="p-0 w-72 border-none bg-muted/30 shadow-2xl"
            >
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <Sidebar onClose={() => setIsLeftOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Logo" className="h-7 w-7 object-contain" />
          </div>

          <Sheet open={isRightOpen} onOpenChange={setIsRightOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:bg-muted/50 rounded-xl h-10 w-10 shrink-0 relative"
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Toggle context menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="p-0 w-[85vw] sm:w-96 border-none bg-muted/30 shadow-2xl"
            >
              <SheetTitle className="sr-only">Context Menu</SheetTitle>
              <RightSidebar />
            </SheetContent>
          </Sheet>
        </header>

        <div className="flex-1 overflow-y-auto px-4 pb-8 pt-6 md:px-10 md:pb-12 md:pt-10 scroll-smooth no-scrollbar">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </div>
      </main>

      {/* 3. Desktop Right Sidebar - Now using the slightly darker muted background */}
      <div className="hidden xl:flex w-80 shrink-0 border-l border-border/40 bg-muted/30 z-20">
        <RightSidebar />
      </div>
    </div>
  );
}