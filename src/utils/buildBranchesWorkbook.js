/**
 * buildBranchesWorkbook.js
 * Converts Branches dashboard API responses into a multi-sheet XLSX workbook.
 * Usage:
 *   import { buildBranchesWorkbook } from './buildBranchesWorkbook';
 *   const wb = buildBranchesWorkbook({ filters, summary, ... });
 *   XLSX.writeFile(wb, 'Branches_Report.xlsx');
 */
import * as XLSX from 'xlsx';

// ── helpers ──────────────────────────────────────────────────────────────────
function fmtMonthLabel(iso, index) {
  if (index === 0) return 'Current Month';
  if (!iso) return iso;
  const d = new Date(iso + '-01');
  return d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

function ws(aoa, colWidths) {
  const sheet = XLSX.utils.aoa_to_sheet(aoa);
  if (colWidths) sheet['!cols'] = colWidths.map((w) => ({ wch: w }));
  return sheet;
}

function addSheet(wb, name, sheet) {
  if (!sheet) return;
  XLSX.utils.book_append_sheet(wb, sheet, name.slice(0, 31));
}

// ── 1. Summary ────────────────────────────────────────────────────────────────
function sheetSummary(summary, filters) {
  const d = summary ?? {};
  const aoa = [
    ['GoKite Branches Dashboard Report'],
    [''],
    ['Period', `${filters.dateFrom} to ${filters.dateTo}`],
    ['Branches Selected', (filters.companyIds ?? []).join(', ')],
    [''],
    ['KPI', 'Value'],
    ['Total Sales Amount', d.total_sales_amount ?? '—'],
    ['Conversion %', d.conversion_percentage ?? '—'],
    ['Total Revenue', d.total_revenue ?? '—'],
    ['Total Sale Count', d.total_sale_count ?? '—'],
    ['Total Review Count', d.total_review_count ?? '—'],
    ['Active Agency Count', d.active_agency_count ?? '—'],
    ['Visa Application Count', d.visa_application_count ?? '—'],
  ];
  return ws(aoa, [30, 25]);
}

// ── 2. Dept Wise ──────────────────────────────────────────────────────────────
function sheetDeptWise(data) {
  if (!data) return null;
  const aoa = [
    ['#', 'Department', 'Profit (AED)'],
    ...(data.data ?? []).map((r) => [r.sl_no, r.department, r.profit]),
    ['', 'TOTAL BRANCH PROFIT', data.total_branch_profit ?? 0],
  ];
  return ws(aoa, [5, 30, 18]);
}

// ── 3. Staff Performance ──────────────────────────────────────────────────────
function sheetDeptStaff(data) {
  if (!data) return null;
  const aoa = [['Department', '#', 'Staff Name', 'Revenue Total (AED)', 'Total Sales (AED)', 'Revenue Target (AED)']];
  (data.data ?? []).forEach((team) => {
    (team.staffs ?? []).forEach((s) => {
      aoa.push([team.department, s.sl_no, s.staff_name, s.revenue_total, s.total_sales, s.revenue_target]);
    });
    if (team.department_total) {
      aoa.push([
        `${team.department} — Total`, '', '',
        team.department_total.revenue_total,
        team.department_total.total_sales,
        team.department_total.revenue_target,
      ]);
    }
    aoa.push(['']);
  });
  return ws(aoa, [20, 5, 25, 20, 20, 20]);
}

// ── 4. Previous Month Comparison ─────────────────────────────────────────────
function sheetPrevMonthComparison(data) {
  if (!data?.months) return null;
  const months = data.months ?? [];
  const header = ['Sales Team', '#', 'Staff Name', ...months.map(fmtMonthLabel)];
  const aoa = [header];
  (data.data ?? []).forEach((team) => {
    (team.staffs ?? []).forEach((s) => {
      aoa.push([team.sales_team, s.sl_no, s.staff_name, ...months.map((m) => s.revenues?.[m] ?? 0)]);
    });
    aoa.push([`${team.sales_team} — Total`, '', '', ...months.map((m) => team.team_total?.[m] ?? 0)]);
    aoa.push(['']);
  });
  if (data.branch_total) {
    aoa.push(['Branch Grand Total', '', '', ...months.map((m) => data.branch_total?.[m] ?? 0)]);
  }
  return ws(aoa, [20, 5, 25, ...months.map(() => 16)]);
}

// ── 5. Conversion Details ─────────────────────────────────────────────────────
function sheetConversion(data) {
  if (!data) return null;
  const months = data.months ?? [];
  // Top header row: month labels (each will span 3 subcolumns)
  const top = ['Sales Team', '#', 'Staff Name'];
  months.forEach((m, i) => {
    top.push(fmtMonthLabel(m, i));
    top.push('');
    top.push('');
  });

  // Sub header row: Alloc / Conv / Ratio per month
  const sub = ['','',''];
  months.forEach(() => {
    sub.push('Alloc');
    sub.push('Conv');
    sub.push('Ratio %');
  });

  const aoa = [top, sub];

  (data.data ?? []).forEach((team) => {
    (team.staffs ?? []).forEach((s) => {
      const row = [team.sales_team, s.sl_no, s.staff_name];
      months.forEach((m) => {
        const md = s.monthly_data?.[m] ?? {};
        const alloc = md.allocated_count ?? 0;
        const conv = md.converted_count ?? 0;
        const ratio = md.ratio_percentage ?? 0;
        row.push(alloc, conv, ratio);
      });
      aoa.push(row);
    });
    if (team.team_totals) {
      const row = [`${team.sales_team} — Total`, '', ''];
      months.forEach((m) => {
        const tt = team.team_totals?.[m] ?? {};
        row.push(tt.allocated_count ?? 0);
        row.push(tt.converted_count ?? 0);
        row.push(tt.ratio_percentage ?? 0);
      });
      aoa.push(row);
    }
    aoa.push(['']);
  });

  if (data.branch_totals) {
    const row = ['Branch Grand Total', '', ''];
    months.forEach((m) => {
      row.push(data.branch_totals.monthly_allocated?.[m] ?? 0);
      row.push(data.branch_totals.monthly_converted?.[m] ?? 0);
      row.push(data.branch_totals.monthly_allocated?.[m] > 0 ? ((data.branch_totals.monthly_converted?.[m] ?? 0) / data.branch_totals.monthly_allocated?.[m] * 100) : 0);
    });
    aoa.push(row);
  }

  return ws(aoa, [20, 5, 25, ...months.map(() => 8)]);
}

// ── 6. Total Review ───────────────────────────────────────────────────────────
function sheetTotalReview(data) {
  if (!data?.months) return null;
  const months = data.months ?? [];
  const header = ['#', 'Staff Name', 'Department', 'Reviews', 'Target', 'Prev Month', ...months.map(fmtMonthLabel)];
  const aoa = [header];
  (data.data ?? []).forEach((s) => {
    aoa.push([
      s.sl_no, s.staff_name, s.department,
      s.review_count, s.target_review,
      s.previous_month_review,
      ...months.map((m) => s.monthly_reviews?.[m] ?? 0),
    ]);
  });
  if (data.totals) {
    aoa.push(['', 'Total', '', data.totals.review_count, '—', data.totals.previous_month_review,
      ...months.map((m) => data.totals.monthly_reviews?.[m] ?? 0)]);
  }
  return ws(aoa, [5, 25, 18, 10, 10, 12, ...months.map(() => 14)]);
}

// ── 7. B2B Report ─────────────────────────────────────────────────────────────
function sheetB2BReport(data) {
  if (!data) return null;
  const aoa = [['#', 'Particular', 'Current Month', 'Previous Month', 'Growth %']];
  (data.data ?? []).forEach((r) => {
    aoa.push([r.sl_no, r.particular, r.current_month_count, r.previous_month_count, r.growth_percentage]);
  });
  return ws(aoa, [5, 30, 16, 16, 12]);
}

// ── 8. Corporate Clients ──────────────────────────────────────────────────────
function sheetCorporateClients(data) {
  if (!data) return null;
  const aoa = [['#', 'Date', 'Client Name', 'Contact Person', 'Phone', 'Email', 'Area', 'Status']];
  (data.data ?? []).forEach((r) => {
    aoa.push([r.sr_no, r.date, r.client_name, r.contact_person, r.contact_number, r.email_id, r.area_state, r.status]);
  });
  return ws(aoa, [5, 12, 30, 25, 18, 32, 18, 16]);
}

// ── 9. Absconding Details ─────────────────────────────────────────────────────
function sheetAbscondingDetails(data) {
  if (!data) return null;
  const aoa = [['#', 'Customer Name', 'Department', 'Count', 'Amount (AED)', 'Received (AED)', 'Balance (AED)']];
  (data.data ?? []).forEach((r) => {
    aoa.push([r.sr_no, r.customer_name, r.department, r.count, r.amount, r.received, r.balance]);
  });
  if (data.totals) {
    aoa.push(['', 'Total', '', data.totals.total_count, data.totals.total_amount, data.totals.total_received, data.totals.total_balance]);
  }
  return ws(aoa, [5, 30, 18, 8, 18, 18, 18]);
}

// ── 10. Absconding Monthly ────────────────────────────────────────────────────
function sheetAbscondingMonthly(data) {
  if (!data?.months) return null;
  const months = data.months ?? [];
  const header = ['Section', 'Source', ...months.map(fmtMonthLabel)];
  const aoa = [header];

  const buildRows = (sectionName, rows) => {
    (rows ?? []).forEach((row) => {
      aoa.push([sectionName, row.source, ...months.map((m) => row.values?.[m] ?? 0)]);
    });
    aoa.push(['']);
  };

  buildRows('Absconding List', data.absconding_list);
  buildRows('Collection Received', data.collection_received);
  buildRows('Collection Pending', data.collection_pending);
  return ws(aoa, [20, 20, ...months.map(() => 16)]);
}

// ── 11. Fine Details ──────────────────────────────────────────────────────────
function sheetFineDetails(data) {
  if (!data) return null;
  const aoa = [['#', 'Customer Name', 'Department', 'Count', 'Amount (AED)', 'Received (AED)', 'Balance (AED)']];
  (data.data ?? []).forEach((r) => {
    aoa.push([r.sl_no, r.customer_name, r.department, r.count, r.amount, r.received, r.balance]);
  });
  if (data.totals) {
    aoa.push(['', 'Total', '', data.totals.count, data.totals.amount, data.totals.received, data.totals.balance]);
  }
  return ws(aoa, [5, 30, 18, 8, 18, 18, 18]);
}

// ── 12. Fine Previous Comparison ─────────────────────────────────────────────
function sheetFinePrevComparison(data) {
  if (!data?.months) return null;
  const months = data.months ?? [];
  const header = ['Section', 'Source', ...months.map(fmtMonthLabel)];
  const aoa = [header];

  const buildRows = (sectionName, section) => {
    (section?.data ?? []).forEach((row) => {
      aoa.push([sectionName, row.source, ...months.map((m) => row.amounts?.[m] ?? 0)]);
    });
    if (section?.total) {
      aoa.push([`${sectionName} — Total`, '', ...months.map((m) => section.total?.[m] ?? 0)]);
    }
    aoa.push(['']);
  };

  buildRows('Fines List', data.fine_sold);
  buildRows('Collection Received', data.collection_received);
  buildRows('Collection Pending', data.collection_pending);
  return ws(aoa, [22, 20, ...months.map(() => 16)]);
}

// ── 13. Outstanding by Company ────────────────────────────────────────────────
function sheetOutstanding(data) {
  if (!data) return null;
  const aoa = [['Branch', '#', 'Department', 'Outstanding (AED)']];
  (data.data ?? []).forEach((company) => {
    (company.rows ?? []).forEach((row) => {
      aoa.push([company.company_name, row.sl_no, row.department, row.outstanding]);
    });
    aoa.push([`${company.company_name} — Total`, '', '', company.total_outstanding]);
    aoa.push(['']);
  });
  return ws(aoa, [22, 5, 30, 20]);
}

// ── Main builder ──────────────────────────────────────────────────────────────
export function buildBranchesWorkbook({
  filters,
  summary,
  deptWise,
  deptStaff,
  prevMonth,
  conversion,
  review,
  b2bReport,
  corporateClients,
  abscondingDetails,
  abscondingMonthly,
  fineDetails,
  finePrevComparison,
  outstanding,
}) {
  const wb = XLSX.utils.book_new();

  addSheet(wb, 'Summary', sheetSummary(summary, filters));
  addSheet(wb, 'Dept Wise Profit', sheetDeptWise(deptWise));
  addSheet(wb, 'Staff Performance', sheetDeptStaff(deptStaff));
  addSheet(wb, 'Prev Month Comparison', sheetPrevMonthComparison(prevMonth));
  addSheet(wb, 'Conversion Details', sheetConversion(conversion));
  addSheet(wb, 'Total Review', sheetTotalReview(review));
  addSheet(wb, 'B2B Report', sheetB2BReport(b2bReport));
  addSheet(wb, 'Corporate Clients', sheetCorporateClients(corporateClients));
  addSheet(wb, 'Absconding Details', sheetAbscondingDetails(abscondingDetails));
  addSheet(wb, 'Absconding Monthly', sheetAbscondingMonthly(abscondingMonthly));
  addSheet(wb, 'Fine Details', sheetFineDetails(fineDetails));
  addSheet(wb, 'Fine Prev Comparison', sheetFinePrevComparison(finePrevComparison));
  addSheet(wb, 'Outstanding', sheetOutstanding(outstanding));

  return wb;
}
