import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Sidebar.css";

// We accept isMobile and onClose as props now
export default function Sidebar({ open, isMobile, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLinkClick = () => {
    // If we are on mobile, close sidebar when navigating
    if (isMobile && onClose) {
      onClose();
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  const navItems = [
    { label: "Dashboard", to: "/dashboard", icon: "bi-speedometer2" },
    { label: "Products", to: "/products", icon: "bi-box-seam" },
    { label: "Sales", to: "/sales", icon: "bi-receipt" },
    { label: "Inventory", to: "/stock-history", icon: "bi-clipboard-data" },
    { label: "Expenses", to: "/expenses", icon: "bi-wallet2" },
    { label: "Reports", to: "/reports", icon: "bi-pie-chart" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`sidebar ${open ? "open" : "collapsed"}`}>
      {/* === BRANDING === */}
      <div className="sidebar-header">
        <div className="logo-container">
          <i className="bi bi-shop-window"></i>
        </div>
        <div className="brand-info">
          <span className="brand-name">Mama R's</span>
          <span className="brand-tagline">Admin Panel</span>
        </div>
        
        {/* Mobile Close Button (X) */}
        {isMobile && (
          <button className="mobile-close-btn" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        )}
      </div>

      {/* === NAVIGATION === */}
      <nav className="nav-section">
        <p className="nav-category">Menu</p>
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link 
                to={item.to} 
                className={`nav-link ${isActive(item.to) ? 'active' : ''}`}
                onClick={handleLinkClick} // Trigger close on mobile
              >
                <span className="icon-box">
                  <i className={`bi ${item.icon}`}></i>
                </span>
                <span className="link-text">{item.label}</span>
                {isActive(item.to) && <span className="active-dot"></span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* === FOOTER === */}
      <div className="sidebar-footer">
        <button className="footer-link logout" onClick={logout} title="Log Out">
          <i className="bi bi-box-arrow-right"></i>
          <span className="footer-text">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}