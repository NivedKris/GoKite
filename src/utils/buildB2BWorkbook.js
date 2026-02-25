/**
 * buildB2BWorkbook.js
 * Converts B2B dashboard API responses into a multi-sheet XLSX workbook.
 */
import * as XLSX from 'xlsx';

// ── helpers ──────────────────────────────────────────────────────────────────
function fmtMonthLabel(iso, index) {
  if (index === 0) return 'Current Month';
  if (!iso) return iso;
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

function ws(aoa, colWidths) {
  const sheet = XLSX.utils.aoa_to_sheet(aoa);
  if (colWidths) sheet['!cols'] = colWidths.map((w) => ({ wch: w }));
  return sheet;
}

// ── 1. Summary ───────────────────────────────────────────────────────────────
function sheetSummary(summary, filters, companyNames) {
  const d = summary ?? {};
  const aoa = [
    ['GoKite Monthly B2B Summary Report'],
    [''],
    ['Period', `${filters.dateFrom} to ${filters.dateTo}`],
    ['Companies Selected', companyNames ?? (filters.companyIds ?? []).join(', ')],
    [''],
    ['KPI', 'Value'],
    ['App Visas', d.number_of_app_visa ?? '—'],
    ['Absconding Count', d.total_absconding_count ?? '—'],
    ['Absconding Collection', d.absconding_collection_amount ?? '—'],
    ['Active Agencies', d.active_agency_count ?? '—'],
    ['Total A2A', d.total_a2a_count ?? '—'],
  ];
  return ws(aoa, [30, 25]);
}

// ── 2. Dept Product Report ────────────────────────────────────────────────────
function sheetDeptProducts(data) {
  if (!data) return null;
  const aoa = [
    ['#', 'Product', 'Applications'],
    ...(data.data ?? []).map((r) => [r.sl_no, r.product_name, r.application_count]),
    ['', 'TOTAL', data.total?.application_count ?? 0],
  ];
  return ws(aoa, [5, 30, 16]);
}

// ── 3. Individual Details ─────────────────────────────────────────────────────
function sheetIndividualDetails(data) {
  if (!data) return null;
  const months = data.months ?? [];
  const monthLabels = months.map((m, i) => fmtMonthLabel(m, i));
  const header = ['Staff Name', 'Source', ...monthLabels, 'Target'];
  const aoa = [header];
  (data.data ?? []).forEach((staff) => {
    (staff.sources ?? []).forEach((src) => {
      aoa.push([
        staff.staff_name,
        src.source,
        ...months.map((m) => src.monthly_counts?.[m] ?? 0),
        src.target_count ?? '',
      ]);
    });
    aoa.push(['']);
  });
  return ws(aoa, [25, 20, ...months.map(() => 15), 10]);
}

// ── 4. Team Wise ──────────────────────────────────────────────────────────────
function sheetTeamWise(data) {
  if (!data) return null;
  const months = data.months ?? [];
  const monthLabels = months.map((m, i) => fmtMonthLabel(m, i));
  const header = ['Sales Team', '#', 'Staff Name', ...monthLabels];
  const aoa = [header];
  (data.data ?? []).forEach((team) => {
    (team.staffs ?? []).forEach((s) => {
      aoa.push([team.sales_team, s.sl_no, s.staff_name, ...months.map((m) => s.monthly_counts?.[m] ?? 0)]);
    });
    const t = team.team_totals ?? {};
    const totals = months.map((m) => t.monthly_totals?.[m] ?? 0);
    aoa.push(['', '', `${team.sales_team} — Team Total`, ...totals]);
    aoa.push(['']);
  });
  return ws(aoa, [18, 5, 25, ...months.map(() => 15)]);
}

// ── 5-8. Rolling Count tables (Visa, A2A, Service, Agency) ───────────────────
function sheetRollingCount(data, labelKey, labelHeader) {
  if (!data) return null;
  const months = data.months ?? [];
  const monthLabels = months.map((m, i) => fmtMonthLabel(m, i));
  const aoa = [
    [labelHeader, ...monthLabels],
    ...(data.data ?? []).map((r) => [r[labelKey], ...months.map((m) => r.monthly_counts?.[m] ?? 0)]),
    ['TOTAL', ...months.map((m) => data.totals?.monthly_totals?.[m] ?? 0)],
  ];
  return ws(aoa, [25, ...months.map(() => 15)]);
}

// ── 9. Fund Collection ────────────────────────────────────────────────────────
function sheetFundCollection(data) {
  if (!data) return null;
  const aoa = [
    ['#', 'Staff Name', 'Department', 'Outstanding Amount (AED)'],
    ...(data.data ?? []).map((r) => [r.sl_no, r.staff_name, r.department, r.outstanding_amount]),
    ['', 'TOTAL', '', data.total_outstanding_amount ?? 0],
  ];
  return ws(aoa, [5, 25, 18, 25]);
}

// ── 10. Agency Conversion ─────────────────────────────────────────────────────
function sheetAgencyConversion(data) {
  if (!data) return null;
  const aoa = [
    ['#', 'Staff Name', 'Department', 'Restarted', 'New Conversion', 'Total'],
    ...(data.data ?? []).map((r) => [r.sl_no, r.staff_name, r.department, r.restarted_count, r.new_conversion_count, r.total_count]),
    ['', 'TOTAL', '', data.totals?.restarted_count ?? 0, data.totals?.new_conversion_count ?? 0, data.totals?.total_count ?? 0],
  ];
  return ws(aoa, [5, 25, 18, 14, 18, 10]);
}

// ── 11-12. B2B Absconding / Fine rolling amounts ──────────────────────────────
// Note: B2B sub-sections use monthly_amounts (not amounts) and total.monthly_totals
function sheetRollingAmountsB2B(data, subSections) {
  if (!data) return null;
  const months = data.months ?? [];
  const monthLabels = months.map((m, i) => fmtMonthLabel(m, i));
  const aoa = [];
  subSections.forEach(({ key, title }) => {
    const sec = data[key];
    if (!sec) return;
    aoa.push([title]);
    aoa.push(['Source', ...monthLabels]);
    (sec.data ?? []).forEach((r) => {
      aoa.push([r.source, ...months.map((m) => r.monthly_amounts?.[m] ?? 0)]);
    });
    aoa.push(['TOTAL', ...months.map((m) => sec.total?.monthly_totals?.[m] ?? 0)]);
    aoa.push(['']);
  });
  return ws(aoa, [22, ...months.map(() => 17)]);
}

// ── Build workbook ────────────────────────────────────────────────────────────
export function buildB2BWorkbook({
  filters, companyNames, summary,
  deptProducts, individual, teamWise,
  visaSplit, a2aSplit, serviceReport, agencyReport,
  fundCollection, agencyConversion, absconding, fine,
}) {
  const wb = XLSX.utils.book_new();

  const add = (name, sheetFn, ...args) => {
    const sheet = sheetFn(...args);
    if (sheet) XLSX.utils.book_append_sheet(wb, sheet, name);
  };

  add('Summary', sheetSummary, summary, filters, companyNames);
  add('Dept Products', sheetDeptProducts, deptProducts);
  add('Individual Details', sheetIndividualDetails, individual);
  add('Team Wise', sheetTeamWise, teamWise);
  add('Visa Split-Up', sheetRollingCount, visaSplit, 'service_type', 'Visa Service Type');
  add('A2A Split-Up', sheetRollingCount, a2aSplit, 'service_type', 'Carrier');
  add('Service Report', sheetRollingCount, serviceReport, 'service_type', 'Service Type');
  add('Agency Report', sheetRollingCount, agencyReport, 'agency_metric', 'Metric');
  add('Fund Collection', sheetFundCollection, fundCollection);
  add('Agency Conversion', sheetAgencyConversion, agencyConversion);
  add('Absconding Report', sheetRollingAmountsB2B, absconding, [
    { key: 'absconding_sold', title: 'ABSCONDING SOLD' },
    { key: 'collection_received', title: 'COLLECTION RECEIVED' },
    { key: 'collection_pending', title: 'COLLECTION PENDING' },
  ]);
  add('Fine Source Report', sheetRollingAmountsB2B, fine, [
    { key: 'fine_sold', title: 'FINE SOLD' },
    { key: 'collection_received', title: 'COLLECTION RECEIVED' },
    { key: 'collection_pending', title: 'COLLECTION PENDING' },
  ]);

  return wb;
}
