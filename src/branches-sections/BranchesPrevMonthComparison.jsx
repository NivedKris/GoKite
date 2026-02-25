import { fmtCurrency, fmtMonth } from '../utils/formatters';
import { useEffect, useRef } from 'react';

export default function BranchesPrevMonthComparison({ data }) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const tables = Array.from(wrapperRef.current.querySelectorAll('table'));
    if (!tables.length) return;
    let max = 0;
    tables.forEach((t) => {
      t.style.minWidth = '';
      const w = t.scrollWidth || t.offsetWidth || 0;
      if (w > max) max = w;
    });
    const EXTRA_PAD = 120;
    if (max > 0) tables.forEach((t) => { t.style.minWidth = `${max + EXTRA_PAD}px`; });
  }, [data]);

  if (!data?.months) return null;

  const months = data.months ?? [];

  return (
    <div className="overflow-x-auto" ref={wrapperRef}>
      {(data.data ?? []).map((team) => (
        <table key={team.sales_team} className="w-full text-sm mb-0">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-200">
              <th colSpan={months.length + 2} className="px-4 py-2 text-left">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    {team.sales_team}
                  </span>
                </div>
              </th>
            </tr>
            <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="px-4 py-2 text-center w-10 border-b border-slate-200">#</th>
              <th className="px-4 py-2 text-left border-b border-slate-200 whitespace-nowrap">
                Staff Name
              </th>
              {months.map((m, i) => (
                <th
                  key={m}
                  className="px-4 py-2 text-right border-b border-slate-200 whitespace-nowrap"
                >
                  {i === 0 ? 'Current Month' : fmtMonth(m)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {(team.staffs ?? []).map((s, si) => (
              <tr
                key={s.staff_name}
                className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${
                  si % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
                }`}
              >
                <td className="px-4 py-2.5 text-center text-slate-400 tabular-nums">{s.sl_no}</td>
                <td className="px-4 py-2.5 font-medium text-slate-900 whitespace-nowrap">
                  {s.staff_name}
                </td>
                {months.map((m) => (
                  <td key={m} className="px-4 py-2.5 text-right tabular-nums">
                    {fmtCurrency(s.revenues?.[m] ?? 0)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 bg-slate-50 font-bold text-slate-800">
              <td className="px-4 py-2.5 text-center" />
              <td className="px-4 py-2.5 font-extrabold whitespace-nowrap">
                {team.sales_team} — Total
              </td>
              {months.map((m) => (
                <td key={m} className="px-4 py-2.5 text-right tabular-nums">
                  {fmtCurrency(team.team_total?.[m] ?? 0)}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      ))}

      {/* Branch Grand Total */}
      {data.branch_total && (
        <table className="w-full text-sm">
          <tfoot>
            <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold text-slate-900">
              <td className="px-4 py-2.5 text-center w-10" />
              <td className="px-4 py-2.5 font-extrabold whitespace-nowrap">Branch Grand Total</td>
              {months.map((m) => (
                <td key={m} className="px-4 py-2.5 text-right tabular-nums text-primary">
                  {fmtCurrency(data.branch_total?.[m] ?? 0)}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}
