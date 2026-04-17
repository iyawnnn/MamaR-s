import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Layout,
  Clock,
  FileText,
  LogOut,
  ClipboardList,
  BookOpen,
  Boxes,
  CheckSquare,
  ReceiptText,
  Wallet
} from "lucide-react";
import logoUrl from "@/assets/logo/mama-rs-logo.png";

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext) || {};

  const handleLogout = () => {
    if (logout) logout();
    navigate("/login");
  };

  const operationalItems = [
    { name: "Dashboard", icon: Layout, path: "/dashboard" },
    { name: "Active Orders", icon: ClipboardList, path: "/orders" },
    { name: "End of Day", icon: CheckSquare, path: "/reconciliation" },
  ];

  const inventoryItems = [
    { name: "Product Catalog", icon: BookOpen, path: "/catalog" },
    { name: "Stock Levels", icon: Boxes, path: "/inventory" },
    { name: "Expenses", icon: Wallet, path: "/expenses" },
    { name: "Audit Logs", icon: Clock, path: "/stock-history" },
    { name: "Reports", icon: FileText, path: "/reports" },
  ];

  return (
    <aside className="flex h-full w-full flex-col bg-transparent text-foreground transition-all duration-300 border-r border-border/40">
      <div className="flex h-24 items-center justify-center my-3">
        <div className="rounded-3xl">
          <img
            src={logoUrl}
            alt="Mama R's Application Logo"
            className="pt-3 h-32 w-32 object-contain"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-6 py-4 space-y-8 no-scrollbar">
        <div>
          <p className="mb-4 px-2 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/40">
            Operations
          </p>
          <div className="space-y-1">
            {operationalItems.map((item) => (
              <SidebarLink key={item.path} item={item} onClose={onClose} />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-4 px-2 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/40">
            Data & Finance
          </p>
          <div className="space-y-1">
            {inventoryItems.map((item) => (
              <SidebarLink key={item.path} item={item} onClose={onClose} />
            ))}
          </div>
        </div>
      </nav>

      <div className="shrink-0 p-6">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start rounded-2xl px-4 py-4 text-sm font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300 group"
        >
          <LogOut 
            className="mr-4 h-5 w-5 text-muted-foreground/60 group-hover:text-primary transition-colors" 
            aria-hidden="true" 
          />
          <span className="tracking-tight">Sign Out</span>
        </Button>
      </div>
    </aside>
  );
};

const SidebarLink = ({ item, onClose }: { item: any; onClose?: () => void }) => (
  <NavLink
    to={item.path}
    onClick={onClose}
    className={({ isActive }) =>
      `group flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-200 ${
        isActive
          ? "bg-primary/10 text-primary shadow-sm"
          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
      }`
    }
  >
    {({ isActive }) => (
      <>
        <item.icon
          className={`h-5 w-5 transition-colors ${
            isActive
              ? "text-primary"
              : "text-muted-foreground/60 group-hover:text-foreground"
          }`}
          aria-hidden="true"
        />
        <span className="tracking-tight">{item.name}</span>
      </>
    )}
  </NavLink>
);

export default Sidebar;