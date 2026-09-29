import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  isGoodTrend?: boolean; // e.g. lower latency is good
  comparison?: string;
  sparklineData?: number[];
  statusColor?: 'emerald' | 'amber' | 'rose' | 'blue' | 'purple';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  trend,
  trendDirection = 'neutral',
  isGoodTrend = true,
  comparison,
  sparklineData = [35, 42, 38, 45, 52, 48, 55, 60, 58, 62],
  statusColor = 'emerald'
}) => {

  const min = Math.min(...sparklineData);
  const max = Math.max(...sparklineData);
  const range = max - min || 1;

  // Generate SVG path for mini sparkline
  const points = sparklineData.map((val, idx) => {
    const x = (idx / (sparklineData.length - 1)) * 120;
    const y = 35 - ((val - min) / range) * 25;
    return `${x},${y}`;
  }).join(' ');

  const getTrendColor = () => {
    if (trendDirection === 'neutral') return 'text-slate-400';
    if (trendDirection === 'up') return isGoodTrend ? 'text-emerald-400' : 'text-rose-400';
    return isGoodTrend ? 'text-emerald-400' : 'text-rose-400';
  };

  const getStatusBg = () => {
    switch (statusColor) {
      case 'amber': return 'border-l-amber-500';
      case 'rose': return 'border-l-rose-500';
      case 'blue': return 'border-l-blue-500';
      case 'purple': return 'border-l-purple-500';
      default: return 'border-l-emerald-500';
    }
  };

  return (
    <div className={`bg-[#121722] border border-slate-800/80 rounded-lg p-4 border-l-4 ${getStatusBg()} hover:border-slate-700 transition-all duration-200 group`}>
      <div className="flex items-center justify-between text-xs text-slate-400 font-medium tracking-wide">
        <span>{label}</span>
        {trend && (
          <span className={`flex items-center gap-0.5 font-mono text-xs ${getTrendColor()}`}>
            {trendDirection === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
            {trendDirection === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
            {trendDirection === 'neutral' && <Minus className="w-3.5 h-3.5" />}
            {trend}
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between mt-2">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
            {value}
          </span>
          {unit && <span className="text-xs text-slate-400 font-medium">{unit}</span>}
        </div>

        {/* Mini Sparkline SVG */}
        <div className="w-24 h-9 overflow-hidden opacity-70 group-hover:opacity-100 transition-opacity">
          <svg viewBox="0 0 120 40" className="w-full h-full stroke-blue-400 fill-none stroke-[1.8]">
            <polyline points={points} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {comparison && (
        <div className="mt-2 text-[11px] text-slate-500 font-mono">
          {comparison}
        </div>
      )}
    </div>
  );
};
