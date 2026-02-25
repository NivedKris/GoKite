import { useState, useRef, useEffect } from 'react';
import { toMonthInput, fromMonthInput, monthRange } from '../utils/formatters';
import { branchesApi } from '../utils/branchesApi';
import { getFilterState, saveFilterState, saveCompanies } from '../utils/filterState';

// ─── Shared MultiSelect ────────────────────────────────────────────────────
function MultiSelect({ options, selected, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (id) =>
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  const allSelected = selected.length === options.length && options.length > 0;
  const label =
    selected.length === 0
      ? placeholder
      : selected.length === options.length
        ? `All Branches (${options.length})`
        : `${selected.length} selected`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-2 w-full pl-3 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 hover:border-slate-300 transition-colors"
      >
        <span className={selected.length === 0 ? 'text-slate-400' : ''}>{label}</span>
        <svg
          viewBox="0 0 24 24"
          className={`w-4 h-4 fill-current text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 w-full min-w-[220px] bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1">
          <label className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer border-b border-slate-100">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => onChange(allSelected ? [] : options.map((o) => o.id))}
              className="rounded text-primary focus:ring-primary"
            />
            <span className="font-semibold">Select All</span>
          </label>
          {options.map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.id)}
                onChange={() => toggle(opt.id)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>{opt.name}</span>
              {opt.code && (
                <span className="ml-auto text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  {opt.code}
                </span>
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Branches FilterBar ─────────────────────────────────────────────────────
export default function BranchesFilterBar({ onApply }) {
  const now = new Date();
  const defaultMonth = toMonthInput(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const persisted = getFilterState();
  const [month, setMonth] = useState(persisted?.month ?? defaultMonth);
  const [companies, setCompanies] = useState([]);
  const [companyIds, setCompanyIds] = useState(persisted?.companyIds ?? []);

  // Persist filter state whenever month or companyIds change
  useEffect(() => { saveFilterState({ month, companyIds }); }, [month, companyIds]);

  // Keep a stable ref to onApply so auto-fire effect doesn't need it as a dep
  const onApplyRef = useRef(onApply);
  useEffect(() => { onApplyRef.current = onApply; });
  const didAutoApply = useRef(false);

  // Auto-fire onApply once companies are loaded
  useEffect(() => {
    if (companies.length > 0 && !didAutoApply.current) {
      didAutoApply.current = true;
      const d = fromMonthInput(month);
      const { dateFrom, dateTo } = monthRange(d);
      onApplyRef.current({ dateFrom, dateTo, companyIds: companies.map((c) => c.id) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companies]);

  useEffect(() => {
    branchesApi
      .companies()
      .then((res) => {
        // branches API returns { companies: [...], mapping: {}, total_companies: N }
        const list = (res.companies ?? []).map((c) => ({
          id: c.id,
          name: c.name,
          code: c.code,
          location: c.location,
        }));
        setCompanies(list);
        saveCompanies(list);
        if (!getFilterState()?.companyIds?.length) {
          setCompanyIds(list.map((c) => c.id));
        }
      })
      .catch(() => {
        setCompanies([]);
        if (!getFilterState()?.companyIds?.length) {
          setCompanyIds([]);
        }
      });
  }, []);

  function handleApply() {
    const d = fromMonthInput(month);
    const { dateFrom, dateTo } = monthRange(d);
    onApply({ dateFrom, dateTo, companyIds });
  }

  function handleClear() {
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    setMonth(toMonthInput(prev));
    setCompanyIds(companies.map((c) => c.id));
  }

  return (
    <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl px-4 py-3 stripe-shadow">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide px-0.5">
            Fiscal Month
          </label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-slate-300 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-[200px] max-w-xs">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide px-0.5">
            Branches
          </label>
          <MultiSelect
            options={companies}
            selected={companyIds}
            onChange={setCompanyIds}
            placeholder="Select branches…"
          />
        </div>

        <div className="flex items-end gap-2 pb-0">
          <button
            type="button"
            onClick={handleApply}
            disabled={companyIds.length === 0}
            className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
