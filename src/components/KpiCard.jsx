// ─────────────────────────────────────────────────────────────────────────────
// KpiCard – enterprise KPI metric card
// ─────────────────────────────────────────────────────────────────────────────

const ICONS = {
  payments:        'M2 8.5A1.5 1.5 0 013.5 7h13A1.5 1.5 0 0118 8.5v.5H2v-.5zm0 2v5A1.5 1.5 0 003.5 17h13a1.5 1.5 0 001.5-1.5v-5H2z',
  conversion:      'M18 5a1 1 0 00-1-1H3a1 1 0 00-1 1v2a1 1 0 001 1h14a1 1 0 001-1V5zm-5 8a1 1 0 100 2 1 1 0 000-2zm-4 0a1 1 0 100 2 1 1 0 000-2zm-4 0a1 1 0 100 2 1 1 0 000-2z',
  revenue:         'M12 2a10 10 0 100 20A10 10 0 0012 2zm1 14.93V18a1 1 0 11-2 0v-1.07A7.002 7.002 0 015.07 13H5a1 1 0 110-2h.07A7.002 7.002 0 0111 5.07V5a1 1 0 112 0v.07A7.002 7.002 0 0118.93 11H19a1 1 0 110 2h-.07A7.002 7.002 0 0113 16.93z',
  reviews:         'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  target:          'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13v6l5 3-1 1.73-6-3.73V7h2z',
};

export default function KpiCard({ label, value, icon = 'payments', trend, subContent, variant = 'default' }) {
  const trendUp = trend && String(trend).startsWith('+');
  const trendDown = trend && String(trend).startsWith('-');
  const compact = variant === 'compact';

  const containerClass = `bg-white p-5 rounded-xl border border-slate-200 stripe-shadow flex flex-col gap-2 overflow-hidden ${compact ? 'min-h-[120px]' : 'min-h-[140px]'}`;
  const labelClass = 'text-[11px] font-bold text-slate-500 uppercase tracking-wide leading-tight';
  const valueClass = `${compact ? 'text-xl' : 'text-2xl'} font-extrabold tabular-nums text-slate-900 leading-tight break-words`;

  return (
    <div className={containerClass}>
      <div className="flex justify-between items-start">
        <p className={labelClass}>{label}</p>
        <span className="text-primary/70">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d={ICONS[icon] || ICONS.payments} />
          </svg>
        </span>
      </div>

      <h3 className={valueClass}>{value ?? '—'}</h3>

      {trend && (
        <div
          className={`flex items-center gap-1 text-sm font-semibold ${
            trendUp ? 'text-emerald-600' : trendDown ? 'text-rose-600' : 'text-slate-500'
          }`}
        >
          {trendUp && (
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
            </svg>
          )}
          {trendDown && (
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z" />
            </svg>
          )}
          <span>{trend}</span>
        </div>
      )}

      {subContent}
    </div>
  );
}
