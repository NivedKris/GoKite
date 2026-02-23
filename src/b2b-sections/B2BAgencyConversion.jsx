import DataTable from '../components/DataTable';
import { fmtInt } from '../utils/formatters';

export default function B2BAgencyConversion({ data }) {
  if (!data) return null;

  const columns = [
    { key: 'sl_no', label: '#', align: 'center', className: 'w-10 text-slate-400' },
    { key: 'staff_name', label: 'Staff Name', align: 'left', className: 'font-semibold text-slate-900' },
    { key: 'department', label: 'Department', align: 'center' },
    {
      key: 'restarted_count',
      label: 'Restarted',
      align: 'right',
      render: (v) => <span className="tabular-nums text-amber-600 font-semibold">{fmtInt(v)}</span>,
    },
    {
      key: 'new_conversion_count',
      label: 'New Conversion',
      align: 'right',
      render: (v) => <span className="tabular-nums text-emerald-600 font-semibold">{fmtInt(v)}</span>,
    },
    {
      key: 'total_count',
      label: 'Total',
      align: 'right',
      render: (v) => <span className="tabular-nums font-bold">{fmtInt(v)}</span>,
    },
  ];

  const totals = data.totals ?? {};
  const footer = {
    sl_no: '',
    staff_name: 'Total',
    department: '',
    restarted_count: totals.restarted_count ?? 0,
    new_conversion_count: totals.new_conversion_count ?? 0,
    total_count: totals.total_count ?? 0,
  };

  return (
    <DataTable
      columns={columns}
      rows={data.data ?? []}
      footer={footer}
    />
  );
}
