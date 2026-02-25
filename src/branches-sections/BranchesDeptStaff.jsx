import { fmtCurrency } from '../utils/formatters';
import { useEffect, useRef } from 'react';

function DeptSection({ team }) {
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
    if (max > 0) tables.forEach((t) => (t.style.minWidth = `${max}px`));
  }, [team]);

  return (
    <div className="mb-0" ref={wrapperRef}>
      <table className="w-full text-sm mb-0">
        <thead>
          <tr className="bg-slate-100 border-b-2 border-slate-200">
            <th colSpan={5} className="px-4 py-2 text-left">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  {team.department}
                </span>
                <span className="ml-auto text-xs font-semibold text-slate-500">
                  Branch Profit:{' '}
                  <span className="text-slate-900 font-bold tabular-nums">
                    {fmtCurrency(team.department_total?.revenue_total ?? team.total_branch_profit ?? 0)}
                  </span>
                </span>
              </div>
            </th>
          </tr>
          <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <th className="px-4 py-2 text-center w-10 border-b border-slate-200">#</th>
            <th className="px-4 py-2 text-left border-b border-slate-200">Staff Name</th>
            <th className="px-4 py-2 text-right border-b border-slate-200">Revenue Total</th>
            <th className="px-4 py-2 text-right border-b border-slate-200">Total Sales</th>
            <th className="px-4 py-2 text-right border-b border-slate-200">Revenue Target</th>
          </tr>
        </thead>

        <tbody className="text-slate-700">
          {(team.staffs ?? []).map((s, i) => {
            const onTarget = s.revenue_total >= s.revenue_target;
            return (
              <tr
                key={s.sl_no ?? s.staff_name}
                className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${
                  i % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
                }`}
              >
                <td className="px-4 py-2.5 text-center text-slate-400 tabular-nums">{s.sl_no}</td>
                <td className="px-4 py-2.5 font-medium text-slate-900">{s.staff_name}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{fmtCurrency(s.revenue_total)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{fmtCurrency(s.total_sales)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  <div className="flex items-center justify-end gap-2">
                    <span>{fmtCurrency(s.revenue_target)}</span>
                    <span
                      className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
                        onTarget ? 'bg-emerald-500' : 'bg-rose-400'
                      }`}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>

        {team.department_total && (
          <tfoot>
            <tr className="border-t border-slate-200 bg-slate-50 font-bold text-slate-900">
              <td className="px-4 py-2.5 text-center" />
              <td className="px-4 py-2.5 font-extrabold">{team.department} — Total</td>
              <td className="px-4 py-2.5 text-right tabular-nums">
                {fmtCurrency(team.department_total.revenue_total)}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums">
                {fmtCurrency(team.department_total.total_sales)}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums">
                {fmtCurrency(team.department_total.revenue_target)}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

export default function BranchesDeptStaff({ data }) {
  if (!data?.data) return null;

  return (
    <div className="overflow-x-auto" role="region">
      {(data.data ?? []).map((team) => (
        <DeptSection key={team.department} team={team} />
      ))}
    </div>
  );
}
