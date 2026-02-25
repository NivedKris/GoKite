// ─────────────────────────────────────────────────────────────────────────────
// B2B Dashboard API — all endpoints under /api/dashboard/monthly-b2b/
// Uses same BASE_URL and param-builder as the B2C api.js (proxied by Vite / nginx)
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

const B2B = '/api/dashboard/monthly-b2b';

const base = (dateFrom, dateTo, companyIds) => ({
  date_from: dateFrom,
  date_to: dateTo,
  'company_ids[]': companyIds,
});

export const b2bApi = {
  /** API #0 – company list for filter dropdown */
  companies: () => apiFetch(`/api/dashboard/companies`),

  /** API #1 – top-level KPI summary */
  summary: (dateFrom, dateTo, companyIds) =>
    apiFetch(`${B2B}/summary`, base(dateFrom, dateTo, companyIds)),

  /** API #2 – department × product application counts */
  departmentProducts: (dateFrom, dateTo, companyIds) =>
    apiFetch(`${B2B}/department-products`, base(dateFrom, dateTo, companyIds)),

  /** API #3 – individual details: staff × source × rolling months */
  individualDetails: (dateFrom, dateTo, companyIds, monthsBack = 12) =>
    apiFetch(`${B2B}/individual-details`, {
      ...base(dateFrom, dateTo, companyIds),
      months_back: monthsBack,
    }),

  /** API #4 – team-wise monthly applications: staff × rolling months */
  teamWise: (dateFrom, dateTo, companyIds, monthsBack = 12) =>
    apiFetch(`${B2B}/team-wise`, {
      ...base(dateFrom, dateTo, companyIds),
      months_back: monthsBack,
    }),

  /** API #5 – visa split-up by service type × rolling months */
  visaSplitUp: (dateFrom, dateTo, companyIds, monthsBack = 12) =>
    apiFetch(`${B2B}/visa-split-up`, {
      ...base(dateFrom, dateTo, companyIds),
      months_back: monthsBack,
    }),

  /** API #6 – A2A split-up by carrier × rolling months */
  a2aSplitUp: (dateFrom, dateTo, companyIds, monthsBack = 12) =>
    apiFetch(`${B2B}/a2a-split-up`, {
      ...base(dateFrom, dateTo, companyIds),
      months_back: monthsBack,
    }),

  /** API #7 – service report: A2A Flight / A2A Bus / Visa × rolling months */
  serviceReport: (dateFrom, dateTo, companyIds, monthsBack = 12) =>
    apiFetch(`${B2B}/service-report`, {
      ...base(dateFrom, dateTo, companyIds),
      months_back: monthsBack,
    }),

  /** API #8 – agency report: pipeline status × rolling months */
  agencyReport: (dateFrom, dateTo, companyIds, monthsBack = 12) =>
    apiFetch(`${B2B}/agency-report`, {
      ...base(dateFrom, dateTo, companyIds),
      months_back: monthsBack,
    }),

  /** API #9 – fund collection outstanding: staff × amount */
  fundCollection: (dateFrom, dateTo, companyIds) =>
    apiFetch(`${B2B}/fund-collection-outstanding`, base(dateFrom, dateTo, companyIds)),

  /** API #10 – agency conversion: staff × restarted / new_conversion */
  agencyConversion: (dateFrom, dateTo, companyIds) =>
    apiFetch(`${B2B}/agency-conversion`, base(dateFrom, dateTo, companyIds)),

  /** API #11 – absconding source: sold / received / pending × rolling months */
  abscondingSource: (dateFrom, dateTo, companyIds, monthsBack = 12) =>
    apiFetch(`${B2B}/absconding-source`, {
      ...base(dateFrom, dateTo, companyIds),
      months_back: monthsBack,
    }),

  /** API #12 – fine source: sold / received / pending × rolling months */
  fineSource: (dateFrom, dateTo, companyIds, monthsBack = 12) =>
    apiFetch(`${B2B}/fine-source`, {
      ...base(dateFrom, dateTo, companyIds),
      months_back: monthsBack,
    }),
};
