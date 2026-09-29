import React from 'react';
import { Activity, ShieldCheck, AlertTriangle, XCircle } from 'lucide-react';

interface RadialHealthGaugeProps {
  score?: number; // e.g. 98.7
  operationalCount?: number;
  degradedCount?: number;
  criticalCount?: number;
}

export const RadialHealthGauge: React.FC<RadialHealthGaugeProps> = ({
  score = 98.7,
  operationalCount = 12,
  degradedCount = 1,
  criticalCount = 0
}) => {
  const radius = 68;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-[#121722] border border-slate-800/80 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
      {/* Background ambient glow */}
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center gap-6">
        {/* Radial SVG Ring */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
            {/* Outer Track */}
            <circle
              stroke="#1E293B"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Animated Progress Arc */}
            <circle
              stroke="url(#emeraldGradient)"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center text */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-extrabold font-mono text-white tracking-tight tabular-nums">
              {score.toFixed(1)}%
            </span>
            <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
              {criticalCount > 0 ? 'CRITICAL' : degradedCount > 0 ? 'DEGRADED' : 'HEALTHY'}
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold text-white tracking-tight">System Health Index</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
            Real-time aggregate health score calculated across active CloudWatch metrics, HTTP endpoints, and container runtimes.
          </p>
        </div>
      </div>

      {/* Counts Pills */}
      <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
        <div className="bg-[#161C2A] border border-slate-800 rounded-lg p-3 text-center min-w-[100px]">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Operational</span>
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">{operationalCount}</div>
        </div>

        <div className="bg-[#161C2A] border border-slate-800 rounded-lg p-3 text-center min-w-[100px]">
          <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Degraded</span>
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">{degradedCount}</div>
        </div>

        <div className="bg-[#161C2A] border border-slate-800 rounded-lg p-3 text-center min-w-[100px]">
          <div className="flex items-center justify-center gap-1.5 text-rose-400 text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5" />
            <span>Critical</span>
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">{criticalCount}</div>
        </div>
      </div>
    </div>
  );
};
