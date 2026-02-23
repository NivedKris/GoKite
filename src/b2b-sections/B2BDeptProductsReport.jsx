import DataTable from '../components/DataTable';
import { fmtInt } from '../utils/formatters';

export default function B2BDeptProductsReport({ data }) {
  if (!data) return null;

  const columns = [
    { key: 'sl_no', label: '#', align: 'center', className: 'w-10 text-slate-400' },
    { key: 'product_name', label: 'Product', align: 'left', className: 'font-semibold text-slate-900' },
    {
      key: 'application_count',
      label: 'Applications',
      align: 'right',
      render: (v) => <span className="font-semibold tabular-nums">{fmtInt(v)}</span>,
    },
  ];

  const footer = {
    sl_no: '',
    product_name: 'Total',
    application_count: data.total?.application_count ?? 0,
  };

  return (
    <DataTable
      columns={columns}
      rows={data.data ?? []}
      footer={footer}
    />
  );
}
