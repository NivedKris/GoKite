// ─────────────────────────────────────────────────────────────────────────────
// DataTable – enterprise-density table with scroll & sticky header
//
// Props:
//   columns: [{ key, label, align?: 'left'|'right'|'center', className?, render? }]
//   rows:    array of objects
//   footer:  object (same shape as a row) – optional totals row
//   emptyMessage: string – shown when rows is empty
// ─────────────────────────────────────────────────────────────────────────────

export default function DataTable({ columns = [], rows = [], footer, emptyMessage = 'No data available.' }) {
  if (!columns.length) return null;

  const alignClass = (align) => {
    if (align === 'right') return 'text-right';
    if (align === 'center') return 'text-center';
    return 'text-left';
  };

  const cellValue = (col, row) => {
    if (col.render) return col.render(row[col.key], row);
    const val = row[col.key];
    if (val == null || val === '') return <span className="text-slate-300">—</span>;
    return val;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-max">
        {/* ── Head ────────────────────────────────────────────────────────── */}
        <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 sticky top-0 z-10">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 border-b border-slate-200 whitespace-nowrap ${alignClass(col.align)} ${col.className ?? ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <tbody className="text-slate-700">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400 text-xs">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={row.id ?? row.sl_no ?? i}
                className={`border-b border-slate-50 hover:bg-slate-50 transition-colors duration-100 ${
                  i % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-2.5 whitespace-nowrap tabular-nums ${alignClass(col.align)} ${col.className ?? ''}`}
                  >
                    {cellValue(col, row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>

        {/* ── Footer (totals) ──────────────────────────────────────────────── */}
        {footer && (
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-900">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-2.5 whitespace-nowrap tabular-nums text-[13px] ${alignClass(col.align)} ${col.className ?? ''}`}
                >
                  {col.render ? col.render(footer[col.key], footer) : (footer[col.key] ?? '')}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
