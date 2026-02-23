import { fmtCurrency } from '../utils/formatters';
import { useEffect, useRef } from 'react';

export default function SalesTeamStaffReport({ data }) {
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
  }, [data]);

  if (!data?.data) return null;

  return (
    <div className="overflow-x-auto" ref={wrapperRef}>
      {data.data.map((team) => (
        <table key={team.sales_team} className="w-full text-sm mb-0">
          {/* ── Team header ────────────────────────────────────────────── */}
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-200">
              <th colSpan={5} className="px-4 py-2 text-left">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    {team.sales_team}
                  </span>
                  <span className="ml-auto text-xs font-semibold text-slate-500">
                    Branch Profit:{' '}
                    <span className="text-slate-900 font-bold tabular-nums">
                      {fmtCurrency(team.total_branch_profit)}
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
            {(team.staffs ?? []).map((staff, i) => {
              const onTarget = staff.revenue_total >= staff.revenue_target;
              return (
                <tr
                  key={staff.sl_no}
                  className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${i % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'}`}
                >
                  <td className="px-4 py-2.5 text-center text-slate-400 tabular-nums">{staff.sl_no}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-900">{staff.staff_name}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{fmtCurrency(staff.revenue_total)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{fmtCurrency(staff.total_sales)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    <div className="flex items-center justify-end gap-2">
                      <span>{fmtCurrency(staff.revenue_target)}</span>
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
        </table>
      ))}
    </div>
  );
}
