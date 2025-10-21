// DateRangePicker.jsx
import React, { useState } from 'react';
import { formatDateISO } from '../utils/dateUtils';

export default function DateRangePicker({ onChange, initialStart, initialEnd }) {
  const [start, setStart] = useState(initialStart || formatDateISO(new Date(Date.now() - 6*24*60*60*1000)));
  const [end, setEnd] = useState(initialEnd || formatDateISO(new Date()));

  const apply = () => onChange({ start, end });

  const quick = (days) => {
    const e = new Date();
    const s = new Date(Date.now() - (days-1)*24*60*60*1000);
    setStart(formatDateISO(s)); setEnd(formatDateISO(e));
    onChange({ start: formatDateISO(s), end: formatDateISO(e) });
  };

  return (
    <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
      <div>
        <button onClick={() => quick(7)}>7d</button>
        <button onClick={() => quick(30)} style={{ marginLeft:8 }}>30d</button>
      </div>

      <div>
        <label>
          From <input type="date" value={start} onChange={e => setStart(e.target.value)} />
        </label>
        <label style={{ marginLeft:8 }}>
          To <input type="date" value={end} onChange={e => setEnd(e.target.value)} />
        </label>
        <button onClick={apply} style={{ marginLeft:8 }}>Apply</button>
      </div>
    </div>
  );
}
