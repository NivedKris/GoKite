import { fmtCurrency } from '../utils/formatters';

export default function BranchesOutstanding({ data }) {
  if (!data?.data) return null;

  return (
    <div className="space-y-0 divide-y divide-slate-100">
      {(data.data ?? []).map((company) => (
        <div key={company.company_id}>
          {/* Branch header */}
          <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              {company.company_name}
            </span>
            {company.as_of_date && (
              <span className="text-[10px] text-slate-400">As of {company.as_of_date}</span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-2 text-center w-10 border-b border-slate-200">#</th>
                  <th className="px-4 py-2 text-left border-b border-slate-200">Department</th>
                  <th className="px-4 py-2 text-right border-b border-slate-200">
                    Outstanding (AED)
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {(company.rows ?? []).map((row, i) => (
                  <tr
                    key={row.department}
                    className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${
                      i % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
                    }`}
                  >
                    <td className="px-4 py-2.5 text-center text-slate-400 tabular-nums">
                      {row.sl_no}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-900">{row.department}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {fmtCurrency(row.outstanding)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-900">
                  <td className="px-4 py-2.5 text-center" />
                  <td className="px-4 py-2.5 font-extrabold">Total Outstanding</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-primary">
                    {fmtCurrency(company.total_outstanding)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
