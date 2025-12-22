import React, { useState } from "react";
import "./DateRangePicker.css";

export default function DateRangePicker({ onChange, initialStart, initialEnd }) {
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [preset, setPreset] = useState("7d"); // Default to 7 days

  // Helper to calculate dates based on preset
  const applyPreset = (value) => {
    setPreset(value);
    const endDate = new Date();
    const startDate = new Date();

    if (value === "7d") {
      startDate.setDate(endDate.getDate() - 7);
    } else if (value === "30d") {
      startDate.setDate(endDate.getDate() - 30);
    } else if (value === "month") {
      startDate.setDate(1); // 1st of current month
    } else {
      return; // Custom, do nothing
    }

    // Format to YYYY-MM-DD local
    const toLocalISO = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const sStr = toLocalISO(startDate);
    const eStr = toLocalISO(endDate);

    setStart(sStr);
    setEnd(eStr);
    
    // Auto-fire event for presets
    if (onChange) onChange({ start: sStr, end: eStr });
  };

  const handleManualChange = () => {
    setPreset("custom");
    if (onChange) onChange({ start, end });
  };

  return (
    <div className="date-picker-container">
      {/* 1. Quick Select Dropdown */}
      <div className="preset-wrapper">
        <select 
          className="preset-select" 
          value={preset} 
          onChange={(e) => applyPreset(e.target.value)}
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="month">This Month</option>
          <option value="custom">Custom Range</option>
        </select>
        <i className="bi bi-chevron-down select-icon"></i>
      </div>

      <div className="vertical-divider"></div>

      {/* 2. Manual Inputs */}
      <div className="date-inputs-wrapper">
        <div className="input-group">
          <input
            type="date"
            className="date-input"
            value={start}
            onChange={(e) => {
              setStart(e.target.value);
              setPreset("custom");
            }}
          />
        </div>
        <span className="separator">to</span>
        <div className="input-group">
          <input
            type="date"
            className="date-input"
            value={end}
            onChange={(e) => {
              setEnd(e.target.value);
              setPreset("custom");
            }}
          />
        </div>
      </div>

      {/* 3. Apply Button (Only needed for custom adjustments) */}
      <button 
        className={`apply-btn ${preset === 'custom' ? 'active' : ''}`} 
        onClick={handleManualChange}
        title="Refresh Data"
      >
        <i className="bi bi-arrow-clockwise"></i>
      </button>
    </div>
  );
}