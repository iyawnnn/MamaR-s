import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  ChefHat, 
  Settings, 
  LogOut 
} from "lucide-react";

const Sidebar = () => {
  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Inventory", icon: Package, path: "/inventory" },
    { name: "Orders", icon: ShoppingCart, path: "/orders" },
    { name: "Recipes", icon: ChefHat, path: "/recipes" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-stone-200 h-screen flex flex-col fixed left-0 top-0 z-10">
      {/* Logo Section */}
      <div className="p-6 border-b border-stone-100">
        <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          <span className="text-orange-600">🍞</span> BakeryOS
        </h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-orange-50 text-orange-700"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              }`
            }
          >
            {/* We can use a render function or conditional styling for the icon color */}
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 ${isActive ? "text-orange-600" : "text-stone-400"}`} />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-stone-100">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-sm font-medium text-stone-600 hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;