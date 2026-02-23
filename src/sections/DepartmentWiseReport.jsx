import DataTable from '../components/DataTable';
import { fmtCurrency } from '../utils/formatters';

export default function DepartmentWiseReport({ data }) {
  if (!data) return null;

  const columns = [
    { key: 'sl_no', label: '#', align: 'center', className: 'w-10 text-slate-400' },
    { key: 'department', label: 'Department / Team', align: 'left', className: 'font-semibold text-slate-900' },
    {
      key: 'profit',
      label: 'Profit',
      align: 'right',
      render: (v) => <span className="font-semibold">{fmtCurrency(v)}</span>,
    },
  ];

  const footer = {
    sl_no: '',
    department: 'Total',
    profit: data.total_profit,
  };

  return (
    <DataTable
      columns={columns}
      rows={data.data ?? []}
      footer={footer}
    />
  );
}
