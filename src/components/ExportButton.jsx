import { useState } from 'react';

/**
 * ExportButton — triggers an async export and shows loading/error states.
 * Props:
 *   onExport: async () => void   — called when button is clicked
 *   label?:   string             — button label (default: "Export to Excel")
 */
export default function ExportButton({ onExport, label = 'Export to Excel' }) {
  const [state, setState] = useState('idle'); // 'idle' | 'loading' | 'error'
  const [errMsg, setErrMsg] = useState('');

  async function handleClick() {
    setState('loading');
    setErrMsg('');
    try {
      await onExport();
      setState('idle');
    } catch (err) {
      setErrMsg(err?.message ?? 'Export failed');
      setState('error');
      setTimeout(() => setState('idle'), 4000);
    }
  }

  const isLoading = state === 'loading';

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
      >
        {isLoading ? (
          <>
            {/* spinner */}
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Exporting…
          </>
        ) : (
          <>
            {/* Excel / sheet icon */}
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8.5 17l-1.8-3 1.8-3h1.4l-1.8 3 1.8 3H8.5zm3.6 0l-1.8-3 1.8-3h1.4l-1.8 3 1.8 3h-1.4zm3.4 0h-1.1l-1.9-3 1.9-3H15l-1.5 3 1.5 3z" />
            </svg>
            {label}
          </>
        )}
      </button>

      {state === 'error' && (
        <span className="text-xs text-rose-600 font-medium">{errMsg}</span>
      )}
    </div>
  );
}
