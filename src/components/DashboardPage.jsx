import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { monthRange, fmtCurrency, fmtInt, fmtPct } from '../utils/formatters';
import { api } from '../utils/api';
import { buildB2CWorkbook } from '../utils/buildB2CWorkbook';
import FilterBar from '../components/FilterBar';
import { resolveCompanyNames } from '../utils/filterState';
import KpiCard from '../components/KpiCard';
import AccordionSection from '../components/AccordionSection';
import LoadingOverlay from '../components/LoadingOverlay';
import ExportButton from '../components/ExportButton';

// Sections
import DepartmentWiseReport from '../sections/DepartmentWiseReport';
import SalesTeamStaffReport from '../sections/SalesTeamStaffReport';
import FrontlineServiceCount from '../sections/FrontlineServiceCount';
import PreviousMonthComparison from '../sections/PreviousMonthComparison';
import ConversionDetails from '../sections/ConversionDetails';
import TotalReview from '../sections/TotalReview';
import OutstandingList from '../sections/OutstandingList';
import AbscondingReport from '../sections/AbscondingReport';
import FineCollectionReport from '../sections/FineCollectionReport';

// ─────────────────────────────────────────────────────────────────────────────
// Section state: { data, loading, error, loaded }
// ─────────────────────────────────────────────────────────────────────────────
function useSectionState() {
  const [state, setState] = useState({ data: null, loading: false, error: null, loaded: false });

  const fetch = useCallback(async (fetchFn) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetchFn();
      setState({ data, loading: false, error: null, loaded: true });
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: err.message ?? 'Failed to load', loaded: true }));
    }
  }, []);

  return [state, fetch];
}

// ─────────────────────────────────────────────────────────────────────────────
// Progress bar for Revenue Target KPI
// ─────────────────────────────────────────────────────────────────────────────
function TargetProgress({ revenue, target }) {
  if (!revenue || !target) return null;
  const pct = Math.min(100, Math.round((revenue / target) * 100));
  const color = pct >= 90 ? 'bg-primary' : pct >= 70 ? 'bg-amber-400' : 'bg-rose-400';
  return (
    <div className="mt-auto">
      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
        <span>{pct}% achieved</span>
        <span>Achieved: {fmtCurrency(revenue)}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main DashboardPage
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  // Active filter params
  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const initialRange = monthRange(prevMonth);
  const [filters, setFilters] = useState({
    dateFrom: initialRange.dateFrom,
    dateTo: initialRange.dateTo,
    companyIds: [],
  });

  // KPI summary — start as loading so the overlay shows on first paint
  const [summary, setSummary] = useState({ data: null, loading: true, error: null });

  // Per-section state
  const [dept, fetchDept] = useSectionState();
  const [staff, fetchStaff] = useSectionState();
  const [frontline, fetchFrontline] = useSectionState();
  const [prevMonth2, fetchPrevMonth] = useSectionState();
  const [conversion, fetchConversion] = useSectionState();
  const [review, fetchReview] = useSectionState();
  const [outstanding, fetchOutstanding] = useSectionState();
  const [absconding, fetchAbsconding] = useSectionState();
  const [fine, fetchFine] = useSectionState();

  // Ref to skip re-fetch effect on first mount
  const isFirstRender = useRef(true);

  // Load summary on filter change (skip until companies are ready)
  useEffect(() => {
    if (filters.companyIds.length === 0) return;
    async function loadSummary() {
      setSummary({ data: null, loading: true, error: null });
      try {
        const data = await api.summary(filters.dateFrom, filters.dateTo, filters.companyIds);
        setSummary({ data, loading: false, error: null });
      } catch (err) {
        setSummary({ data: null, loading: false, error: err.message });
      }
    }
    loadSummary();
  }, [filters]);

  // Re-fetch every section that has already been loaded whenever filters change.
  // Skips the initial mount so we don't fetch sections before they are opened.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const { dateFrom, dateTo, companyIds } = filters;
    if (dept.loaded) fetchDept(() => api.departmentWise(dateFrom, dateTo, companyIds));
    if (staff.loaded) fetchStaff(() => api.salesTeamStaff(dateFrom, dateTo, companyIds));
    if (frontline.loaded) fetchFrontline(() => api.frontlineServiceCount(dateFrom, dateTo, companyIds));
    if (prevMonth2.loaded) fetchPrevMonth(() => api.previousMonthComparison(dateFrom, dateTo, companyIds));
    if (conversion.loaded) fetchConversion(() => api.conversionDetails(dateFrom, dateTo, companyIds));
    if (review.loaded) fetchReview(() => api.totalReview(dateFrom, dateTo, companyIds));
    if (outstanding.loaded) fetchOutstanding(() => api.outstanding(dateFrom, dateTo, companyIds));
    if (absconding.loaded) fetchAbsconding(() => api.abscondingSource(dateFrom, dateTo, companyIds));
    if (fine.loaded) fetchFine(() => api.fineCollection(dateFrom, dateTo, companyIds));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // ── Apply / Clear handler ────────────────────────────────────────────────
  function handleApply(newFilters) {
    setFilters(newFilters);
  }

  // ── Export all sections to Excel ─────────────────────────────────────────
  async function handleExport() {
    const { dateFrom, dateTo, companyIds } = filters;
    const [
      summaryData, deptData, staffData, frontlineData,
      prevMonthData, conversionData, reviewData,
      outstandingData, abscondingData, fineData,
    ] = await Promise.all([
      api.summary(dateFrom, dateTo, companyIds),
      api.departmentWise(dateFrom, dateTo, companyIds),
      api.salesTeamStaff(dateFrom, dateTo, companyIds),
      api.frontlineServiceCount(dateFrom, dateTo, companyIds),
      api.previousMonthComparison(dateFrom, dateTo, companyIds),
      api.conversionDetails(dateFrom, dateTo, companyIds),
      api.totalReview(dateFrom, dateTo, companyIds),
      api.outstanding(dateFrom, dateTo, companyIds),
      api.abscondingSource(dateFrom, dateTo, companyIds),
      api.fineCollection(dateFrom, dateTo, companyIds),
    ]);
    const wb = buildB2CWorkbook({
      filters,
      companyNames: resolveCompanyNames(filters.companyIds),
      summary: summaryData,
      dept: deptData,
      staff: staffData,
      frontline: frontlineData,
      prevMonth: prevMonthData,
      conversion: conversionData,
      review: reviewData,
      outstanding: outstandingData,
      absconding: abscondingData,
      fine: fineData,
    });
    XLSX.writeFile(wb, `B2C_Report_${dateFrom}_to_${dateTo}.xlsx`);
  }

  const { dateFrom, dateTo, companyIds } = filters;
  const kpi = summary.data;

  // ── Section helpers ──────────────────────────────────────────────────────
  const onOpenDept = () => fetchDept(() => api.departmentWise(dateFrom, dateTo, companyIds));
  const onOpenStaff = () => fetchStaff(() => api.salesTeamStaff(dateFrom, dateTo, companyIds));
  const onOpenFrontline = () => fetchFrontline(() => api.frontlineServiceCount(dateFrom, dateTo, companyIds));
  const onOpenPrevMonth = () => fetchPrevMonth(() => api.previousMonthComparison(dateFrom, dateTo, companyIds));
  const onOpenConversion = () => fetchConversion(() => api.conversionDetails(dateFrom, dateTo, companyIds));
  const onOpenReview = () => fetchReview(() => api.totalReview(dateFrom, dateTo, companyIds));
  const onOpenOutstanding = () => fetchOutstanding(() => api.outstanding(dateFrom, dateTo, companyIds));
  const onOpenAbsconding = () => fetchAbsconding(() => api.abscondingSource(dateFrom, dateTo, companyIds));
  const onOpenFine = () => fetchFine(() => api.fineCollection(dateFrom, dateTo, companyIds));

  return (
    <div className="min-h-screen bg-[#f6f7f8] font-display">
      <LoadingOverlay visible={summary.loading} />
      <main className="w-full px-4 sm:px-8 py-6 space-y-6">

        {/* ── Page Header ───────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            <span>GoKite</span>
            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
            <span className="text-slate-700">Monthly Retail Summary</span>
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Monthly Retail Summary Report
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Performance overview for the selected month and companies
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <ExportButton onExport={handleExport} />
              <Link
                to="/b2b"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 hover:border-primary hover:text-primary transition-colors shadow-sm whitespace-nowrap"
              >
                Switch to B2B
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M4 11h12.17l-5.59-5.59L12 4l8 8-8 8-1.41-1.41L16.17 13H4v-2z" /></svg>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Sticky Filter Bar ─────────────────────────────────────────── */}
        <FilterBar onApply={handleApply} />

        {/* ── KPI Cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            label="Total Sales Amount"
            icon="payments"
            value={
              summary.loading ? <span className="text-slate-300 animate-pulse">Loading…</span>
                : kpi ? fmtCurrency(kpi.total_sales_amount)
                  : '—'
            }
          />
          <KpiCard
            label="Conversion %"
            icon="conversion"
            value={
              summary.loading ? <span className="text-slate-300 animate-pulse">Loading…</span>
                : kpi ? fmtPct(kpi.conversion_percentage)
                  : '—'
            }
          />
          <KpiCard
            label="Total Revenue"
            icon="revenue"
            value={
              summary.loading ? <span className="text-slate-300 animate-pulse">Loading…</span>
                : kpi ? fmtCurrency(kpi.total_revenue)
                  : '—'
            }
          />
          <KpiCard
            label="Total Reviews"
            icon="reviews"
            value={
              summary.loading ? <span className="text-slate-300 animate-pulse">Loading…</span>
                : kpi ? fmtInt(kpi.total_review_count)
                  : '—'
            }
          />
          <KpiCard
            label="Revenue Target"
            icon="target"
            value={
              summary.loading ? <span className="text-slate-300 animate-pulse">Loading…</span>
                : kpi ? fmtCurrency(kpi.total_revenue_target)
                  : '—'
            }
            subContent={
              kpi ? (
                <TargetProgress revenue={kpi.total_revenue} target={kpi.total_revenue_target} />
              ) : null
            }
          />
        </div>

        {/* Summary error */}
        {summary.error && (
          <div className="px-4 py-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
            <strong>Summary error:</strong> {summary.error}
          </div>
        )}

        {/* ── Accordion Sections ────────────────────────────────────────── */}
        <div className="space-y-3">

          <AccordionSection
            title="Department Wise Report"
            subtitle="Profit breakdown by sales department / team"
            badge="Dept. View"
            loading={dept.loading}
            error={dept.error}
            onOpen={onOpenDept}
          >
            <DepartmentWiseReport data={dept.data} />
          </AccordionSection>

          <AccordionSection
            title="Sales Team Staff Report"
            subtitle="Individual staff revenue, sales, and target performance"
            badge="Staff"
            loading={staff.loading}
            error={staff.error}
            onOpen={onOpenStaff}
          >
            <SalesTeamStaffReport data={staff.data} />
          </AccordionSection>

          <AccordionSection
            title="Frontline Service Count"
            subtitle="Visa sources and product counts per frontline staff"
            badge="Frontline"
            loading={frontline.loading}
            error={frontline.error}
            onOpen={onOpenFrontline}
          >
            <FrontlineServiceCount data={frontline.data} />
          </AccordionSection>

          <AccordionSection
            title="Previous Month Comparison"
            subtitle="Rolling 12-month revenue comparison per staff and team"
            badge="Rolling"
            loading={prevMonth2.loading}
            error={prevMonth2.error}
            onOpen={onOpenPrevMonth}
          >
            <PreviousMonthComparison data={prevMonth2.data} />
          </AccordionSection>

          <AccordionSection
            title="Conversion Details"
            subtitle="Opportunity allocation, conversions, and target ratio by team"
            badge="Conversion"
            loading={conversion.loading}
            error={conversion.error}
            onOpen={onOpenConversion}
          >
            <ConversionDetails data={conversion.data} />
          </AccordionSection>

          <AccordionSection
            title="Total Review"
            subtitle="Review counts per staff vs targets and previous month"
            badge="Reviews"
            loading={review.loading}
            error={review.error}
            onOpen={onOpenReview}
          >
            <TotalReview data={review.data} />
          </AccordionSection>

          <AccordionSection
            title="Outstanding List"
            subtitle="Pending payment amounts per staff — current vs previous month"
            badge="Outstanding"
            loading={outstanding.loading}
            error={outstanding.error}
            onOpen={onOpenOutstanding}
          >
            <OutstandingList data={outstanding.data} />
          </AccordionSection>

          <AccordionSection
            title="Absconding Report"
            subtitle="Rolling monthly absconding sold, collection received and pending by source"
            badge="Absconding"
            loading={absconding.loading}
            error={absconding.error}
            onOpen={onOpenAbsconding}
          >
            <AbscondingReport data={absconding.data} />
          </AccordionSection>

          <AccordionSection
            title="Fine Collection Report"
            subtitle="Rolling monthly fine issued, collection received and pending by source"
            badge="Fine"
            loading={fine.loading}
            error={fine.error}
            onOpen={onOpenFine}
          >
            <FineCollectionReport data={fine.data} />
          </AccordionSection>

        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="mt-10 py-5 px-6 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-400">© {new Date().getFullYear()} GoKite. All rights reserved.</p>
      </footer>
    </div>
  );
}
