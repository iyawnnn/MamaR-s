import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Sidebar.css";

export default function Sidebar({ open }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", to: "/dashboard", icon: "bi bi-house" },
    { label: "Products", to: "/products", icon: "bi bi-box-seam" },
    { label: "Sales", to: "/sales", icon: "bi bi-receipt" },
    { label: "Stock History", to: "/stock-history", icon: "bi bi-clock-history" },
    { label: "Expenses", to: "/expenses", icon: "bi bi-cash-coin" },
    { label: "Reports", to: "/reports", icon: "bi bi-graph-up" },
  ];

  return (
    <aside className={`sidebar ${open ? "open" : "collapsed"}`}>
      {/* Branding */}
      <div className="sidebar-header">
        <img
          src="/logo192.png"
          alt="Logo"
          className="logo"
        />
        <span className="brand-text">Mama R's</span>
      </div>

      {/* Navigation */}
      <nav className="nav-section">
        <p className="nav-label">Activities</p>
        <ul>
          {navItems.map((item) => (
            <li key={item.label}>
              <Link to={item.to} className="nav-link">
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="nav-footer">
        <Link to="/profile" className="nav-link">
          <i className="bi bi-gear"></i>
          <span>Edit Preferences</span>
        </Link>
        <button className="nav-link logout-btn" onClick={logout}>
          <i className="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
