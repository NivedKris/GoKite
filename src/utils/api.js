// ─────────────────────────────────────────────────────────────────────────────
// API base URL – empty string = same origin (proxied by Vite dev server / nginx).
// Override with VITE_API_BASE_URL at build time only if the API is on a
// completely different domain with CORS enabled.
// ─────────────────────────────────────────────────────────────────────────────
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Build a URLSearchParams string including repeated array params.
 * e.g.  buildParams({ date_from:'2026-02-01', date_to:'2026-02-28', 'company_ids[]':[1,2] })
 */
function buildParams(params) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => sp.append(key, v));
    } else if (value !== undefined && value !== null) {
      sp.append(key, value);
    }
  });
  return sp.toString();
}

async function apiFetch(path, params = {}) {
  const qs = buildParams(params);
  const url = `${BASE_URL}${path}${qs ? `?${qs}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

// ─── Param builder helpers ────────────────────────────────────────────────────
const base = (dateFrom, dateTo, companyIds) => ({
  date_from: dateFrom,
  date_to: dateTo,
  'company_ids[]': companyIds,
});

// ─── Endpoint functions ───────────────────────────────────────────────────────
export const api = {
  summary: (dateFrom, dateTo, companyIds) =>
    apiFetch('/api/dashboard/monthly-retail/summary', base(dateFrom, dateTo, companyIds)),

  departmentWise: (dateFrom, dateTo, companyIds) =>
    apiFetch('/api/dashboard/monthly-retail/department-wise', base(dateFrom, dateTo, companyIds)),

  salesTeamStaff: (dateFrom, dateTo, companyIds) =>
    apiFetch('/api/dashboard/monthly-retail/sales-team-staff', base(dateFrom, dateTo, companyIds)),

  frontlineServiceCount: (dateFrom, dateTo, companyIds) =>
    apiFetch('/api/dashboard/monthly-retail/frontline-service-count', base(dateFrom, dateTo, companyIds)),

  previousMonthComparison: (dateFrom, dateTo, companyIds, monthsBack = 12) =>
    apiFetch('/api/dashboard/monthly-retail/previous-month-comparison', {
      ...base(dateFrom, dateTo, companyIds),
      months_back: monthsBack,
    }),

  conversionDetails: (dateFrom, dateTo, companyIds, monthsBack = 12) =>
    apiFetch('/api/dashboard/monthly-retail/conversion-details', {
      ...base(dateFrom, dateTo, companyIds),
      months_back: monthsBack,
    }),

  totalReview: (dateFrom, dateTo, companyIds, monthsBack = 12) =>
    apiFetch('/api/dashboard/monthly-retail/total-review', {
      ...base(dateFrom, dateTo, companyIds),
      months_back: monthsBack,
    }),

  outstanding: (dateFrom, dateTo, companyIds) =>
    apiFetch('/api/dashboard/monthly-retail/outstanding', base(dateFrom, dateTo, companyIds)),

  abscondingSource: (dateFrom, dateTo, companyIds, monthsBack = 12) =>
    apiFetch('/api/dashboard/monthly-retail/absconding-source', {
      ...base(dateFrom, dateTo, companyIds),
      months_back: monthsBack,
    }),

  fineCollection: (dateFrom, dateTo, companyIds, monthsBack = 12) =>
    apiFetch('/api/dashboard/monthly-retail/fine-collection', {
      ...base(dateFrom, dateTo, companyIds),
      months_back: monthsBack,
    }),

  /** Returns [{id, name, short_name, active}] — use to populate UI dropdowns */
  companies: () => apiFetch('/api/dashboard/companies'),
};
