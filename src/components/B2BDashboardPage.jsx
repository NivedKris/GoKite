import { useCallback, useEffect, useRef, useState } from 'react';
import { monthRange, fmtCurrency, fmtInt } from '../utils/formatters';
import { b2bApi } from '../utils/b2bApi';
import B2BFilterBar from '../components/B2BFilterBar';
import KpiCard from '../components/KpiCard';
import AccordionSection from '../components/AccordionSection';
import LoadingOverlay from '../components/LoadingOverlay';
import { Link } from 'react-router-dom';

// Sections
import B2BDeptProductsReport from '../b2b-sections/B2BDeptProductsReport';
import B2BIndividualDetails from '../b2b-sections/B2BIndividualDetails';
import B2BTeamWise from '../b2b-sections/B2BTeamWise';
import { B2BVisaSplitUp, B2BA2ASplitUp, B2BServiceReport, B2BAgencyReport } from '../b2b-sections/B2BRollingCountTables';
import B2BFundCollection from '../b2b-sections/B2BFundCollection';
import B2BAgencyConversion from '../b2b-sections/B2BAgencyConversion';
import B2BAbscondingSource from '../b2b-sections/B2BAbscondingSource';
import B2BFineSource from '../b2b-sections/B2BFineSource';

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

// ─────────────────────────────────────────────────────────────────────────────
// B2B Dashboard Page
// ─────────────────────────────────────────────────────────────────────────────
export default function B2BDashboardPage() {
  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const initialRange = monthRange(prevMonth);
  const [filters, setFilters] = useState({
    dateFrom: initialRange.dateFrom,
    dateTo: initialRange.dateTo,
    companyIds: [1, 2, 3, 4, 5],
  });

  const [summary, setSummary] = useState({ data: null, loading: true, error: null });

  const [deptProducts, fetchDeptProducts]         = useSectionState();
  const [individual, fetchIndividual]             = useSectionState();
  const [teamWise, fetchTeamWise]                 = useSectionState();
  const [visaSplit, fetchVisaSplit]               = useSectionState();
  const [a2aSplit, fetchA2ASplit]                 = useSectionState();
  const [serviceReport, fetchServiceReport]       = useSectionState();
  const [agencyReport, fetchAgencyReport]         = useSectionState();
  const [fundCollection, fetchFundCollection]     = useSectionState();
  const [agencyConversion, fetchAgencyConversion] = useSectionState();
  const [absconding, fetchAbsconding]             = useSectionState();
  const [fine, fetchFine]                         = useSectionState();

  const isFirstRender = useRef(true);

  // Load summary on filter change
  useEffect(() => {
    async function loadSummary() {
      setSummary({ data: null, loading: true, error: null });
      try {
        const data = await b2bApi.summary(filters.dateFrom, filters.dateTo, filters.companyIds);
        setSummary({ data, loading: false, error: null });
      } catch (err) {
        setSummary({ data: null, loading: false, error: err.message });
      }
    }
    loadSummary();
  }, [filters]);

  // Re-fetch open sections on filter change
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const { dateFrom, dateTo, companyIds } = filters;
    if (deptProducts.loaded)    fetchDeptProducts(()    => b2bApi.departmentProducts(dateFrom, dateTo, companyIds));
    if (individual.loaded)      fetchIndividual(()      => b2bApi.individualDetails(dateFrom, dateTo, companyIds));
    if (teamWise.loaded)        fetchTeamWise(()        => b2bApi.teamWise(dateFrom, dateTo, companyIds));
    if (visaSplit.loaded)       fetchVisaSplit(()       => b2bApi.visaSplitUp(dateFrom, dateTo, companyIds));
    if (a2aSplit.loaded)        fetchA2ASplit(()        => b2bApi.a2aSplitUp(dateFrom, dateTo, companyIds));
    if (serviceReport.loaded)   fetchServiceReport(()   => b2bApi.serviceReport(dateFrom, dateTo, companyIds));
    if (agencyReport.loaded)    fetchAgencyReport(()    => b2bApi.agencyReport(dateFrom, dateTo, companyIds));
    if (fundCollection.loaded)  fetchFundCollection(()  => b2bApi.fundCollection(dateFrom, dateTo, companyIds));
    if (agencyConversion.loaded)fetchAgencyConversion(()=> b2bApi.agencyConversion(dateFrom, dateTo, companyIds));
    if (absconding.loaded)      fetchAbsconding(()      => b2bApi.abscondingSource(dateFrom, dateTo, companyIds));
    if (fine.loaded)            fetchFine(()            => b2bApi.fineSource(dateFrom, dateTo, companyIds));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  function handleApply(newFilters) { setFilters(newFilters); }

  const { dateFrom, dateTo, companyIds } = filters;
  const kpi = summary.data;

  const onOpenDeptProducts    = () => fetchDeptProducts(()    => b2bApi.departmentProducts(dateFrom, dateTo, companyIds));
  const onOpenIndividual      = () => fetchIndividual(()      => b2bApi.individualDetails(dateFrom, dateTo, companyIds));
  const onOpenTeamWise        = () => fetchTeamWise(()        => b2bApi.teamWise(dateFrom, dateTo, companyIds));
  const onOpenVisaSplit       = () => fetchVisaSplit(()       => b2bApi.visaSplitUp(dateFrom, dateTo, companyIds));
  const onOpenA2ASplit        = () => fetchA2ASplit(()        => b2bApi.a2aSplitUp(dateFrom, dateTo, companyIds));
  const onOpenServiceReport   = () => fetchServiceReport(()   => b2bApi.serviceReport(dateFrom, dateTo, companyIds));
  const onOpenAgencyReport    = () => fetchAgencyReport(()    => b2bApi.agencyReport(dateFrom, dateTo, companyIds));
  const onOpenFundCollection  = () => fetchFundCollection(()  => b2bApi.fundCollection(dateFrom, dateTo, companyIds));
  const onOpenAgencyConversion= () => fetchAgencyConversion(()=> b2bApi.agencyConversion(dateFrom, dateTo, companyIds));
  const onOpenAbsconding      = () => fetchAbsconding(()      => b2bApi.abscondingSource(dateFrom, dateTo, companyIds));
  const onOpenFine            = () => fetchFine(()            => b2bApi.fineSource(dateFrom, dateTo, companyIds));

  return (
    <div className="min-h-screen bg-[#f6f7f8] font-display">
      <LoadingOverlay visible={summary.loading} />
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            <span>GoKite</span>
            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            <span className="text-slate-700">Monthly B2B Summary</span>
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Monthly B2B Summary Report
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Agency &amp; staff performance overview for the selected month
              </p>
            </div>
            {/* ── Switch to B2C ── */}
            <Link
              to="/b2c"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 hover:border-primary hover:text-primary transition-colors shadow-sm whitespace-nowrap"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              Switch to B2C
            </Link>
          </div>
        </div>

        {/* ── Filter Bar ─────────────────────────────────────────────── */}
        <B2BFilterBar onApply={handleApply} />

        {/* ── KPI Cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            label="App Visas"
            icon="conversion"
            value={
              summary.loading ? <span className="text-slate-300 animate-pulse">Loading…</span>
              : kpi ? fmtInt(kpi.number_of_app_visa) : '—'
            }
          />
          <KpiCard
            label="Absconding Count"
            icon="reviews"
            value={
              summary.loading ? <span className="text-slate-300 animate-pulse">Loading…</span>
              : kpi ? fmtInt(kpi.total_absconding_count) : '—'
            }
          />
          <KpiCard
            label="Absconding Collection"
            icon="payments"
            value={
              summary.loading ? <span className="text-slate-300 animate-pulse">Loading…</span>
              : kpi ? fmtCurrency(kpi.absconding_collection_amount) : '—'
            }
          />
          <KpiCard
            label="Active Agencies"
            icon="revenue"
            value={
              summary.loading ? <span className="text-slate-300 animate-pulse">Loading…</span>
              : kpi ? fmtInt(kpi.active_agency_count) : '—'
            }
          />
          <KpiCard
            label="Total A2A"
            icon="target"
            value={
              summary.loading ? <span className="text-slate-300 animate-pulse">Loading…</span>
              : kpi ? fmtInt(kpi.total_a2a_count) : '—'
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
            title="Department Product Report"
            subtitle="Application count per product category"
            badge="Products"
            loading={deptProducts.loading}
            error={deptProducts.error}
            onOpen={onOpenDeptProducts}
          >
            <B2BDeptProductsReport data={deptProducts.data} />
          </AccordionSection>

          <AccordionSection
            title="Individual Details"
            subtitle="Monthly application counts per staff member broken down by source"
            badge="Staff × Source"
            loading={individual.loading}
            error={individual.error}
            onOpen={onOpenIndividual}
          >
            <B2BIndividualDetails data={individual.data} />
          </AccordionSection>

          <AccordionSection
            title="Team Wise Monthly Applications"
            subtitle="Rolling 12-month application totals per staff grouped by sales team"
            badge="Team"
            loading={teamWise.loading}
            error={teamWise.error}
            onOpen={onOpenTeamWise}
          >
            <B2BTeamWise data={teamWise.data} />
          </AccordionSection>

          <AccordionSection
            title="Visa Split-Up"
            subtitle="Monthly application counts by visa service type"
            badge="Visa"
            loading={visaSplit.loading}
            error={visaSplit.error}
            onOpen={onOpenVisaSplit}
          >
            <B2BVisaSplitUp data={visaSplit.data} />
          </AccordionSection>

          <AccordionSection
            title="A2A Split-Up"
            subtitle="Monthly A2A counts by carrier / airline"
            badge="A2A"
            loading={a2aSplit.loading}
            error={a2aSplit.error}
            onOpen={onOpenA2ASplit}
          >
            <B2BA2ASplitUp data={a2aSplit.data} />
          </AccordionSection>

          <AccordionSection
            title="Service Report"
            subtitle="Monthly counts by service category: A2A Flight, A2A Bus, Visa"
            badge="Services"
            loading={serviceReport.loading}
            error={serviceReport.error}
            onOpen={onOpenServiceReport}
          >
            <B2BServiceReport data={serviceReport.data} />
          </AccordionSection>

          <AccordionSection
            title="Agency Report"
            subtitle="Monthly agency pipeline status: Active, New Conversion, Restarted, Followup, Closed"
            badge="Agency"
            loading={agencyReport.loading}
            error={agencyReport.error}
            onOpen={onOpenAgencyReport}
          >
            <B2BAgencyReport data={agencyReport.data} />
          </AccordionSection>

          <AccordionSection
            title="Fund Collection Outstanding"
            subtitle="Current outstanding receivable amount per staff member"
            badge="Outstanding"
            loading={fundCollection.loading}
            error={fundCollection.error}
            onOpen={onOpenFundCollection}
          >
            <B2BFundCollection data={fundCollection.data} />
          </AccordionSection>

          <AccordionSection
            title="Agency Conversion Report"
            subtitle="Restarted and new agency conversions per staff for the selected period"
            badge="Conversion"
            loading={agencyConversion.loading}
            error={agencyConversion.error}
            onOpen={onOpenAgencyConversion}
          >
            <B2BAgencyConversion data={agencyConversion.data} />
          </AccordionSection>

          <AccordionSection
            title="Absconding Source Report"
            subtitle="Rolling monthly absconding sold, collection received and pending by source"
            badge="Absconding"
            loading={absconding.loading}
            error={absconding.error}
            onOpen={onOpenAbsconding}
          >
            <B2BAbscondingSource data={absconding.data} />
          </AccordionSection>

          <AccordionSection
            title="Fine Source Report"
            subtitle="Rolling monthly fine sold, collection received and pending by source"
            badge="Fine"
            loading={fine.loading}
            error={fine.error}
            onOpen={onOpenFine}
          >
            <B2BFineSource data={fine.data} />
          </AccordionSection>

        </div>
      </main>

      <footer className="mt-10 py-5 px-6 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-400">© {new Date().getFullYear()} GoKite. All rights reserved.</p>
      </footer>
    </div>
  );
}
