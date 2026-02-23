import { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// AccordionSection – collapsible card with smooth animation
// ─────────────────────────────────────────────────────────────────────────────

export default function AccordionSection({
  title,
  subtitle,
  badge,
  defaultOpen = false,
  children,
  loading = false,
  error = null,
  onOpen,           // called the first time the section is opened
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [triggered, setTriggered] = useState(defaultOpen);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && !triggered) {
      // First ever open — mark triggered and fetch
      setTriggered(true);
      onOpen?.();
    }
    // If already triggered, DashboardPage's filter-change effect
    // handles re-fetching when filters change, so we don't double-fetch here.
  }

  return (
    <div className={`bg-white rounded-lg border stripe-shadow overflow-hidden ${open ? 'border-primary/40' : 'border-slate-200'} transition-colors duration-200`}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={toggle}
        className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-slate-50 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-1 self-stretch rounded-full flex-shrink-0 transition-colors duration-200 ${open ? 'bg-primary' : 'bg-slate-300'}`}
          />
          <div className="min-w-0">
            <h4 className="font-bold text-slate-900 text-sm leading-tight">{title}</h4>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5 leading-tight truncate">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {badge && (
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded uppercase bg-slate-100 text-slate-500 tracking-wide">
              {badge}
            </span>
          )}
          {/* Chevron */}
          <svg
            viewBox="0 0 24 24"
            className={`w-4 h-4 fill-current text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          >
            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
          </svg>
        </div>
      </button>

      {/* ── Animated content area ────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: 'grid-template-rows 280ms ease',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div className="border-t border-slate-100">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-10 text-slate-500 text-sm">
                <svg className="animate-spin w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Loading data…
              </div>
            )}
            {error && (
              <div className="m-4 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
                <strong>Error:</strong> {error}
              </div>
            )}
            {!loading && !error && children}
          </div>
        </div>
      </div>
    </div>
  );
}
