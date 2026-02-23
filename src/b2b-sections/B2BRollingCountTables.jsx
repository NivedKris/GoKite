import { fmtInt, fmtMonth } from '../utils/formatters';

/**
 * Generic rolling-month count table reused by Visa Split-Up, A2A Split-Up,
 * Service Report, and Agency Report. 
 * Expects: data = { months, data: [{ <labelKey>, monthly_counts, current_month_count }], totals }
 */
function RollingCountTable({ data, labelKey }) {
  if (!data?.months) return null;

  const months = data.months ?? [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-max">
        <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-4 py-2 text-left border-b border-slate-200 whitespace-nowrap">
              {labelKey === 'service_type' ? 'Service Type' : labelKey === 'agency_metric' ? 'Metric' : labelKey}
            </th>
            {months.map((m, i) => (
              <th key={m} className="px-4 py-2 text-right border-b border-slate-200 whitespace-nowrap">
                {i === 0 ? 'Current Month' : fmtMonth(m)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-slate-700">
          {(data.data ?? []).map((row, i) => (
            <tr
              key={row[labelKey]}
              className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${i % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'}`}
            >
              <td className="px-4 py-2.5 font-medium text-slate-900 whitespace-nowrap">{row[labelKey]}</td>
              {months.map((m) => (
                <td key={m} className="px-4 py-2.5 text-right tabular-nums">
                  {fmtInt(row.monthly_counts?.[m] ?? 0)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {data.totals && (
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-900">
              <td className="px-4 py-2.5 font-extrabold whitespace-nowrap">Total</td>
              {months.map((m) => (
                <td key={m} className="px-4 py-2.5 text-right tabular-nums">
                  {fmtInt(data.totals.monthly_totals?.[m] ?? 0)}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

export function B2BVisaSplitUp({ data }) {
  return <RollingCountTable data={data} labelKey="service_type" />;
}

export function B2BA2ASplitUp({ data }) {
  return <RollingCountTable data={data} labelKey="service_type" />;
}

export function B2BServiceReport({ data }) {
  return <RollingCountTable data={data} labelKey="service_type" />;
}

export function B2BAgencyReport({ data }) {
  return <RollingCountTable data={data} labelKey="agency_metric" />;
}
