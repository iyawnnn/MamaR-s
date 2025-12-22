// date utilities (no extra deps)

// FIXED: Use local time components to avoid UTC timezone shift
export const formatDateISO = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDateRangeArray = (startISO, endISO) => {
  const start = new Date(startISO + 'T00:00:00');
  const end = new Date(endISO + 'T00:00:00');
  const arr = [];
  // Loop using local dates
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    arr.push(formatDateISO(new Date(d)));
  }
  return arr;
};

// Fill missing dates in aggregated series
export const fillMissingDates = (series, startISO, endISO, keys = ['net', 'gross', 'cogs', 'discounts']) => {
  const dates = getDateRangeArray(startISO, endISO);
  const map = new Map(series.map(s => [s.date, s]));
  return dates.map(date => {
    if (map.has(date)) {
      const row = map.get(date);
      keys.forEach(k => { if (row[k] === undefined) row[k] = 0; });
      return row;
    }
    const empty = { date };
    keys.forEach(k => empty[k] = 0);
    return empty;
  });
};