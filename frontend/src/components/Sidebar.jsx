import React, { useContext, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  Croissant,
  ShoppingBag,
  History,
  BarChart3,
  LogOut,
  UserCircle,
  X,
  Wheat,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Inventory", icon: Croissant, path: "/products" },
    { name: "Sales (POS)", icon: ShoppingBag, path: "/sales" },
    { name: "Stock Logs", icon: History, path: "/stock-history" },
    { name: "Reports", icon: BarChart3, path: "/reports" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-stone-950 text-stone-400 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col border-r border-stone-800/50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header - Balanced Scaling */}
        <div className="h-20 flex items-center px-6 border-b border-stone-900 bg-stone-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Wheat className="text-stone-950 w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tighter font-display uppercase leading-none mt-1">
              Mama R's
            </h1>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden ml-auto text-stone-500 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation - Increased Font & Icon Size */}
        <nav className="flex-1 px-3 py-8 space-y-1.5 overflow-y-auto">
          <p className="px-4 text-[10px] font-black text-stone-700 uppercase tracking-[0.2em] mb-4">
            Core Management
          </p>

          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 1024 && onClose && onClose()}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3.5 rounded-xl text-[13px] font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-stone-900 text-white border border-stone-800 shadow-sm"
                    : "hover:bg-stone-900/50 hover:text-stone-200"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-[18px] h-[18px] transition-colors ${
                      isActive
                        ? "text-amber-500"
                        : "text-stone-700 group-hover:text-stone-400"
                    }`}
                  />
                  <span className="tracking-tight">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Profile Section */}
        <div className="p-5 border-t border-stone-900 bg-stone-950 shrink-0">
          <div className="flex items-center gap-3 mb-6 px-1">
            <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500">
              <UserCircle className="w-6 h-6" />
            </div>
            <div className="overflow-hidden text-left leading-tight">
              <p className="text-sm font-black text-white truncate uppercase tracking-tight">
                {user?.name || "Admin"}
              </p>
              <p className="text-[10px] text-stone-600 font-bold tracking-widest uppercase mt-1">
                Portal Access
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-stone-900 border border-stone-800 text-[10px] font-black uppercase tracking-widest text-stone-500 hover:text-red-400 hover:border-red-900/20 transition-all cursor-pointer active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;