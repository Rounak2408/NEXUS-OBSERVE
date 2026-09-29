import React from 'react';
import { ServiceStatus, Severity, IncidentStatus } from '../../types';

interface StatusBadgeProps {
  status: ServiceStatus | Severity | IncidentStatus | string;
  size?: 'sm' | 'md';
  showPulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showPulse = true }) => {
  const upper = status?.toUpperCase() || 'UNKNOWN';

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  let pulseClass = '';

  if (['HEALTHY', 'MET', 'RESOLVED', 'CLOSED', 'LOW', 'INFO', 'RECOVERY'].includes(upper)) {
    colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    pulseClass = 'pulse-healthy bg-emerald-500';
  } else if (['DEGRADED', 'MEDIUM', 'WARNING', 'MONITORING', 'IDENTIFIED'].includes(upper)) {
    colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    pulseClass = 'pulse-warning bg-amber-500';
  } else if (['CRITICAL', 'HIGH', 'FATAL', 'BREACHED', 'INVESTIGATING', 'OFFLINE'].includes(upper)) {
    colorClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    pulseClass = 'pulse-critical bg-rose-500';
  }

  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${px} ${colorClasses} tracking-wide font-mono`}>
      {showPulse && <span className={`w-1.5 h-1.5 rounded-full ${pulseClass}`} />}
      {upper}
    </span>
  );
};
