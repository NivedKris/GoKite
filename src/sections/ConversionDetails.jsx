import React, { useEffect, useRef } from 'react';
import { fmtPct, fmtInt, fmtMonth } from '../utils/formatters';

function RatioBadge({ ratio, target }) {
  const met = ratio >= target;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded ${
        met ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
      }`}
    >
      {fmtPct(ratio)}
    </span>
  );
}

export default function ConversionDetails({ data }) {
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

  if (!data?.data || !data?.months) return null;
  const months = data.months;

  return (
    <div className="overflow-x-auto" ref={wrapperRef}>
      {data.data.map((team) => (
        <div key={team.sales_team} className="mb-0">
          <table className="w-full text-sm border-collapse">
            {/* ── grouped header ── */}
            <thead>
              {/* team label row */}
              <tr className="bg-slate-100 border-b-2 border-slate-200">
                <th
                  colSpan={3 + months.length * 3}
                  className="px-4 py-2 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      {team.sales_team}
                    </span>
                  </div>
                </th>
              </tr>

              {/* month group headers */}
              <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="px-4 py-2 text-center w-10" rowSpan={2}>#</th>
                <th className="px-4 py-2 text-left whitespace-nowrap" rowSpan={2}>Staff Name</th>
                <th className="px-4 py-2 text-center whitespace-nowrap" rowSpan={2}>Target&nbsp;%</th>
                {months.map((m, i) => (
                  <th
                    key={m}
                    colSpan={3}
                    className="px-2 py-2 text-center border-l border-slate-200 whitespace-nowrap"
                  >
                    {i === 0 ? 'Current Month' : fmtMonth(m)}
                  </th>
                ))}
              </tr>

              {/* sub-column headers */}
              <tr className="bg-slate-50 text-[10px] font-semibold text-slate-400 border-b border-slate-200">
                {months.map((m) => (
                  <React.Fragment key={m}>
                    <th className="px-2 py-1.5 text-right border-l border-slate-200 whitespace-nowrap">Alloc</th>
                    <th className="px-2 py-1.5 text-right whitespace-nowrap">Conv</th>
                    <th className="px-2 py-1.5 text-right whitespace-nowrap">Ratio</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>

            <tbody className="text-slate-700">
              {(team.staffs ?? []).map((staff, i) => (
                <tr
                  key={staff.sl_no}
                  className={`border-b border-slate-50 hover:bg-blue-50/30 transition-colors ${
                    i % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
                  }`}
                >
                  <td className="px-4 py-2.5 text-center text-slate-400 tabular-nums">{staff.sl_no}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-900 whitespace-nowrap">{staff.staff_name}</td>
                  <td className="px-4 py-2.5 text-center tabular-nums text-xs font-semibold text-slate-500">
                    {staff.target_conversion_ratio}%
                  </td>
                  {months.map((m) => {
                    const md = staff.monthly_data?.[m] ?? {};
                    return (
                      <React.Fragment key={m}>
                        <td className="px-2 py-2.5 text-right tabular-nums border-l border-slate-100 text-slate-500">
                          {fmtInt(md.allocated_count)}
                        </td>
                        <td className="px-2 py-2.5 text-right tabular-nums font-semibold text-slate-900">
                          {fmtInt(md.converted_count)}
                        </td>
                        <td className="px-2 py-2.5 text-right">
                          <RatioBadge ratio={md.ratio_percentage ?? 0} target={staff.target_conversion_ratio} />
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>

            {team.team_totals && (
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-900">
                  <td className="px-4 py-2.5 text-center text-slate-400" />
                  <td className="px-4 py-2.5 font-extrabold whitespace-nowrap" colSpan={2}>
                    Team Total
                  </td>
                  {months.map((m) => {
                    const tt = team.team_totals?.[m] ?? {};
                    return (
                      <React.Fragment key={m}>
                        <td className="px-2 py-2.5 text-right tabular-nums border-l border-slate-200 text-slate-600">
                          {fmtInt(tt.allocated_count)}
                        </td>
                        <td className="px-2 py-2.5 text-right tabular-nums font-extrabold">
                          {fmtInt(tt.converted_count)}
                        </td>
                        <td className="px-2 py-2.5 text-right tabular-nums text-xs text-slate-600">
                          {fmtPct(tt.ratio_percentage)}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      ))}
    </div>
  );
}
