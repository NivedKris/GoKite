// GoKite branded full-screen loading overlay

export default function LoadingOverlay({ visible }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-300 ${
        visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Kite + wordmark */}
      <div className="flex flex-col items-center gap-6">

        {/* Animated kite logo */}
        <div className="animate-kite-float">
          <svg
            viewBox="0 0 120 140"
            className="w-28 h-28 drop-shadow-md"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Kite diamond body */}
            <polygon
              points="60,10 110,60 60,108 10,60"
              fill="#137fec"
            />
            {/* Cross lines */}
            <line x1="10" y1="60" x2="110" y2="60" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="60" y1="10" x2="60" y2="108" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            {/* Tail string */}
            <path
              d="M60,108 Q50,118 58,126 Q66,134 58,140"
              fill="none"
              stroke="#137fec"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Brand text */}
        <div className="flex flex-col items-center gap-1">
          <span
            className="text-4xl font-extrabold tracking-tight"
            style={{ color: '#137fec' }}
          >
            GoKite
          </span>
          <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
            Travel &amp; Tours
          </span>
        </div>

        {/* Bouncing dots */}
        <div className="flex items-center gap-2 mt-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
