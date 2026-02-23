export default function FrontlineServiceCount({ data }) {
  if (!data?.data) return null;

  const visaSources = data.columns?.visa_sources ?? [];
  const products = data.columns?.products ?? [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-max">
        {/* ── Head ──────────────────────────────────────────────────────── */}
        <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 sticky top-0 z-10">
          {/* Group headers */}
          <tr>
            <th rowSpan={2} className="px-4 py-2 text-center w-10 border-b border-slate-200 border-r border-slate-200">#</th>
            <th rowSpan={2} className="px-4 py-2 text-left border-b border-slate-200 border-r border-slate-200 whitespace-nowrap">
              Staff
            </th>

            {visaSources.length > 0 && (
              <th
                colSpan={visaSources.length}
                className="px-4 py-1.5 text-center border-b border-slate-200 border-r border-slate-200 bg-blue-50 text-blue-600"
              >
                Visa Sources
              </th>
            )}

            {products.length > 0 && (
              <th
                colSpan={products.length}
                className="px-4 py-1.5 text-center border-b border-slate-200 border-r border-slate-200 bg-violet-50 text-violet-600"
              >
                Products
              </th>
            )}

            <th rowSpan={2} className="px-4 py-2 text-right border-b border-slate-200 whitespace-nowrap">
              Total
            </th>
            <th rowSpan={2} className="px-4 py-2 text-right border-b border-slate-200 whitespace-nowrap">
              Target
            </th>
          </tr>

          {/* Column headers */}
          <tr>
            {visaSources.map((src) => (
              <th
                key={src}
                className="px-3 py-1.5 text-center border-b border-slate-200 border-r border-slate-100 whitespace-nowrap bg-blue-50/60 text-blue-600/80 text-[10px]"
              >
                {src}
              </th>
            ))}
            {products.map((prod) => (
              <th
                key={prod}
                className="px-3 py-1.5 text-center border-b border-slate-200 border-r border-slate-100 whitespace-nowrap bg-violet-50/60 text-violet-600/80 text-[10px]"
              >
                {prod}
              </th>
            ))}
          </tr>
        </thead>

        {/* ── Body ──────────────────────────────────────────────────────── */}
        <tbody className="text-slate-700">
          {data.data.map((row, i) => (
            <tr
              key={row.sl_no}
              className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}
            >
              <td className="px-4 py-2.5 text-center text-slate-400 tabular-nums border-r border-slate-100">{row.sl_no}</td>
              <td className="px-4 py-2.5 font-medium text-slate-900 border-r border-slate-100 whitespace-nowrap">{row.staff_name}</td>

              {visaSources.map((src) => (
                <td key={src} className="px-3 py-2.5 text-center tabular-nums border-r border-slate-50">
                  {row.visa_counts?.[src] ?? 0}
                </td>
              ))}

              {products.map((prod) => (
                <td key={prod} className="px-3 py-2.5 text-center tabular-nums border-r border-slate-50">
                  {row.product_counts?.[prod] ?? 0}
                </td>
              ))}

              <td className="px-4 py-2.5 text-right tabular-nums font-semibold">{row.total_count}</td>
              <td className="px-4 py-2.5 text-right tabular-nums text-slate-500">{row.target_count}</td>
            </tr>
          ))}
        </tbody>

        {/* ── Summary ───────────────────────────────────────────────────── */}
        {data.summary && (
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-900">
              <td className="px-4 py-2.5 text-center text-slate-400" />
              <td className="px-4 py-2.5 font-extrabold text-slate-900 border-r border-slate-200">Total</td>
              {visaSources.map((src) => (
                <td key={src} className="px-3 py-2.5 text-center tabular-nums border-r border-slate-100 text-slate-500 text-xs">
                  —
                </td>
              ))}
              {products.map((prod) => (
                <td key={prod} className="px-3 py-2.5 text-center tabular-nums border-r border-slate-100 text-slate-500 text-xs">
                  —
                </td>
              ))}
              <td className="px-4 py-2.5 text-right tabular-nums">{data.summary.total_count}</td>
              <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">{data.summary.target_count}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
