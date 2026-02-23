import { fmtInt, fmtMonth } from '../utils/formatters';

function ReviewCell({ count, target }) {
  if (count == null) return <td className="px-3 py-2.5 text-center text-slate-300 tabular-nums">—</td>;
  let colorClass = 'text-slate-700';
  if (target) {
    const parts = String(target).split('-').map(Number);
    const lo = parts[0];
    if (count >= lo) colorClass = 'text-emerald-700 font-semibold';
    else colorClass = 'text-rose-600 font-semibold';
  }
  return (
    <td className={`px-3 py-2.5 text-center tabular-nums ${colorClass}`}>
      {fmtInt(count)}
    </td>
  );
}

export default function TotalReview({ data }) {
  if (!data?.data || !data?.months) return null;
  const months = data.months;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse min-w-max">
        <thead className="sticky top-0 z-10">
          <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b-2 border-slate-200">
            <th className="px-4 py-3 text-center w-10">#</th>
            <th className="px-4 py-3 text-left whitespace-nowrap">Staff Name</th>
            <th className="px-4 py-3 text-left whitespace-nowrap">Department</th>
            <th className="px-4 py-3 text-center whitespace-nowrap">Target</th>
            {months.map((m, i) => (
              <th key={m} className="px-3 py-3 text-center whitespace-nowrap border-l border-slate-200">
                {i === 0 ? 'Current Month' : fmtMonth(m)}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="text-slate-700">
          {data.data.map((row, i) => (
            <tr
              key={row.sl_no}
              className={`border-b border-slate-50 hover:bg-blue-50/30 transition-colors ${
                i % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
              }`}
            >
              <td className="px-4 py-2.5 text-center text-slate-400 tabular-nums">{row.sl_no}</td>
              <td className="px-4 py-2.5 font-medium text-slate-900 whitespace-nowrap">{row.staff_name}</td>
              <td className="px-4 py-2.5">
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-600 whitespace-nowrap">
                  {row.department}
                </span>
              </td>
              <td className="px-4 py-2.5 text-center text-xs font-medium text-slate-500 whitespace-nowrap">
                {row.target_review}
              </td>
              {months.map((m) => (
                <ReviewCell key={m} count={row.monthly_reviews?.[m]} target={row.target_review} />
              ))}
            </tr>
          ))}
        </tbody>

        {data.totals && (
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-900">
              <td />
              <td className="px-4 py-2.5 font-extrabold" colSpan={3}>Total</td>
              {months.map((m) => (
                <td key={m} className="px-3 py-2.5 text-center tabular-nums font-extrabold border-l border-slate-200">
                  {fmtInt(data.totals[m])}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
