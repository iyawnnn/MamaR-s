import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import "./DefaultLayout.css";

export default function DefaultLayout({ children }) {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleResize = () => {
    const mobile = window.innerWidth <= 1024;
    setIsMobile(mobile);
    setIsOpen(!mobile);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="layout">
      {/* Sidebar */}
      <Sidebar open={isOpen} />

      {/* Overlay */}
      {isOpen && isMobile && (
        <div className="overlay" onClick={toggleSidebar}></div>
      )}

      {/* Main Content */}
      <main
        className={`main-content ${!isOpen && !isMobile ? "full-width" : ""}`}
      >
        <div className="content-body">{children}</div>
      </main>
    </div>
  );
}
