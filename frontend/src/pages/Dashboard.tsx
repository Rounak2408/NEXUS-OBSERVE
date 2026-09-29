import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Server,
  ArrowRight,
  Clock,
  Radio,
  Filter,
  RefreshCw,
  ExternalLink,
  Zap,
  CheckCircle,
  TrendingDown
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { MetricCard } from '../components/common/MetricCard';
import { RadialHealthGauge } from '../components/common/RadialHealthGauge';
import { ServiceTopologyGraph } from '../components/common/ServiceTopologyGraph';
import { StatusBadge } from '../components/common/StatusBadge';
import api from '../services/api';
import { Server as ServerType, Incident, Alert, TopologyNode, TopologyLink } from '../types';

export const Dashboard: React.FC = () => {
  const { selectedEnv } = useOutletContext<{ selectedEnv: string }>();
  const navigate = useNavigate();

  const [servers, setServers] = useState<ServerType[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [topology, setTopology] = useState<{ nodes: TopologyNode[]; links: TopologyLink[] }>({ nodes: [], links: [] });
  const [timeRange, setTimeRange] = useState('24H');
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  const fetchData = async () => {
    try {
      const [srvRes, incRes, altRes, topRes, anaRes] = await Promise.all([
        api.get(`/services?environment=${selectedEnv}`),
        api.get('/incidents'),
        api.get('/alerts?isAcknowledged=false'),
        api.get('/topology'),
        api.get(`/analytics?timeRange=${timeRange}`)
      ]);

      setServers(srvRes.data);
      setIncidents(incRes.data);
      setAlerts(altRes.data);
      setTopology(topRes.data);
      setTrends(anaRes.data.trends || []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [selectedEnv, timeRange]);

  const healthyCount = servers.filter(s => s.status === 'HEALTHY').length;
  const degradedCount = servers.filter(s => s.status === 'DEGRADED').length;
  const criticalCount = servers.filter(s => s.status === 'CRITICAL').length;
  const totalServices = servers.length || 13;

  const healthScore = totalServices > 0 ? +((healthyCount / totalServices) * 100).toFixed(1) : 98.7;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* 8 & 9. DASHBOARD HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121722] border border-slate-800/80 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Good morning, Alex</h1>
            <span className="bg-blue-500/10 text-blue-400 text-xs font-mono px-2 py-0.5 rounded border border-blue-500/30 font-semibold">
              SRE COMMAND CENTER
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Here's the current real-time state of your connected cloud infrastructure and services.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#161C2A] border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="font-bold text-white">LIVE</span>
            <span className="text-slate-500">| Updated {lastUpdated}</span>
          </div>

          <button
            onClick={fetchData}
            className="p-2 bg-[#161C2A] hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-lg transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 10. HERO SYSTEM HEALTH RADIAL VIZ */}
      <RadialHealthGauge
        score={healthScore}
        operationalCount={healthyCount}
        degradedCount={degradedCount}
        criticalCount={criticalCount}
      />

      {/* 11. KPI SECTION */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          label="System Uptime"
          value="99.92"
          unit="%"
          trend="↑ 0.08%"
          trendDirection="up"
          comparison="vs 30d target 99.90%"
          sparklineData={[99.8, 99.85, 99.9, 99.88, 99.92]}
          statusColor="emerald"
        />
        <MetricCard
          label="Active Services"
          value={`${healthyCount}/${totalServices}`}
          trend={`${totalServices - healthyCount} issue`}
          trendDirection={degradedCount > 0 || criticalCount > 0 ? 'down' : 'neutral'}
          isGoodTrend={healthyCount === totalServices}
          comparison="Across 3 regions"
          sparklineData={[12, 12, 13, 13, 12]}
          statusColor={degradedCount > 0 ? 'amber' : 'emerald'}
        />
        <MetricCard
          label="Active Incidents"
          value={incidents.filter(i => ['INVESTIGATING', 'IDENTIFIED', 'MONITORING'].includes(i.status)).length}
          trend="↓ 12%"
          trendDirection="down"
          isGoodTrend={true}
          comparison="1 Critical, 1 High"
          sparklineData={[5, 4, 3, 3, 2]}
          statusColor="rose"
        />
        <MetricCard
          label="Critical Alerts"
          value={alerts.filter(a => a.severity === 'CRITICAL').length}
          trend="Needs Ack"
          trendDirection="neutral"
          comparison="CPU & Latency spike"
          sparklineData={[2, 4, 1, 2, 1]}
          statusColor="rose"
        />
        <MetricCard
          label="Avg Latency"
          value="184"
          unit="ms"
          trend="↓ 8%"
          trendDirection="down"
          isGoodTrend={true}
          comparison="p99 response time"
          sparklineData={[210, 195, 188, 192, 184]}
          statusColor="blue"
        />
        <MetricCard
          label="CPU Utilization"
          value="47.2"
          unit="%"
          trend="Balanced"
          trendDirection="neutral"
          comparison="Cluster average"
          sparklineData={[42, 48, 55, 46, 47.2]}
          statusColor="purple"
        />
      </div>

      {/* 12. INFRASTRUCTURE TOPOLOGY GRAPH */}
      <ServiceTopologyGraph
        nodes={topology.nodes}
        links={topology.links}
        onSelectNode={(node) => navigate(`/infrastructure?search=${node.name}`)}
      />

      {/* 13. REAL-TIME METRICS CHARTS */}
      <div className="bg-[#121722] border border-slate-800/80 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Real-Time System Analytics & Telemetry
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Aggregate CPU, Memory, Latency (ms), and Error Rate % streams
            </p>
          </div>

          {/* Time range selector */}
          <div className="flex items-center bg-[#161C2A] border border-slate-800 rounded-lg p-1 text-xs font-mono overflow-x-auto max-w-full">
            {['1H', '6H', '24H', '7D', '30D'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2 md:px-2.5 py-1 rounded-md text-[10px] md:text-[11px] font-medium transition-colors shrink-0 ${
                  timeRange === range
                    ? 'bg-blue-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="time" stroke="#64748B" fontSize={10} fontFamily="IBM Plex Mono" tickLine={false} interval="preserveStartEnd" minTickGap={20} />
              <YAxis stroke="#64748B" fontSize={10} fontFamily="IBM Plex Mono" tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#121722', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'IBM Plex Mono' }}
                itemStyle={{ color: '#F8FAFC' }}
              />
              <Area type="monotone" dataKey="latency" name="Latency (ms)" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorLatency)" />
              <Area type="monotone" dataKey="cpu" name="CPU (%)" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 14 & 16. INCIDENTS & ALERT STREAM SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Incidents Command Center */}
        <div className="bg-[#121722] border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-semibold text-white">Active Incidents</h3>
                <span className="bg-rose-500/20 text-rose-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
                  {incidents.filter(i => ['INVESTIGATING', 'IDENTIFIED', 'MONITORING'].includes(i.status)).length} PRIORITY
                </span>
              </div>
              <button
                onClick={() => navigate('/incidents')}
                className="text-xs text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1"
              >
                View Console <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {incidents.slice(0, 3).map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => navigate(`/incidents?id=${inc.id}`)}
                  className="bg-[#161C2A] border border-slate-800 hover:border-slate-700 rounded-lg p-3.5 cursor-pointer transition-all duration-150 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={inc.severity} size="sm" />
                      <h4 className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {inc.title}
                      </h4>
                    </div>
                    <StatusBadge status={inc.status} size="sm" showPulse={false} />
                  </div>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed font-sans">
                    {inc.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> Duration: <strong className="text-white">{inc.durationMins || 18}m</strong>
                    </span>
                    <span>Assigned: <strong className="text-blue-400">{inc.assignedTo?.name || 'Alex Rivera'}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Alert Stream */}
        <div className="bg-[#121722] border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Live Alert Stream</h3>
              </div>
              <button
                onClick={() => navigate('/alerts')}
                className="text-xs text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1"
              >
                All Stream <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {alerts.slice(0, 4).map((alt) => (
                <div
                  key={alt.id}
                  className="bg-[#161C2A] border border-slate-800 rounded-lg p-3 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${alt.severity === 'CRITICAL' ? 'bg-rose-500 pulse-critical' : 'bg-amber-500 pulse-warning'}`} />
                    <div>
                      <div className="font-semibold text-white">{alt.title}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{alt.message}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-1">
                        {alt.server?.name || 'Production Service'} • 2 minutes ago
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      await api.put(`/alerts/${alt.id}/ack`);
                      setAlerts(prev => prev.filter(a => a.id !== alt.id));
                    }}
                    className="text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700 shrink-0"
                  >
                    ACK
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
