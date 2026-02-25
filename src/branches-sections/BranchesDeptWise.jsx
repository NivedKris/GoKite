import { fmtCurrency } from '../utils/formatters';

export default function BranchesDeptWise({ data }) {
  if (!data?.data) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-4 py-2 text-center w-10 border-b border-slate-200">#</th>
            <th className="px-4 py-2 text-left border-b border-slate-200">Department</th>
            <th className="px-4 py-2 text-right border-b border-slate-200">Profit (AED)</th>
          </tr>
        </thead>
        <tbody className="text-slate-700">
          {(data.data ?? []).map((row, i) => (
            <tr
              key={row.department}
              className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${
                i % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
              }`}
            >
              <td className="px-4 py-2.5 text-center text-slate-400 tabular-nums">{row.sl_no}</td>
              <td className="px-4 py-2.5 font-medium text-slate-900">{row.department}</td>
              <td className="px-4 py-2.5 text-right tabular-nums">{fmtCurrency(row.profit)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-900">
            <td className="px-4 py-2.5 text-center" />
            <td className="px-4 py-2.5 font-extrabold">Total Branch Profit</td>
            <td className="px-4 py-2.5 text-right tabular-nums text-primary">
              {fmtCurrency(data.total_branch_profit ?? 0)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
