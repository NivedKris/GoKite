import { fmtInt, fmtMonth } from '../utils/formatters';
import { useEffect, useRef } from 'react';

export default function B2BIndividualDetails({ data }) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    // Measure widest table and apply minWidth to all tables to match longest
    if (!wrapperRef.current) return;
    const tables = Array.from(wrapperRef.current.querySelectorAll('table'));
    if (!tables.length) return;
    let max = 0;
    tables.forEach((t) => {
      // reset any previously set minWidth to get intrinsic width
      t.style.minWidth = '';
      const w = t.scrollWidth || t.offsetWidth || 0;
      if (w > max) max = w;
    });
    if (max > 0) {
      tables.forEach((t) => {
        t.style.minWidth = `${max}px`;
      });
    }
  }, [data]);

  if (!data?.months) return null;

  const months = data.months ?? [];

  return (
    <div className="overflow-x-auto" ref={wrapperRef}>
      {(data.data ?? []).map((staff) => (
        <table key={staff.staff_name} className="w-full text-sm mb-0">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-200">
              <th colSpan={months.length + 3} className="px-4 py-2 text-left">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    {staff.staff_name}
                  </span>
                </div>
              </th>
            </tr>
            <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="px-4 py-2 text-center w-10 border-b border-slate-200">#</th>
              <th className="px-4 py-2 text-left border-b border-slate-200 whitespace-nowrap">Source</th>
              {months.map((m, i) => (
                <th key={m} className="px-4 py-2 text-right border-b border-slate-200 whitespace-nowrap">
                  {i === 0 ? 'Current Month' : fmtMonth(m)}
                </th>
              ))}
              <th className="px-4 py-2 text-right border-b border-slate-200 whitespace-nowrap">Target</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {(staff.sources ?? []).map((src, si) => (
              <tr
                key={src.source}
                className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${si % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'}`}
              >
                <td className="px-4 py-2.5 text-center text-slate-400 tabular-nums">{si + 1}</td>
                <td className="px-4 py-2.5 font-medium text-slate-900 whitespace-nowrap">{src.source}</td>
                {months.map((m) => (
                  <td key={m} className="px-4 py-2.5 text-right tabular-nums">
                    {fmtInt(src.monthly_counts?.[m] ?? 0)}
                  </td>
                ))}
                <td className="px-4 py-2.5 text-right tabular-nums text-slate-500">
                  {fmtInt(src.target_count ?? 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}

      {/* Totals table (if present) */}
      {data.totals && (
        <table className="w-full text-sm">
          <tfoot>
            <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold text-slate-900">
              <td className="px-4 py-2.5 text-center w-10" />
              <td className="px-4 py-2.5 font-extrabold whitespace-nowrap">Total</td>
              {months.map((m) => (
                <td key={m} className="px-4 py-2.5 text-right tabular-nums">
                  {fmtInt(data.totals.monthly_totals?.[m] ?? 0)}
                </td>
              ))}
              <td className="px-4 py-2.5" />
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}
