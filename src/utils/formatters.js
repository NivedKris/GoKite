/** Format a number as currency: 1234567.5 → "AED 1,234,567.50" */
export const fmtCurrency = (value, decimals = 2) => {
  if (value == null || isNaN(value)) return '—';
  // Use a non-breaking space after the currency code so the amount doesn't wrap
  return 'AED\u00A0' + Number(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/** Format an integer with thousands separator: 1234 → "1,234" */
export const fmtInt = (value) => {
  if (value == null || isNaN(value)) return '—';
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/** Format a percentage: 32.5 → "32.5%" */
export const fmtPct = (value, decimals = 1) => {
  if (value == null || isNaN(value)) return '—';
  return `${Number(value).toFixed(decimals)}%`;
};

/** Format a month key like "2026-02" → "Feb 2026" */
export const fmtMonth = (monthStr) => {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
};

/** Format a local Date to YYYY-MM-DD without UTC conversion */
const toLocalDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/** Get first and last day of a month from a Date object */
export const monthRange = (date) => {
  const y = date.getFullYear();
  const m = date.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  return {
    dateFrom: toLocalDateStr(first),
    dateTo: toLocalDateStr(last),
  };
};

/** Format a date object → "YYYY-MM" for input[type=month] */
export const toMonthInput = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

/** Parse "YYYY-MM" to a Date object (first of month) */
export const fromMonthInput = (str) => {
  const [y, m] = str.split('-');
  return new Date(Number(y), Number(m) - 1, 1);
};
