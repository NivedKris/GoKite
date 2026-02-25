import { useState } from 'react';

const STATUSES = ['Active', 'New conversion', 'Followup', 'Restarted', 'Closed'];

const STATUS_COLORS = {
  Active: 'bg-emerald-50 text-emerald-700',
  'New conversion': 'bg-blue-50 text-blue-700',
  Followup: 'bg-amber-50 text-amber-700',
  Restarted: 'bg-violet-50 text-violet-700',
  Closed: 'bg-slate-100 text-slate-500',
};

export default function BranchesCorporateClients({ data }) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  if (!data?.data) return null;

  const searchLower = search.toLowerCase();
  const rows = (data.data ?? []).filter(
    (r) =>
      !search ||
      r.client_name?.toLowerCase().includes(searchLower) ||
      r.contact_person?.toLowerCase().includes(searchLower) ||
      r.contact_number?.toLowerCase().includes(searchLower) ||
      r.email_id?.toLowerCase().includes(searchLower) ||
      r.area_state?.toLowerCase().includes(searchLower) ||
      r.status?.toLowerCase().includes(searchLower) ||
      r.date?.toLowerCase().includes(searchLower),
  );

  const { pagination } = data;
  const itemsPerPage = 20;
  const totalPages = Math.ceil(rows.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedRows = rows.slice(startIdx, endIdx);

  return (
    <div>
      {/* Search bar */}
      <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-3">
        <input
          type="text"
          placeholder="Search client, contact, phone, email, area, status…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          className="flex-1 max-w-md px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <span className="text-xs text-slate-400 ml-auto">
          {rows.length} records, page {currentPage}/{totalPages}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-2 text-center w-10 border-b border-slate-200">#</th>
              <th className="px-4 py-2 text-left border-b border-slate-200 whitespace-nowrap">Date</th>
              <th className="px-4 py-2 text-left border-b border-slate-200 whitespace-nowrap">
                Client Name
              </th>
              <th className="px-4 py-2 text-left border-b border-slate-200 whitespace-nowrap">
                Contact Person
              </th>
              <th className="px-4 py-2 text-left border-b border-slate-200 whitespace-nowrap">
                Phone
              </th>
              <th className="px-4 py-2 text-left border-b border-slate-200 whitespace-nowrap">
                Email
              </th>
              <th className="px-4 py-2 text-left border-b border-slate-200 whitespace-nowrap">
                Area
              </th>
              <th className="px-4 py-2 text-left border-b border-slate-200 whitespace-nowrap">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {paginatedRows.map((r, i) => (
              <tr
                key={r.sr_no}
                className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${
                  i % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
                }`}
              >
                <td className="px-4 py-2.5 text-center text-slate-400 tabular-nums">{r.sr_no}</td>
                <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">{r.date}</td>
                <td className="px-4 py-2.5 font-medium text-slate-900 whitespace-nowrap">
                  {r.client_name}
                </td>
                <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap">{r.contact_person}</td>
                <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">{r.contact_number}</td>
                <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">{r.email_id}</td>
                <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{r.area_state}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      STATUS_COLORS[r.status] ?? 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm font-medium rounded border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            First
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm font-medium rounded border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-sm font-semibold text-slate-700">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm font-medium rounded border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            Next
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm font-medium rounded border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            Last
          </button>
        </div>
      )}
    </div>
  );
}
