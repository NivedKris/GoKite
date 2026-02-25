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

export default function BranchesTotalReview({ data }) {
  if (!data?.months) return null;

  const months = data.months ?? [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-max">
        <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-4 py-2 text-center w-10 border-b border-slate-200">#</th>
            <th className="px-4 py-2 text-left border-b border-slate-200 whitespace-nowrap">
              Staff Name
            </th>
            <th className="px-4 py-2 text-left border-b border-slate-200 whitespace-nowrap">
              Department
            </th>
            <th className="px-4 py-2 text-right border-b border-slate-200 whitespace-nowrap">
              Reviews
            </th>
            <th className="px-4 py-2 text-right border-b border-slate-200 whitespace-nowrap">
              Target
            </th>
            <th className="px-4 py-2 text-right border-b border-slate-200 whitespace-nowrap">
              Prev Month
            </th>
            {months.map((m, i) => (
              <th
                key={m}
                className="px-4 py-2 text-right border-b border-slate-200 whitespace-nowrap"
              >
                {i === 0 ? 'Current' : fmtMonth(m)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-slate-700">
          {(data.data ?? []).map((s, i) => (
            <tr
              key={s.staff_name}
              className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${
                i % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
              }`}
            >
              <td className="px-4 py-2.5 text-center text-slate-400 tabular-nums">{s.sl_no}</td>
              <td className="px-4 py-2.5 font-medium text-slate-900 whitespace-nowrap">
                {s.staff_name}
              </td>
              <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{s.department}</td>
              <td className="px-4 py-2.5 text-right tabular-nums font-semibold">
                {fmtInt(s.review_count)}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-slate-500">
                {s.target_review}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-slate-500">
                {fmtInt(s.previous_month_review)}
              </td>
              {months.map((m) => (
                <ReviewCell key={m} count={s.monthly_reviews?.[m]} target={s.target_review} />
              ))}
            </tr>
          ))}
        </tbody>
        {data.totals && (
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-900">
              <td className="px-4 py-2.5 text-center" />
              <td className="px-4 py-2.5 font-extrabold" colSpan={2}>
                Total
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums">
                {fmtInt(data.totals.review_count)}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-slate-500">—</td>
              <td className="px-4 py-2.5 text-right tabular-nums">
                {fmtInt(data.totals.previous_month_review)}
              </td>
              {months.map((m) => (
                <td key={m} className="px-4 py-2.5 text-right tabular-nums">
                  {fmtInt(data.totals.monthly_reviews?.[m] ?? 0)}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
