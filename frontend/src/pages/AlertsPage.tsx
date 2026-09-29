import React, { useState, useEffect } from 'react';
import { Bell, Check, Filter, Zap, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import api from '../services/api';
import { Alert } from '../types';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [severityFilter, setSeverityFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await api.get(`/alerts?severity=${severityFilter}`);
      setAlerts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [severityFilter]);

  const handleAck = async (id: string) => {
    try {
      await api.put(`/alerts/${id}/ack`);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, isAcknowledged: true } : a));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121722] border border-slate-800/80 rounded-xl p-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            Real-Time Alert Stream
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Live evaluation of metric rules, CloudWatch alarms, and healthcheck thresholds.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="bg-[#161C2A] border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="All">Severity: All</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="INFO">INFO</option>
          </select>
        </div>
      </div>

      {/* Stream Cards */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="bg-[#121722] border border-slate-800 rounded-xl p-12 text-center text-slate-500 font-mono text-xs">
            ✓ No active alerts triggered.
          </div>
        ) : (
          alerts.map(alt => (
            <div
              key={alt.id}
              className={`bg-[#121722] border ${alt.isAcknowledged ? 'border-slate-800/60 opacity-70' : 'border-slate-700 shadow-lg'} rounded-xl p-4 flex items-center justify-between gap-4 transition-all`}
            >
              <div className="flex items-start gap-3.5">
                <StatusBadge status={alt.severity} size="sm" />
                <div>
                  <h3 className="text-sm font-semibold text-white">{alt.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{alt.message}</p>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    {alt.server?.name || 'Cluster Server'} • {new Date(alt.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                {alt.isAcknowledged ? (
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledged
                  </span>
                ) : (
                  <button
                    onClick={() => handleAck(alt.id)}
                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded text-xs font-mono font-semibold"
                  >
                    Acknowledge Alert
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
