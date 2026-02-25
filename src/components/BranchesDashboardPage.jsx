import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { monthRange, fmtCurrency, fmtInt, fmtPct } from '../utils/formatters';
import { branchesApi } from '../utils/branchesApi';
import { buildBranchesWorkbook } from '../utils/buildBranchesWorkbook';
import BranchesFilterBar from '../components/BranchesFilterBar';
import KpiCard from '../components/KpiCard';
import AccordionSection from '../components/AccordionSection';
import LoadingOverlay from '../components/LoadingOverlay';
import ExportButton from '../components/ExportButton';

// Sections
import BranchesDeptWise from '../branches-sections/BranchesDeptWise';
import BranchesDeptStaff from '../branches-sections/BranchesDeptStaff';
import BranchesPrevMonthComparison from '../branches-sections/BranchesPrevMonthComparison';
import BranchesConversion from '../branches-sections/BranchesConversion';
import BranchesTotalReview from '../branches-sections/BranchesTotalReview';
import BranchesB2BReport from '../branches-sections/BranchesB2BReport';
import BranchesCorporateClients from '../branches-sections/BranchesCorporateClients';
import BranchesAbsconding from '../branches-sections/BranchesAbsconding';
import BranchesFine from '../branches-sections/BranchesFine';
import BranchesOutstanding from '../branches-sections/BranchesOutstanding';

// ─────────────────────────────────────────────────────────────────────────────
// Section state hook
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

// Helper: get YYYY-MM from dateFrom string
function toMonth(dateFrom) {
  return dateFrom ? dateFrom.slice(0, 7) : '';
}

// ─────────────────────────────────────────────────────────────────────────────
// Branches Dashboard Page
// ─────────────────────────────────────────────────────────────────────────────
export default function BranchesDashboardPage() {
  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const initialRange = monthRange(prevMonth);
  const [filters, setFilters] = useState({
    dateFrom: initialRange.dateFrom,
    dateTo: initialRange.dateTo,
    companyIds: [],
  });

  const [summary, setSummary] = useState({ data: null, loading: true, error: null });

  const [deptWise, fetchDeptWise] = useSectionState();
  const [deptStaff, fetchDeptStaff] = useSectionState();
  const [prevMonthComp, fetchPrevMonthComp] = useSectionState();
  const [conversion, fetchConversion] = useSectionState();
  const [review, fetchReview] = useSectionState();
  const [b2bReport, fetchB2BReport] = useSectionState();
  const [corporateClients, fetchCorporateClients] = useSectionState();
  // Absconding combines API #9 (details) + #10 (monthly)
  const [abscondingDetails, fetchAbscondingDetails] = useSectionState();
  const [abscondingMonthly, fetchAbscondingMonthly] = useSectionState();
  // Fine combines API #11 (details) + #12 (prev comparison)
  const [fineDetails, fetchFineDetails] = useSectionState();
  const [finePrevComp, fetchFinePrevComp] = useSectionState();
  const [outstanding, fetchOutstanding] = useSectionState();

  const isFirstRender = useRef(true);

  // Load summary on filter change
  useEffect(() => {
    if (filters.companyIds.length === 0) return;
    async function loadSummary() {
      setSummary({ data: null, loading: true, error: null });
      try {
        const data = await branchesApi.summary(filters.dateFrom, filters.dateTo, filters.companyIds);
        setSummary({ data, loading: false, error: null });
      } catch (err) {
        setSummary({ data: null, loading: false, error: err.message });
      }
    }
    loadSummary();
  }, [filters]);

  // Re-fetch open sections when filters change
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const { dateFrom, dateTo, companyIds } = filters;
    const month = toMonth(dateFrom);
    if (deptWise.loaded) fetchDeptWise(() => branchesApi.departmentWise(dateFrom, dateTo, companyIds));
    if (deptStaff.loaded) fetchDeptStaff(() => branchesApi.departmentStaff(dateFrom, dateTo, companyIds));
    if (prevMonthComp.loaded) fetchPrevMonthComp(() => branchesApi.prevMonthComparison(dateFrom, dateTo, companyIds));
    if (conversion.loaded) fetchConversion(() => branchesApi.conversionDetails(dateFrom, dateTo, companyIds));
    if (review.loaded) fetchReview(() => branchesApi.totalReview(dateFrom, dateTo, companyIds));
    if (b2bReport.loaded) fetchB2BReport(() => branchesApi.b2bReport(dateFrom, dateTo, companyIds));
    if (corporateClients.loaded) fetchCorporateClients(() => branchesApi.corporateClients(dateFrom, dateTo, companyIds, 1, 9999));
    if (abscondingDetails.loaded) fetchAbscondingDetails(() => branchesApi.abscondingDetails(dateFrom, dateTo, companyIds));
    if (abscondingMonthly.loaded) fetchAbscondingMonthly(() => branchesApi.abscondingMonthly(month, companyIds));
    if (fineDetails.loaded) fetchFineDetails(() => branchesApi.fineDetails(dateFrom, dateTo, companyIds));
    if (finePrevComp.loaded) fetchFinePrevComp(() => branchesApi.finePrevComparison(dateFrom, dateTo, companyIds));
    if (outstanding.loaded) fetchOutstanding(() => branchesApi.outstandingByCompany(dateFrom, dateTo, companyIds));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  function handleApply(newFilters) { setFilters(newFilters); }

  // ── Export all sections to Excel ─────────────────────────────────────────
  async function handleExport() {
    const { dateFrom, dateTo, companyIds } = filters;
    const month = toMonth(dateFrom);
    const [
      summaryData, deptWiseData, deptStaffData, prevMonthData,
      conversionData, reviewData, b2bReportData, corpClientsData,
      abscDetData, abscMonthlyData, fineDetData, finePrevData, outstandingData,
    ] = await Promise.all([
      branchesApi.summary(dateFrom, dateTo, companyIds),
      branchesApi.departmentWise(dateFrom, dateTo, companyIds),
      branchesApi.departmentStaff(dateFrom, dateTo, companyIds),
      branchesApi.prevMonthComparison(dateFrom, dateTo, companyIds),
      branchesApi.conversionDetails(dateFrom, dateTo, companyIds),
      branchesApi.totalReview(dateFrom, dateTo, companyIds),
      branchesApi.b2bReport(dateFrom, dateTo, companyIds),
      branchesApi.corporateClients(dateFrom, dateTo, companyIds, 1, 9999),
      branchesApi.abscondingDetails(dateFrom, dateTo, companyIds),
      branchesApi.abscondingMonthly(month, companyIds),
      branchesApi.fineDetails(dateFrom, dateTo, companyIds),
      branchesApi.finePrevComparison(dateFrom, dateTo, companyIds),
      branchesApi.outstandingByCompany(dateFrom, dateTo, companyIds),
    ]);
    const wb = buildBranchesWorkbook({
      filters,
      summary: summaryData,
      deptWise: deptWiseData,
      deptStaff: deptStaffData,
      prevMonth: prevMonthData,
      conversion: conversionData,
      review: reviewData,
      b2bReport: b2bReportData,
      corporateClients: corpClientsData,
      abscondingDetails: abscDetData,
      abscondingMonthly: abscMonthlyData,
      fineDetails: fineDetData,
      finePrevComparison: finePrevData,
      outstanding: outstandingData,
    });
    XLSX.writeFile(wb, `Branches_Report_${dateFrom}_to_${dateTo}.xlsx`);
  }

  const { dateFrom, dateTo, companyIds } = filters;
  const kpi = summary.data;
  const month = toMonth(dateFrom);

  // Section open handlers
  const onOpenDeptWise        = () => fetchDeptWise(()           => branchesApi.departmentWise(dateFrom, dateTo, companyIds));
  const onOpenDeptStaff       = () => fetchDeptStaff(()          => branchesApi.departmentStaff(dateFrom, dateTo, companyIds));
  const onOpenPrevMonth       = () => fetchPrevMonthComp(()      => branchesApi.prevMonthComparison(dateFrom, dateTo, companyIds));
  const onOpenConversion      = () => fetchConversion(()         => branchesApi.conversionDetails(dateFrom, dateTo, companyIds));
  const onOpenReview          = () => fetchReview(()             => branchesApi.totalReview(dateFrom, dateTo, companyIds));
  const onOpenB2BReport       = () => fetchB2BReport(()          => branchesApi.b2bReport(dateFrom, dateTo, companyIds));
  const onOpenCorporate       = () => fetchCorporateClients(()   => branchesApi.corporateClients(dateFrom, dateTo, companyIds, 1, 9999));
  const onOpenAbsconding      = () => {
    fetchAbscondingDetails(()  => branchesApi.abscondingDetails(dateFrom, dateTo, companyIds));
    fetchAbscondingMonthly(()  => branchesApi.abscondingMonthly(month, companyIds));
  };
  const onOpenFine            = () => {
    fetchFineDetails(()        => branchesApi.fineDetails(dateFrom, dateTo, companyIds));
    fetchFinePrevComp(()       => branchesApi.finePrevComparison(dateFrom, dateTo, companyIds));
  };
  const onOpenOutstanding     = () => fetchOutstanding(()        => branchesApi.outstandingByCompany(dateFrom, dateTo, companyIds));

  const abscondingLoading = abscondingDetails.loading || abscondingMonthly.loading;
  const abscondingError   = abscondingDetails.error || abscondingMonthly.error;
  const fineLoading       = fineDetails.loading || finePrevComp.loading;
  const fineError         = fineDetails.error || finePrevComp.error;

  return (
    <div className="min-h-screen bg-[#f6f7f8] font-display">
      <LoadingOverlay visible={summary.loading} />
      <main className="w-full px-4 sm:px-8 py-6 space-y-6">

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            <span>GoKite</span>
            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
            <span className="text-slate-700">Branches Dashboard</span>
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Branches Dashboard
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Combined B2C + B2B performance overview across all branches
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <ExportButton onExport={handleExport} />
              <Link
                to="/b2c"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 hover:border-primary hover:text-primary transition-colors shadow-sm whitespace-nowrap"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
                B2C
              </Link>
              <Link
                to="/b2b"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 hover:border-primary hover:text-primary transition-colors shadow-sm whitespace-nowrap"
              >
                B2B
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M4 11h12.17l-5.59-5.59L12 4l8 8-8 8-1.41-1.41L16.17 13H4v-2z" /></svg>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Filter Bar ─────────────────────────────────────────────── */}
        <BranchesFilterBar onApply={handleApply} />

        {/* ── KPI Cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          <KpiCard
            label="Total Sales"
            icon="payments"
            value={
              summary.loading ? <span className="text-slate-300 animate-pulse">Loading…</span>
              : kpi ? fmtCurrency(kpi.total_sales_amount) : '—'
            }
          />
          <KpiCard
            label="Conversion %"
            icon="conversion"
            value={
              summary.loading ? <span className="text-slate-300 animate-pulse">Loading…</span>
              : kpi ? fmtPct(kpi.conversion_percentage) : '—'
            }
          />
          <KpiCard
            label="Total Revenue"
            icon="revenue"
            value={
              summary.loading ? <span className="text-slate-300 animate-pulse">Loading…</span>
              : kpi ? fmtCurrency(kpi.total_revenue) : '—'
            }
          />
          <KpiCard
            label="Total Sales Count"
            icon="reviews"
            value={
              summary.loading ? <span className="text-slate-300 animate-pulse">Loading…</span>
              : kpi ? fmtInt(kpi.total_sale_count) : '—'
            }
          />
          <KpiCard
            label="Total Reviews"
            icon="reviews"
            value={
              summary.loading ? <span className="text-slate-300 animate-pulse">Loading…</span>
              : kpi ? fmtInt(kpi.total_review_count) : '—'
            }
          />
          <KpiCard
            label="Active Agencies"
            icon="target"
            value={
              summary.loading ? <span className="text-slate-300 animate-pulse">Loading…</span>
              : kpi ? fmtInt(kpi.active_agency_count) : '—'
            }
          />
          <KpiCard
            label="Visa Applications"
            icon="conversion"
            value={
              summary.loading ? <span className="text-slate-300 animate-pulse">Loading…</span>
              : kpi ? fmtInt(kpi.visa_application_count) : '—'
            }
          />
        </div>

        {summary.error && (
          <div className="px-4 py-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
            <strong>Summary error:</strong> {summary.error}
          </div>
        )}

        {/* ── Accordion Sections ────────────────────────────────────── */}
        <div className="space-y-3">

          <AccordionSection
            title="Department Wise Profit"
            subtitle="Profit breakdown by department across all branches"
            badge="Dept. Profit"
            loading={deptWise.loading}
            error={deptWise.error}
            onOpen={onOpenDeptWise}
          >
            <BranchesDeptWise data={deptWise.data} />
          </AccordionSection>

          <AccordionSection
            title="Staff Performance (Department Wise)"
            subtitle="Individual staff revenue, sales, and target performance by department"
            badge="Staff"
            loading={deptStaff.loading}
            error={deptStaff.error}
            onOpen={onOpenDeptStaff}
          >
            <BranchesDeptStaff data={deptStaff.data} />
          </AccordionSection>

          <AccordionSection
            title="Previous Month Comparison"
            subtitle="Rolling 12-month revenue comparison per staff grouped by sales team"
            badge="Rolling"
            loading={prevMonthComp.loading}
            error={prevMonthComp.error}
            onOpen={onOpenPrevMonth}
          >
            <BranchesPrevMonthComparison data={prevMonthComp.data} />
          </AccordionSection>

          <AccordionSection
            title="Conversion Details"
            subtitle="Lead-to-sale conversion metrics by sales team"
            badge="Conversion"
            loading={conversion.loading}
            error={conversion.error}
            onOpen={onOpenConversion}
          >
            <BranchesConversion data={conversion.data} />
          </AccordionSection>

          <AccordionSection
            title="Total Review"
            subtitle="Review counts per staff vs targets and rolling monthly breakdown"
            badge="Reviews"
            loading={review.loading}
            error={review.error}
            onOpen={onOpenReview}
          >
            <BranchesTotalReview data={review.data} />
          </AccordionSection>

          <AccordionSection
            title="B2B Report"
            subtitle="B2B operational metrics: agencies, conversions, applications vs previous month"
            badge="B2B"
            loading={b2bReport.loading}
            error={b2bReport.error}
            onOpen={onOpenB2BReport}
          >
            <BranchesB2BReport data={b2bReport.data} />
          </AccordionSection>

          <AccordionSection
            title="Corporate Client List"
            subtitle="New corporate clients created in the selected period"
            badge="Clients"
            loading={corporateClients.loading}
            error={corporateClients.error}
            onOpen={onOpenCorporate}
          >
            <BranchesCorporateClients data={corporateClients.data} />
          </AccordionSection>

          <AccordionSection
            title="Absconding Report"
            subtitle="Absconding customer details and 12-month rolling collection comparison"
            badge="Absconding"
            loading={abscondingLoading}
            error={abscondingError}
            onOpen={onOpenAbsconding}
          >
            <BranchesAbsconding
              details={abscondingDetails.data}
              monthly={abscondingMonthly.data}
            />
          </AccordionSection>

          <AccordionSection
            title="Fine Collection Report"
            subtitle="Fine customer details and 12-month rolling fine comparison by source"
            badge="Fine"
            loading={fineLoading}
            error={fineError}
            onOpen={onOpenFine}
          >
            <BranchesFine
              details={fineDetails.data}
              prevComparison={finePrevComp.data}
            />
          </AccordionSection>

          <AccordionSection
            title="Outstanding Report — Branch Wise"
            subtitle="Outstanding amounts grouped by department for each branch"
            badge="Outstanding"
            loading={outstanding.loading}
            error={outstanding.error}
            onOpen={onOpenOutstanding}
          >
            <BranchesOutstanding data={outstanding.data} />
          </AccordionSection>

        </div>
      </main>

      <footer className="mt-10 py-5 px-6 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-400">© {new Date().getFullYear()} GoKite. All rights reserved.</p>
      </footer>
    </div>
  );
}
