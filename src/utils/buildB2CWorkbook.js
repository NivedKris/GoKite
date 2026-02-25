/**
 * buildB2CWorkbook.js
 * Converts B2C dashboard API responses into a multi-sheet XLSX workbook.
 * Usage:
 *   import { buildB2CWorkbook } from './buildB2CWorkbook';
 *   const wb = buildB2CWorkbook({ filters, summary, dept, staff, ... });
 *   XLSX.writeFile(wb, 'B2C_Report.xlsx');
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

function sectionTitle(label) {
  return [[''], [`── ${label} ──`], ['']];
}

// ── 1. Summary ───────────────────────────────────────────────────────────────
function sheetSummary(summary, filters, companyNames) {
  const d = summary ?? {};
  const aoa = [
    ['GoKite Monthly Retail Summary Report'],
    [''],
    ['Period', `${filters.dateFrom} to ${filters.dateTo}`],
    ['Companies Selected', companyNames ?? (filters.companyIds ?? []).join(', ')],
    [''],
    ['KPI', 'Value'],
    ['Total Sales Amount', d.total_sales_amount ?? '—'],
    ['Conversion %', d.conversion_percentage ?? '—'],
    ['Total Revenue', d.total_revenue ?? '—'],
    ['Total Reviews', d.total_review_count ?? '—'],
    ['Revenue Target', d.total_revenue_target ?? '—'],
  ];
  return ws(aoa, [30, 25]);
}

// ── 2. Department Wise ────────────────────────────────────────────────────────
function sheetDepartmentWise(data) {
  if (!data) return null;
  const aoa = [
    ['#', 'Department / Team', 'Profit (AED)'],
    ...(data.data ?? []).map((r) => [r.sl_no, r.department, r.profit]),
    ['', 'TOTAL', data.total_profit ?? 0],
  ];
  return ws(aoa, [5, 30, 18]);
}

// ── 3. Sales Team Staff ───────────────────────────────────────────────────────
function sheetSalesTeamStaff(data) {
  if (!data) return null;
  const aoa = [
    ['Sales Team', '#', 'Staff Name', 'Revenue Total (AED)', 'Total Sales (AED)', 'Revenue Target (AED)'],
  ];
  (data.data ?? []).forEach((team) => {
    (team.staffs ?? []).forEach((s) => {
      aoa.push([team.sales_team, s.sl_no, s.staff_name, s.revenue_total, s.total_sales, s.revenue_target]);
    });
    aoa.push(['', '', `${team.sales_team} — Branch Profit`, team.total_branch_profit, '', '']);
    aoa.push(['']);
  });
  return ws(aoa, [18, 5, 25, 20, 20, 20]);
}

// ── 4. Frontline Service Count ────────────────────────────────────────────────
function sheetFrontline(data) {
  if (!data) return null;
  const visaSources = data.columns?.visa_sources ?? [];
  const products = data.columns?.products ?? [];
  const header = ['#', 'Staff Name', ...visaSources, ...products, 'Total', 'Target'];
  const aoa = [header];
  (data.data ?? []).forEach((r) => {
    const visaCols = visaSources.map((s) => r.visa_counts?.[s] ?? 0);
    const productCols = products.map((p) => r.product_counts?.[p] ?? 0);
    aoa.push([r.sl_no, r.staff_name, ...visaCols, ...productCols, r.total_count, r.target_count]);
  });
  const widths = [5, 25, ...visaSources.map(() => 16), ...products.map(() => 16), 10, 10];
  return ws(aoa, widths);
}

// ── 5. Previous Month Comparison ─────────────────────────────────────────────
function sheetPrevMonthComparison(data) {
  if (!data) return null;
  const months = data.months ?? [];
  const monthLabels = months.map((m, i) => fmtMonthLabel(m, i));
  const header = ['Sales Team', '#', 'Staff Name', ...monthLabels];
  const aoa = [header];
  (data.data ?? []).forEach((team) => {
    (team.staffs ?? []).forEach((s) => {
      aoa.push([team.sales_team, s.sl_no, s.staff_name, ...months.map((m) => s.revenues?.[m] ?? 0)]);
    });
    const totals = months.map((m) => team.team_total?.[m] ?? 0);
    aoa.push(['', '', `${team.sales_team} — Team Total`, ...totals]);
    aoa.push(['']);
  });
  const widths = [18, 5, 25, ...months.map(() => 17)];
  return ws(aoa, widths);
}

// ── 6. Conversion Details ─────────────────────────────────────────────────────
function sheetConversionDetails(data) {
  if (!data) return null;
  const months = data.months ?? [];
  const monthCols = months.flatMap((m, i) => [
    `${fmtMonthLabel(m, i)} Allocated`,
    `${fmtMonthLabel(m, i)} Converted`,
    `${fmtMonthLabel(m, i)} Ratio %`,
  ]);
  const header = ['Sales Team', '#', 'Staff Name', 'Target Ratio %', ...monthCols];
  const aoa = [header];
  (data.data ?? []).forEach((team) => {
    (team.staffs ?? []).forEach((s) => {
      const monthVals = months.flatMap((m) => [
        s.monthly_data?.[m]?.allocated_count ?? 0,
        s.monthly_data?.[m]?.converted_count ?? 0,
        s.monthly_data?.[m]?.ratio_percentage ?? 0,
      ]);
      aoa.push([team.sales_team, s.sl_no, s.staff_name, s.target_conversion_ratio, ...monthVals]);
    });
    const teamTotalVals = months.flatMap((m) => [
      team.team_totals?.[m]?.allocated_count ?? 0,
      team.team_totals?.[m]?.converted_count ?? 0,
      team.team_totals?.[m]?.ratio_percentage ?? 0,
    ]);
    aoa.push(['', '', `${team.sales_team} — Team Total`, '', ...teamTotalVals]);
    aoa.push(['']);
  });
  const widths = [18, 5, 25, 14, ...months.flatMap(() => [18, 18, 12])];
  return ws(aoa, widths);
}

// ── 7. Total Review ───────────────────────────────────────────────────────────
function sheetTotalReview(data) {
  if (!data) return null;
  const months = data.months ?? [];
  const monthLabels = months.map((m, i) => fmtMonthLabel(m, i));
  const header = ['#', 'Staff Name', 'Department', 'Target', ...monthLabels];
  const aoa = [header];
  (data.data ?? []).forEach((r) => {
    aoa.push([r.sl_no, r.staff_name, r.department, r.target_review, ...months.map((m) => r.monthly_reviews?.[m] ?? 0)]);
  });
  const totals = months.map((m) => data.totals?.[m] ?? 0);
  aoa.push(['', 'TOTAL', '', '', ...totals]);
  const widths = [5, 25, 18, 10, ...months.map(() => 15)];
  return ws(aoa, widths);
}

// ── 8. Outstanding List ───────────────────────────────────────────────────────
function sheetOutstanding(data) {
  if (!data) return null;
  const aoa = [
    ['Sales Team', '#', 'Staff Name', 'Current Month Pending (AED)', 'Previous Month Pending (AED)', 'Difference (AED)'],
  ];
  (data.data ?? []).forEach((team) => {
    (team.staffs ?? []).forEach((s) => {
      aoa.push([team.sales_team, s.sl_no, s.staff_name, s.current_month_pending, s.previous_month_pending, s.difference]);
    });
    const t = team.team_totals ?? {};
    aoa.push(['', '', `${team.sales_team} — Team Total`, t.current_month_pending ?? 0, t.previous_month_pending ?? 0, t.difference ?? 0]);
    aoa.push(['']);
  });
  return ws(aoa, [18, 5, 25, 28, 28, 18]);
}

// ── 9/10. Absconding & Fine rolling amounts ─────────────────────────────────
function sheetRollingAmounts(data, subSections) {
  // subSections = [{key, title}, ...]  e.g. [{key: 'absconding_sold', title: 'Sold'}, ...]
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
      const amounts = months.map((m) => r.amounts?.[m] ?? 0);
      aoa.push([r.source, ...amounts]);
    });
    const totals = months.map((m) => sec.total?.[m] ?? 0);
    aoa.push(['TOTAL', ...totals]);
    aoa.push(['']);
  });
  const widths = [22, ...months.map(() => 17)];
  return ws(aoa, widths);
}

// ── Build workbook ────────────────────────────────────────────────────────────
export function buildB2CWorkbook({ filters, companyNames, summary, dept, staff, frontline, prevMonth, conversion, review, outstanding, absconding, fine }) {
  const wb = XLSX.utils.book_new();

  const add = (name, sheetFn, ...args) => {
    const sheet = sheetFn(...args);
    if (sheet) XLSX.utils.book_append_sheet(wb, sheet, name);
  };

  add('Summary', sheetSummary, summary, filters, companyNames);
  add('Department Wise', sheetDepartmentWise, dept);
  add('Sales Team Staff', sheetSalesTeamStaff, staff);
  add('Frontline Service Count', sheetFrontline, frontline);
  add('Prev Month Comparison', sheetPrevMonthComparison, prevMonth);
  add('Conversion Details', sheetConversionDetails, conversion);
  add('Total Review', sheetTotalReview, review);
  add('Outstanding List', sheetOutstanding, outstanding);
  add('Absconding Report', sheetRollingAmounts, absconding, [
    { key: 'absconding_sold', title: 'ABSCONDING SOLD' },
    { key: 'collection_received', title: 'COLLECTION RECEIVED' },
    { key: 'collection_pending', title: 'COLLECTION PENDING' },
  ]);
  add('Fine Collection Report', sheetRollingAmounts, fine, [
    { key: 'fine_sold', title: 'FINE SOLD' },
    { key: 'collection_received', title: 'COLLECTION RECEIVED' },
    { key: 'collection_pending', title: 'COLLECTION PENDING' },
  ]);

  return wb;
}
