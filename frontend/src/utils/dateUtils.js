// date utilities (no extra deps)
export const formatDateISO = (d) => d.toISOString().slice(0,10);

export const getDateRangeArray = (startISO, endISO) => {
  const start = new Date(startISO + 'T00:00:00');
  const end = new Date(endISO + 'T00:00:00');
  const arr = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    arr.push(formatDateISO(new Date(d)));
  }
  return arr;
};

// Fill missing dates in aggregated series with zeros for specified keys (e.g., net,gross,cogs)
export const fillMissingDates = (series, startISO, endISO, keys = ['net', 'gross', 'cogs', 'discounts']) => {
  const dates = getDateRangeArray(startISO, endISO);
  const map = new Map(series.map(s => [s.date, s]));
  return dates.map(date => {
    if (map.has(date)) {
      const row = map.get(date);
      // ensure keys exist
      keys.forEach(k => { if (row[k] === undefined) row[k] = 0; });
      return row;
    }
    const empty = { date };
    keys.forEach(k => empty[k] = 0);
    return empty;
  });
};
