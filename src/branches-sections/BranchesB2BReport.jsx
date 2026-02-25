import { fmtInt, fmtPct } from '../utils/formatters';

function GrowthBadge({ value }) {
  const pos = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded ${
        pos ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
      }`}
    >
      {pos ? '▲' : '▼'} {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export default function BranchesB2BReport({ data }) {
  if (!data?.data) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-4 py-2 text-center w-10 border-b border-slate-200">#</th>
            <th className="px-4 py-2 text-left border-b border-slate-200">Particular</th>
            <th className="px-4 py-2 text-right border-b border-slate-200">Current Month</th>
            <th className="px-4 py-2 text-right border-b border-slate-200">Previous Month</th>
            <th className="px-4 py-2 text-right border-b border-slate-200">Growth</th>
          </tr>
        </thead>
        <tbody className="text-slate-700">
          {(data.data ?? []).map((row, i) => (
            <tr
              key={row.particular}
              className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${
                i % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
              }`}
            >
              <td className="px-4 py-2.5 text-center text-slate-400 tabular-nums">{row.sl_no}</td>
              <td className="px-4 py-2.5 font-medium text-slate-900">{row.particular}</td>
              <td className="px-4 py-2.5 text-right tabular-nums font-semibold">
                {fmtInt(row.current_month_count)}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-slate-500">
                {fmtInt(row.previous_month_count)}
              </td>
              <td className="px-4 py-2.5 text-right">
                <GrowthBadge value={row.growth_percentage} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
