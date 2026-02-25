import { fmtCurrency, fmtInt, fmtMonth } from '../utils/formatters';

// ── Fine Details table ────────────────────────────────────────────────────────
function FineDetails({ details }) {
  if (!details?.data) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-4 py-2 text-center w-10 border-b border-slate-200">#</th>
            <th className="px-4 py-2 text-left border-b border-slate-200">Customer Name</th>
            <th className="px-4 py-2 text-left border-b border-slate-200">Department</th>
            <th className="px-4 py-2 text-right border-b border-slate-200">Count</th>
            <th className="px-4 py-2 text-right border-b border-slate-200">Amount (AED)</th>
            <th className="px-4 py-2 text-right border-b border-slate-200">Received (AED)</th>
            <th className="px-4 py-2 text-right border-b border-slate-200">Balance (AED)</th>
          </tr>
        </thead>
        <tbody className="text-slate-700">
          {(details.data ?? []).map((r, i) => (
            <tr
              key={`${r.customer_name}-${i}`}
              className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${
                i % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
              }`}
            >
              <td className="px-4 py-2.5 text-center text-slate-400 tabular-nums">{r.sl_no}</td>
              <td className="px-4 py-2.5 font-medium text-slate-900">{r.customer_name}</td>
              <td className="px-4 py-2.5 text-slate-600">{r.department}</td>
              <td className="px-4 py-2.5 text-right tabular-nums">{fmtInt(r.count)}</td>
              <td className="px-4 py-2.5 text-right tabular-nums">{fmtCurrency(r.amount)}</td>
              <td className="px-4 py-2.5 text-right tabular-nums text-emerald-600">
                {fmtCurrency(r.received)}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-rose-500">
                {fmtCurrency(r.balance)}
              </td>
            </tr>
          ))}
        </tbody>
        {details.totals && (
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-900">
              <td className="px-4 py-2.5 text-center" />
              <td className="px-4 py-2.5 font-extrabold" colSpan={2}>
                Total
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums">
                {fmtInt(details.totals.count)}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums">
                {fmtCurrency(details.totals.amount)}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-emerald-600">
                {fmtCurrency(details.totals.received)}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-rose-500">
                {fmtCurrency(details.totals.balance)}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

// ── Rolling amount sub-table ──────────────────────────────────────────────────
function RollingBlock({ title, accent, months, section }) {
  if (!section?.data) return null;

  return (
    <div>
      <div
        className={`px-4 py-2 border-y border-slate-100 ${accent} text-xs font-bold uppercase tracking-wider`}
      >
        {title}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-max">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-2 text-left border-b border-slate-200 whitespace-nowrap">
                Source
              </th>
              {months.map((m, i) => (
                <th
                  key={m}
                  className="px-4 py-2 text-right border-b border-slate-200 whitespace-nowrap"
                >
                  {i === 0 ? 'Current' : fmtMonth(m)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {(section.data ?? []).map((row, i) => (
              <tr
                key={row.source}
                className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${
                  i % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
                }`}
              >
                <td className="px-4 py-2.5 font-medium text-slate-900 whitespace-nowrap">
                  {row.source}
                </td>
                {months.map((m) => (
                  <td key={m} className="px-4 py-2.5 text-right tabular-nums">
                    {fmtCurrency(row.amounts?.[m] ?? 0)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {section.total && (
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-900">
                <td className="px-4 py-2.5 font-extrabold whitespace-nowrap">Total</td>
                {months.map((m) => (
                  <td key={m} className="px-4 py-2.5 text-right tabular-nums">
                    {fmtCurrency(section.total?.[m] ?? 0)}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

export default function BranchesFine({ details, prevComparison }) {
  return (
    <div className="space-y-0 divide-y divide-slate-100">
      {/* Fine Details */}
      <div>
        <div className="px-4 py-2 bg-slate-100 border-b border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Fine Customer Details
          </span>
        </div>
        <FineDetails details={details} />
      </div>

      {/* Previous Comparison Rolling */}
      {prevComparison?.months && (
        <div>
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              12-Month Rolling Comparison
            </span>
          </div>
          <RollingBlock
            title="Fines List"
            accent="bg-rose-50/60 text-rose-700"
            months={prevComparison.months}
            section={prevComparison.fine_sold}
          />
          <RollingBlock
            title="Collection Received"
            accent="bg-emerald-50/60 text-emerald-700"
            months={prevComparison.months}
            section={prevComparison.collection_received}
          />
          <RollingBlock
            title="Collection Pending"
            accent="bg-amber-50/60 text-amber-700"
            months={prevComparison.months}
            section={prevComparison.collection_pending}
          />
        </div>
      )}
    </div>
  );
}
