import { fmtCurrency } from '../utils/formatters';

export default function OutstandingList({ data }) {
  if (!data?.data) return null;

  return (
    <div className="overflow-x-auto">
      {data.data.map((team) => (
        <table key={team.sales_team} className="w-full text-sm min-w-max mb-0">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-200">
              <th colSpan={5} className="px-4 py-2 text-left">
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
              <th className="px-4 py-2 text-left border-b border-slate-200">Staff Name</th>
              <th className="px-4 py-2 text-right border-b border-slate-200 whitespace-nowrap">Current Month Pending</th>
              <th className="px-4 py-2 text-right border-b border-slate-200 whitespace-nowrap">Previous Month Pending</th>
              <th className="px-4 py-2 text-right border-b border-slate-200">Difference</th>
            </tr>
          </thead>

          <tbody className="text-slate-700">
            {(team.staffs ?? []).map((staff, i) => {
              const diffPositive = staff.difference >= 0;
              return (
                <tr
                  key={staff.sl_no}
                  className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${i % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'}`}
                >
                  <td className="px-4 py-2.5 text-center text-slate-400 tabular-nums">{staff.sl_no}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-900">{staff.staff_name}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {fmtCurrency(staff.current_month_pending)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-500">
                    {fmtCurrency(staff.previous_month_pending)}
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right tabular-nums font-semibold ${
                      diffPositive ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {diffPositive ? '+' : ''}{fmtCurrency(staff.difference)}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {team.team_totals && (
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-900">
                <td className="px-4 py-2.5 text-center text-slate-400" />
                <td className="px-4 py-2.5 font-extrabold">Team Total</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{fmtCurrency(team.team_totals.current_month_pending)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">{fmtCurrency(team.team_totals.previous_month_pending)}</td>
                <td
                  className={`px-4 py-2.5 text-right tabular-nums ${
                    team.team_totals.difference >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {team.team_totals.difference >= 0 ? '+' : ''}{fmtCurrency(team.team_totals.difference)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      ))}
    </div>
  );
}
