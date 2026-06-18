interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  valueFormat?: (n: number) => string;
}

export function BarChart({ data, height = 220, color = '#FF6B35', valueFormat = (n) => String(n) }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="w-full">
      <div className="flex items-end gap-2 sm:gap-3" style={{ height }}>
        {data.map((d, i) => {
          const h = (d.value / max) * (height - 28);
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5 group">
              <div className="relative w-full flex items-end justify-center" style={{ height: height - 28 }}>
                <div
                  className="w-full max-w-[42px] rounded-t-lg transition-all duration-500 hover:opacity-80"
                  style={{ height: Math.max(h, 2), background: `linear-gradient(180deg, ${color} 0%, ${color}99 100%)` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 transition absolute -top-7 left-1/2 -translate-x-1/2 rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white whitespace-nowrap">
                    {valueFormat(d.value)}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-medium text-slate-400 truncate">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface DonutProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({ data, size = 180, centerLabel, centerValue }: DonutProps) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2 - 16;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {data.map((d, i) => {
            const frac = d.value / total;
            const len = frac * circ;
            const seg = (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth="18"
                strokeDasharray={`${len} ${circ - len}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
              />
            );
            offset += len;
            return seg;
          })}
        </svg>
        {(centerValue || centerLabel) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerValue && <p className="text-lg font-extrabold text-slate-900 dark:text-white leading-none">{centerValue}</p>}
            {centerLabel && <p className="text-[10px] text-slate-400 mt-1">{centerLabel}</p>}
          </div>
        )}
      </div>
      <div className="flex-1 space-y-2 w-full">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
            <span className="text-sm text-slate-600 dark:text-slate-300 flex-1 truncate">{d.label}</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  valueFormat?: (n: number) => string;
}

export function LineChart({ data, height = 200, color = '#FF6B35', valueFormat = (n) => String(n) }: LineChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = max - min || 1;
  const w = 600;
  const h = height - 30;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * w;
    const y = h - ((d.value - min) / range) * h;
    return { x, y, ...d };
  });
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = `${path} L${w},${h} L0,${h} Z`;

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#lineGrad)" />
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill={color} />
            <circle cx={p.x} cy={p.y} r="3.5" fill="transparent" className="hover:opacity-100">
              <title>{valueFormat(p.value)}</title>
            </circle>
          </g>
        ))}
      </svg>
      <div className="flex justify-between mt-1 px-1">
        {data.map((d, i) => (
          <span key={i} className="text-[10px] text-slate-400">{d.label}</span>
        ))}
      </div>
    </div>
  );
}
