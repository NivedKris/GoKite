import { fmtCurrency, fmtMonth } from '../utils/formatters';

function RollingTable({ title, accentClass, months, section }) {
  if (!section?.data) return null;

  return (
    <div className="mb-0">
      <div className={`px-4 py-2 border-y border-slate-100 ${accentClass} text-xs font-bold uppercase tracking-wider`}>
        {title}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-max">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-2 text-left border-b border-slate-200 whitespace-nowrap">Source</th>
              {months.map((m, i) => (
                <th key={m} className="px-4 py-2 text-right border-b border-slate-200 whitespace-nowrap">
                  {i === 0 ? 'Current Month' : fmtMonth(m)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {section.data.map((row, i) => (
              <tr
                key={row.source}
                className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${i % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'}`}
              >
                <td className="px-4 py-2.5 font-medium text-slate-900 whitespace-nowrap">{row.source}</td>
                {months.map((m) => (
                  <td key={m} className="px-4 py-2.5 text-right tabular-nums">
                    {fmtCurrency(row.amounts?.[m] ?? 0)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {section.total && (
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-900">
                <td className="px-4 py-2.5 font-extrabold">Total</td>
                {months.map((m) => (
                  <td key={m} className="px-4 py-2.5 text-right tabular-nums">
                    {fmtCurrency(section.total[m] ?? 0)}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

export default function FineCollectionReport({ data }) {
  if (!data?.months) return null;

  return (
    <div className="space-y-0 divide-y divide-slate-100">
      <RollingTable
        title="Fine Issued"
        accentClass="bg-rose-50/60 text-rose-700"
        months={data.months}
        section={data.fine_sold}
      />
      <RollingTable
        title="Collection Received"
        accentClass="bg-emerald-50/60 text-emerald-700"
        months={data.months}
        section={data.collection_received}
      />
      <RollingTable
        title="Collection Pending"
        accentClass="bg-amber-50/60 text-amber-700"
        months={data.months}
        section={data.collection_pending}
      />
    </div>
  );
}
