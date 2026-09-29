import React, { useState, useEffect } from 'react';
import { BarChart2, Download, Calendar, TrendingUp, ShieldCheck, Activity, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('24H');
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/analytics?timeRange=${timeRange}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const handleExportCSV = () => {
    if (!data || !data.trends) return;
    const headers = 'Time,Latency(ms),CPU(%),Memory(%),ErrorRate(%),Availability(%)\n';
    const rows = data.trends.map((t: any) => `${t.time},${t.latency},${t.cpu},${t.memory},${t.errorRate},${t.availability}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NEXUS_OBSERVE_Analytics_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (loading || !data) {
    return <div className="p-12 text-center font-mono text-xs text-slate-500">Loading analytics telemetry...</div>;
  }

  const { summary, trends } = data;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121722] border border-slate-800/80 rounded-xl p-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-purple-400" />
            Executive Observability & SLA Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Long-term reliability trends, error budget consumption, and performance benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold px-4 py-2 rounded-lg transition-all shadow-lg shadow-purple-600/25 flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> EXPORT CSV DATA
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#121722] border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-mono text-slate-400">System Availability</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{summary.overallUptime}%</div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">Target: 99.90%</div>
        </div>

        <div className="bg-[#121722] border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-mono text-slate-400">Average Response Time</div>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-1">{summary.avgLatency}ms</div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">p99 Latency Benchmark</div>
        </div>

        <div className="bg-[#121722] border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-mono text-slate-400">Active Incidents</div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{summary.activeIncidents}</div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">MTTR: 24 mins</div>
        </div>

        <div className="bg-[#121722] border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-mono text-slate-400">CPU Cluster Load</div>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-1">{summary.avgCpu}%</div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">Across 13 Nodes</div>
        </div>
      </div>

      {/* Reliability Trend Chart */}
      <div className="bg-[#121722] border border-slate-800/80 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">System Availability & Reliability SLA Trend</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="time" stroke="#64748B" fontSize={11} fontFamily="IBM Plex Mono" />
              <YAxis domain={[99.8, 100]} stroke="#64748B" fontSize={11} fontFamily="IBM Plex Mono" />
              <Tooltip contentStyle={{ backgroundColor: '#121722', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="availability" name="Availability (%)" stroke="#10B981" strokeWidth={2} fillOpacity={0.2} fill="#10B981" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Latency & Error Trend Bar Chart */}
      <div className="bg-[#121722] border border-slate-800/80 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Error Rate (%) Trend Analysis</h3>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="time" stroke="#64748B" fontSize={11} fontFamily="IBM Plex Mono" />
              <YAxis stroke="#64748B" fontSize={11} fontFamily="IBM Plex Mono" />
              <Tooltip contentStyle={{ backgroundColor: '#121722', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="errorRate" name="Error Rate (%)" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
