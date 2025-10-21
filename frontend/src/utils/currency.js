export const formatPHP = (v) => new Intl.NumberFormat('en-PH', { style:'currency', currency:'PHP' }).format(v || 0);
