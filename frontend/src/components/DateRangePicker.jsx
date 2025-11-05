import React, { useState } from 'react';
import { formatDateISO } from '../utils/dateUtils';

export default function DateRangePicker({ onChange, initialStart, initialEnd }) {
  const [start, setStart] = useState(initialStart || formatDateISO(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)));
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
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        width: '100%',
        justifyContent: 'flex-start',
      }}
    >
      {/* Quick Buttons */}
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button onClick={() => quick(7)} style={buttonStyle}>7d</button>
        <button onClick={() => quick(30)} style={buttonStyle}>30d</button>
      </div>

      {/* Inputs + Apply */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          flexGrow: 1,
          minWidth: '260px',
        }}
      >
        <label style={labelStyle}>
          From
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          To
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            style={inputStyle}
          />
        </label>

        <button onClick={apply} style={buttonStyle}>
          Apply
        </button>
      </div>

      {/* Responsive adjustments */}
      <style>
        {`
          @media (max-width: 600px) {
            div[style*="display: flex"][style*="align-items: center"] {
              justify-content: space-between;
              gap: 6px;
            }

            input[type="date"] {
              width: 100px;
            }

            button {
              padding: 5px 10px;
            }

            label {
              font-size: 13px;
            }
          }
        `}
      </style>
    </div>
  );
}

// === Reusable Styles ===
const buttonStyle = {
  background: 'var(--primary)',
  color: '#fff',
  padding: '6px 12px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  transition: 'background-color 0.3s, transform 0.2s',
  whiteSpace: 'nowrap',
};

const inputStyle = {
  padding: '6px',
  borderRadius: '8px',
  border: '1px solid var(--accent2)',
  marginLeft: '8px',
  minWidth: '120px',
  maxWidth: '150px',
  flexShrink: 0,
};

const labelStyle = {
  fontSize: '14px',
  color: 'var(--primary)',
  display: 'flex',
  alignItems: 'center',
  whiteSpace: 'nowrap',
};
