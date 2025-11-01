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
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      {/* Quick Select Buttons */}
      <div>
        <button
          onClick={() => quick(7)}
          style={{
            background: 'var(--primary)',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.3s, transform 0.2s',
          }}
        >
          7d
        </button>
        <button
          onClick={() => quick(30)}
          style={{
            background: 'var(--primary)',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.3s, transform 0.2s',
            marginLeft: '8px',
          }}
        >
          30d
        </button>
      </div>

      {/* Date Range Inputs */}
      <div>
        <label style={{ fontSize: '14px', color: 'var(--primary)' }}>
          From <input type="date" value={start} onChange={(e) => setStart(e.target.value)} style={{ padding: '6px', borderRadius: '8px', border: '1px solid var(--accent2)', marginLeft: '8px' }} />
        </label>
        <label style={{ fontSize: '14px', color: 'var(--primary)', marginLeft: '8px' }}>
          To <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} style={{ padding: '6px', borderRadius: '8px', border: '1px solid var(--accent2)', marginLeft: '8px' }} />
        </label>
        <button
          onClick={apply}
          style={{
            background: 'var(--primary)',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.3s, transform 0.2s',
            marginLeft: '8px',
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
