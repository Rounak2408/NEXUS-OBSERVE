import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Server,
  Activity,
  AlertTriangle,
  Terminal,
  ArrowLeft,
  ShieldCheck,
  Clock,
  RefreshCw,
  Cpu,
  HardDrive,
  BarChart2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Zap,
  Globe,
  Settings
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { StatusBadge } from '../components/common/StatusBadge';
import api from '../services/api';
import { Server as ServerType, Metric } from '../types';

export const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [server, setServer] = useState<ServerType | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Metrics' | 'Health' | 'Alerts' | 'Incidents' | 'Logs'>('Overview');
  const [timeRange, setTimeRange] = useState('24H');
  const [logSearch, setLogSearch] = useState('');
  const [logLevel, setLogLevel] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/services/${id}`);
      setServer(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await api.get(`/services/${id}/metrics?timeRange=${timeRange}`);
      setMetrics(res.data.metrics || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDetail();
    fetchMetrics();
  }, [id, timeRange]);

  const handleCopy = (text: string, logId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(logId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading || !server) {
    return (
      <div className="p-12 text-center text-slate-500 font-mono text-xs">
        Loading service telemetry details...
      </div>
    );
  }

  // Filter logs for this service
  const filteredLogs = (server.logs || []).filter(l => {
    const matchSearch = !logSearch || l.message.toLowerCase().includes(logSearch.toLowerCase());
    const matchLevel = logLevel === 'All' || l.level === logLevel;
    return matchSearch && matchLevel;
  });

  // Chart data transformation
  const chartData = metrics.map(m => ({
    time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    cpu: m.cpu,
    memory: m.memory,
    latency: m.latencyMs,
    requests: m.requestsSec,
    errorRate: m.errorRate
  }));

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Back button & Header */}
      <div>
        <button
          onClick={() => navigate('/infrastructure')}
          className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Infrastructure Directory
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121722] border border-slate-800/80 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
              <Server className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-white tracking-tight">{server.name}</h1>
                <StatusBadge status={server.status} size="sm" />
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {server.host} • <span className="text-blue-400 font-semibold">{server.environment}</span> • {server.serviceType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <div className="text-right hidden sm:block">
              <div>Uptime: <strong className="text-emerald-400">{server.uptimePercent}%</strong></div>
              <div className="text-[10px] text-slate-500">Checked: {new Date(server.lastCheckAt).toLocaleTimeString()}</div>
            </div>
            <button
              onClick={() => { fetchDetail(); fetchMetrics(); }}
              className="p-2.5 bg-[#161C2A] hover:bg-slate-800 rounded-lg text-slate-300 border border-slate-800 transition-colors"
              title="Refresh Service Telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-mono">
        {[
          { id: 'Overview', label: 'Overview' },
          { id: 'Metrics', label: 'Metrics & Charts' },
          { id: 'Health', label: 'Health Checks' },
          { id: 'Alerts', label: `Alerts (${server.alerts?.length || 0})` },
          { id: 'Incidents', label: `Incidents (${server.incidents?.length || 0})` },
          { id: 'Logs', label: `Logs (${server.logs?.length || 0})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 border-b-2 font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          {/* Top Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
            <div className="bg-[#121722] border border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-400">CPU UTILIZATION</div>
              <div className="text-2xl font-bold text-white mt-1">{server.currentCpu}%</div>
              <div className="text-[10px] text-slate-500 mt-1">Threshold: {server.cpuThreshold}%</div>
            </div>

            <div className="bg-[#121722] border border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-400">MEMORY USAGE</div>
              <div className="text-2xl font-bold text-white mt-1">{server.currentMemory}%</div>
              <div className="text-[10px] text-slate-500 mt-1">Threshold: {server.memThreshold}%</div>
            </div>

            <div className="bg-[#121722] border border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-400">CURRENT LATENCY</div>
              <div className="text-2xl font-bold text-blue-400 mt-1">{server.currentLatency}ms</div>
              <div className="text-[10px] text-slate-500 mt-1">Target: &lt; 250ms</div>
            </div>

            <div className="bg-[#121722] border border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-400">DISK SPACE</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{server.currentDisk}%</div>
              <div className="text-[10px] text-slate-500 mt-1">Threshold: {server.diskThreshold}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Resource Gauges */}
            <div className="bg-[#121722] border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" /> RESOURCE UTILIZATION GAUGES
              </h3>
              <div className="space-y-4 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>CPU Utilization</span>
                    <span className={server.currentCpu >= server.cpuThreshold ? 'text-rose-400 font-bold' : 'text-white'}>
                      {server.currentCpu}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        server.currentCpu >= server.cpuThreshold ? 'bg-rose-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${server.currentCpu}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Memory Utilization</span>
                    <span className={server.currentMemory >= server.memThreshold ? 'text-amber-400 font-bold' : 'text-white'}>
                      {server.currentMemory}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        server.currentMemory >= server.memThreshold ? 'bg-amber-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${server.currentMemory}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Disk Utilization</span>
                    <span className="text-white">{server.currentDisk}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${server.currentDisk}%` }} />
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="pt-4 border-t border-slate-800 space-y-2 text-xs font-mono">
                <h4 className="text-[11px] text-slate-400 font-bold">TECHNICAL SPECIFICATIONS</h4>
                <div className="flex justify-between text-slate-300">
                  <span>Host IP:</span>
                  <span className="text-white font-semibold">{server.host}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Monitoring Endpoint:</span>
                  <span className="text-blue-400 truncate max-w-[180px]">{server.monitoringUrl || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Check Interval:</span>
                  <span className="text-white">{server.checkInterval} seconds</span>
                </div>
              </div>
            </div>

            {/* Active Incidents & Health Status */}
            <div className="lg:col-span-2 bg-[#121722] border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> RECENT INCIDENTS & HEALTH PROBES
              </h3>

              {server.incidents && server.incidents.length > 0 ? (
                <div className="space-y-3">
                  {server.incidents.map(inc => (
                    <div key={inc.id} className="bg-[#161C2A] p-4 rounded-xl border border-slate-800 flex items-start justify-between gap-4 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={inc.severity} size="sm" />
                          <span className="font-semibold text-white">{inc.title}</span>
                        </div>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">{inc.description}</p>
                        <div className="text-[10px] font-mono text-slate-500 mt-2">
                          Started: {new Date(inc.startedAt).toLocaleString()} • Assigned: {inc.assignedTo?.name || 'Alex Rivera'}
                        </div>
                      </div>
                      <StatusBadge status={inc.status} size="sm" showPulse={false} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#161C2A] p-8 rounded-xl border border-slate-800 text-center font-mono text-xs text-emerald-400">
                  ✓ No active incidents or alerts recorded for {server.name}. All status metrics nominal.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. METRICS & CHARTS TAB */}
      {activeTab === 'Metrics' && (
        <div className="space-y-6">
          {/* Time range selector */}
          <div className="flex items-center justify-between bg-[#121722] border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-mono text-slate-400 font-semibold">SELECT HISTORICAL TELEMETRY TIME RANGE:</span>
            <div className="flex items-center bg-[#161C2A] border border-slate-800 rounded-lg p-1 text-xs font-mono">
              {['1H', '6H', '24H', '7D', '30D'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    timeRange === range ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CPU & Memory Chart */}
            <div className="bg-[#121722] border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-mono font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" /> CPU (%) & Memory (%) Utilization Stream
              </h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748B" fontSize={10} fontFamily="IBM Plex Mono" />
                    <YAxis stroke="#64748B" fontSize={10} fontFamily="IBM Plex Mono" domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#121722', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'IBM Plex Mono' }} />
                    <Area type="monotone" dataKey="cpu" name="CPU (%)" stroke="#3B82F6" strokeWidth={2} fillOpacity={0.3} fill="#3B82F6" />
                    <Area type="monotone" dataKey="memory" name="Memory (%)" stroke="#8B5CF6" strokeWidth={2} fillOpacity={0.2} fill="#8B5CF6" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Latency Stream Chart */}
            <div className="bg-[#121722] border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-mono font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Response Time & Latency (ms)
              </h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748B" fontSize={10} fontFamily="IBM Plex Mono" />
                    <YAxis stroke="#64748B" fontSize={10} fontFamily="IBM Plex Mono" />
                    <Tooltip contentStyle={{ backgroundColor: '#121722', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'IBM Plex Mono' }} />
                    <Line type="monotone" dataKey="latency" name="Latency (ms)" stroke="#10B981" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Requests / sec */}
            <div className="bg-[#121722] border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-mono font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" /> Request Throughput (req/sec)
              </h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748B" fontSize={10} fontFamily="IBM Plex Mono" />
                    <YAxis stroke="#64748B" fontSize={10} fontFamily="IBM Plex Mono" />
                    <Tooltip contentStyle={{ backgroundColor: '#121722', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'IBM Plex Mono' }} />
                    <Area type="monotone" dataKey="requests" name="Requests / sec" stroke="#06B6D4" strokeWidth={2} fillOpacity={0.3} fill="#06B6D4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Error Rate (%) */}
            <div className="bg-[#121722] border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-mono font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> HTTP Error Rate (%)
              </h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748B" fontSize={10} fontFamily="IBM Plex Mono" />
                    <YAxis stroke="#64748B" fontSize={10} fontFamily="IBM Plex Mono" />
                    <Tooltip contentStyle={{ backgroundColor: '#121722', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'IBM Plex Mono' }} />
                    <Line type="monotone" dataKey="errorRate" name="Error Rate (%)" stroke="#EF4444" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. HEALTH CHECKS TAB */}
      {activeTab === 'Health' && (
        <div className="space-y-6">
          <div className="bg-[#121722] border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white font-mono mb-4">HEALTH PROBE AUDIT TRAIL</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="bg-[#161C2A] text-slate-400 border-b border-slate-800">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">HTTP Status</th>
                    <th className="p-3">Response Time</th>
                    <th className="p-3">Health Status</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {server.healthChecks && server.healthChecks.length > 0 ? (
                    server.healthChecks.map(hc => (
                      <tr key={hc.id} className="hover:bg-[#161C2A]/50">
                        <td className="p-3 text-slate-400">{new Date(hc.timestamp).toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            hc.statusCode === 200 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            HTTP {hc.statusCode}
                          </span>
                        </td>
                        <td className="p-3 text-white">{hc.responseTime}ms</td>
                        <td className="p-3">
                          {hc.isHealthy ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Healthy
                            </span>
                          ) : (
                            <span className="text-rose-400 font-semibold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Unhealthy
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-400">{hc.errorMessage || 'Operational'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        No health probes recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. ALERTS TAB */}
      {activeTab === 'Alerts' && (
        <div className="space-y-6">
          <div className="bg-[#121722] border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono">SERVICE ALERT STREAM</h3>
            <div className="space-y-3">
              {server.alerts && server.alerts.length > 0 ? (
                server.alerts.map(alt => (
                  <div key={alt.id} className="bg-[#161C2A] p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-start gap-3">
                      <StatusBadge status={alt.severity} size="sm" />
                      <div>
                        <div className="font-semibold text-white">{alt.title}</div>
                        <div className="text-slate-400 mt-0.5">{alt.message}</div>
                        <div className="text-[10px] text-slate-500 mt-1">{new Date(alt.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <div>
                      {alt.isAcknowledged ? (
                        <span className="text-emerald-400 text-[11px]">✓ Acknowledged</span>
                      ) : (
                        <button
                          onClick={async () => {
                            await api.put(`/alerts/${alt.id}/ack`);
                            fetchDetail();
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px]"
                        >
                          ACK
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 font-mono text-xs">
                  ✓ No alerts generated for this service.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. INCIDENTS TAB */}
      {activeTab === 'Incidents' && (
        <div className="space-y-6">
          <div className="bg-[#121722] border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono">LINKED SRE INCIDENTS</h3>
            <div className="space-y-3">
              {server.incidents && server.incidents.length > 0 ? (
                server.incidents.map(inc => (
                  <div
                    key={inc.id}
                    onClick={() => navigate(`/incidents?id=${inc.id}`)}
                    className="bg-[#161C2A] p-4 rounded-xl border border-slate-800 hover:border-blue-500 cursor-pointer transition-colors text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={inc.severity} size="sm" />
                        <span className="font-bold text-white">{inc.title}</span>
                      </div>
                      <StatusBadge status={inc.status} size="sm" showPulse={false} />
                    </div>
                    <p className="text-slate-400 mt-2 font-sans">{inc.description}</p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 font-mono text-xs">
                  ✓ No incident tickets linked to this service.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. LOGS TAB */}
      {activeTab === 'Logs' && (
        <div className="space-y-4">
          <div className="bg-[#121722] border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4 font-mono text-xs">
            <input
              type="text"
              placeholder="Filter logs by message..."
              value={logSearch}
              onChange={e => setLogSearch(e.target.value)}
              className="bg-[#161C2A] border border-slate-800 rounded-lg px-3 py-1.5 text-white w-72 focus:outline-none"
            />
            <select
              value={logLevel}
              onChange={e => setLogLevel(e.target.value)}
              className="bg-[#161C2A] border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none"
            >
              <option value="All">Level: All</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
              <option value="DEBUG">DEBUG</option>
            </select>
          </div>

          <div className="bg-[#0B0E14] border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2 max-h-[500px] overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-500">No logs match criteria.</div>
            ) : (
              filteredLogs.map(log => (
                <div key={log.id} className="flex items-start justify-between border-b border-slate-900 pb-1.5 hover:bg-[#121722] p-1 rounded">
                  <div className="flex items-start gap-3">
                    <span className="text-slate-500 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className={log.level === 'ERROR' ? 'text-rose-400 font-bold' : log.level === 'WARN' ? 'text-amber-400' : 'text-blue-400'}>
                      [{log.level}]
                    </span>
                    <span className="text-slate-200">{log.message}</span>
                  </div>
                  <button onClick={() => handleCopy(log.message, log.id)} className="text-slate-500 hover:text-white p-1">
                    {copiedId === log.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
