import DataTable from '../components/DataTable';
import { fmtCurrency } from '../utils/formatters';

export default function B2BFundCollection({ data }) {
  if (!data) return null;

  const columns = [
    { key: 'sl_no', label: '#', align: 'center', className: 'w-10 text-slate-400' },
    { key: 'staff_name', label: 'Staff Name', align: 'left', className: 'font-semibold text-slate-900' },
    { key: 'department', label: 'Department', align: 'center' },
    {
      key: 'outstanding_amount',
      label: 'Outstanding Amount',
      align: 'right',
      render: (v) => (
        <span className="font-semibold text-rose-600 tabular-nums">{fmtCurrency(v)}</span>
      ),
    },
  ];

  const footer = {
    sl_no: '',
    staff_name: 'Total',
    department: '',
    outstanding_amount: data.total_outstanding_amount ?? 0,
  };

  return (
    <DataTable
      columns={columns}
      rows={data.data ?? []}
      footer={footer}
    />
  );
}
