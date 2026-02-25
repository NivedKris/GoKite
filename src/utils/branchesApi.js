// ─────────────────────────────────────────────────────────────────────────────
// Branches Dashboard API — all endpoints under /api/dashboard/branches/
// Mock server: branches.py (port 5002)
// ─────────────────────────────────────────────────────────────────────────────
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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

const BR = '/api/dashboard/branches';

const base = (dateFrom, dateTo, companyIds) => ({
  date_from: dateFrom,
  date_to: dateTo,
  'company_ids[]': companyIds,
});

export const branchesApi = {
  /** API #0 – branch/company list for filter dropdown */
  companies: () => apiFetch(`${BR}/companies`),

  /** API #1 – top-level KPI summary */
  summary: (dateFrom, dateTo, companyIds) =>
    apiFetch(`${BR}/summary`, base(dateFrom, dateTo, companyIds)),

  /** API #2 – department wise profit */
  departmentWise: (dateFrom, dateTo, companyIds) =>
    apiFetch(`${BR}/department-wise`, base(dateFrom, dateTo, companyIds)),

  /** API #3 – individual staff performance (department wise) */
  departmentStaff: (dateFrom, dateTo, companyIds) =>
    apiFetch(`${BR}/department-staff`, base(dateFrom, dateTo, companyIds)),

  /** API #4 – previous month comparison (sales team wise), rolling months */
  prevMonthComparison: (dateFrom, dateTo, companyIds, monthsBack = 12) =>
    apiFetch(`${BR}/sales-team-previous-month-comparison`, {
      ...base(dateFrom, dateTo, companyIds),
      months_back: monthsBack,
    }),

  /** API #5 – conversion details (sales team wise) */
  conversionDetails: (dateFrom, dateTo, companyIds) =>
    apiFetch(`${BR}/conversion-details`, base(dateFrom, dateTo, companyIds)),

  /** API #6 – total review with rolling months */
  totalReview: (dateFrom, dateTo, companyIds, monthsBack = 12) =>
    apiFetch(`${BR}/total-review`, {
      ...base(dateFrom, dateTo, companyIds),
      months_back: monthsBack,
    }),

  /** API #7 – B2B report: current vs previous month counts */
  b2bReport: (dateFrom, dateTo, companyIds) =>
    apiFetch(`${BR}/b2b-report`, base(dateFrom, dateTo, companyIds)),

  /** API #8 – corporate client list (paginated) */
  corporateClients: (dateFrom, dateTo, companyIds, page = 1, pageSize = 50, search = '') =>
    apiFetch(`${BR}/corporate-clients`, {
      ...base(dateFrom, dateTo, companyIds),
      page,
      page_size: pageSize,
      ...(search ? { search } : {}),
    }),

  /** API #9 – absconding details (paginated) */
  abscondingDetails: (dateFrom, dateTo, companyIds, page = 1, pageSize = 50) =>
    apiFetch(`${BR}/absconding-details`, {
      ...base(dateFrom, dateTo, companyIds),
      page,
      page_size: pageSize,
    }),

  /** API #10 – absconding monthly comparison (12-month rolling) */
  abscondingMonthly: (month, companyIds, monthsBack = 12) =>
    apiFetch(`${BR}/absconding/monthly-comparison`, {
      month,
      'company_ids[]': companyIds,
      months_back: monthsBack,
    }),

  /** API #11 – fine details */
  fineDetails: (dateFrom, dateTo, companyIds) =>
    apiFetch(`${BR}/fine-details`, base(dateFrom, dateTo, companyIds)),

  /** API #12 – fine previous comparison (12-month rolling) */
  finePrevComparison: (dateFrom, dateTo, companyIds, monthsBack = 12) =>
    apiFetch(`${BR}/fine-previous-comparison`, {
      ...base(dateFrom, dateTo, companyIds),
      months_back: monthsBack,
    }),

  /** API #13 – outstanding by company */
  outstandingByCompany: (dateFrom, dateTo, companyIds) =>
    apiFetch(`${BR}/outstanding-by-company`, base(dateFrom, dateTo, companyIds)),
};
