import React, { useState } from "react";
import { formatDateISO } from "../utils/dateUtils";
import "./DateRangePicker.css"; // 👈 we'll move responsive styles here

export default function DateRangePicker({ onChange, initialStart, initialEnd }) {
  const [start, setStart] = useState(
    initialStart || formatDateISO(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000))
  );
  const [end, setEnd] = useState(initialEnd || formatDateISO(new Date()));

  const apply = () => onChange({ start, end });

  const quick = (days) => {
    const e = new Date();
    const s = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000);
    setStart(formatDateISO(s));
    setEnd(formatDateISO(e));
    onChange({ start: formatDateISO(s), end: formatDateISO(e) });
  };

  return (
    <div className="date-range-container">
      {/* Quick Buttons */}
      <div className="date-quick">
        <button onClick={() => quick(7)} className="date-btn">7d</button>
        <button onClick={() => quick(30)} className="date-btn">30d</button>
      </div>

      {/* Inputs + Apply */}
      <div className="date-inputs">
        <label className="date-label">
          From
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="date-input"
          />
        </label>

        <label className="date-label">
          To
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="date-input"
          />
        </label>

        <button onClick={apply} className="date-btn">Apply</button>
      </div>
    </div>
  );
}
