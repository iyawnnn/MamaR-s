import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Layout,
  Clock,
  FileText,
  LogOut,
  Settings,
  ClipboardList,
  BookOpen,
  Boxes,
  CheckSquare
} from "lucide-react";
import logoUrl from "@/assets/logo/mama-rs-logo.png";

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const navigate = useNavigate();
  
  // 1. Extract the logout function from your context
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    // 2. Clear the token and state before routing
    if (logout) {
      logout();
    }
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", icon: Layout, path: "/dashboard" }, // Updated path
    { name: "Active Orders", icon: ClipboardList, path: "/orders" },
    { name: "Product Catalog", icon: BookOpen, path: "/catalog" },
    { name: "Stock Levels", icon: Boxes, path: "/inventory" },
    { name: "Stock Logs", icon: Clock, path: "/stock-history" },
    { name: "Accounting Hub", icon: FileText, path: "/reports" },
    { name: "End of Day", icon: CheckSquare, path: "/reconciliation" },
  ];

  return (
    <aside className="flex h-full w-full flex-col bg-background text-foreground transition-all duration-300">
      <div className="flex h-24 shrink-0 items-center gap-3 px-8">
        <img
          src={logoUrl}
          alt="Mama R's Logo"
          className="h-10 w-10 object-contain drop-shadow-sm"
          style={{ minWidth: "40px" }}
        />
        <h1 className="font-serif mt-1 text-2xl font-black uppercase leading-none tracking-tighter text-primary">
          Mama R's
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        <p className="mb-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
          Core Management
        </p>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `group flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`h-5 w-5 transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground/70 group-hover:text-foreground"
                  }`}
                  aria-hidden="true"
                />
                <span className="tracking-tight">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="shrink-0 p-6 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start rounded-2xl px-4 py-3.5 text-sm font-bold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
        >
          <Settings className="mr-4 h-5 w-5" aria-hidden="true" />
          Settings
        </Button>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start rounded-2xl px-4 py-3.5 text-sm font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut className="mr-4 h-5 w-5" aria-hidden="true" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;