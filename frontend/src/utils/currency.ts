export const formatPHP = (v: number | string | undefined | null): string => 
  new Intl.NumberFormat('en-PH', { style:'currency', currency:'PHP' }).format(Number(v) || 0);
