import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Server as ServerIcon, Plus, Search, Filter, Trash2, ExternalLink, Check, ChevronRight, X, Cpu, HardDrive, Activity } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import api from '../services/api';
import { Server as ServerType } from '../types';

export const InfrastructurePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [servers, setServers] = useState<ServerType[]>([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [envFilter, setEnvFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Multi-step modal state
  const [isWizardOpen, setIsWizardOpen] = useState(searchParams.get('add') === 'true');
  const [wizardStep, setWizardStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    environment: 'Production',
    serviceType: 'Web API',
    monitoringUrl: '',
    checkInterval: 10,
    cpuThreshold: 80,
    memThreshold: 85,
    diskThreshold: 90,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchServers = async () => {
    try {
      const res = await api.get(`/services?environment=${envFilter}&status=${statusFilter}&serviceType=${typeFilter}&search=${search}`);
      setServers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchServers();
  }, [search, envFilter, statusFilter, typeFilter]);

  const handleCreateService = async () => {
    setSubmitting(true);
    try {
      await api.post('/services', formData);
      setIsWizardOpen(false);
      setWizardStep(1);
      setFormData({
        name: '',
        host: '',
        environment: 'Production',
        serviceType: 'Web API',
        monitoringUrl: '',
        checkInterval: 10,
        cpuThreshold: 80,
        memThreshold: 85,
        diskThreshold: 90,
      });
      fetchServers();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this monitored service?')) {
      await api.delete(`/services/${id}`);
      fetchServers();
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121722] border border-slate-800/80 rounded-xl p-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ServerIcon className="w-5 h-5 text-blue-400" />
            Infrastructure & Connected Services
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Monitor and manage your connected microservices, load balancers, and database clusters.
          </p>
        </div>

        <button
          onClick={() => setIsWizardOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> ADD SERVICE / SERVER
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#121722] border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search service name, host IP..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#161C2A] border border-slate-800 focus:border-blue-500 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
          />
        </div>

        {/* Dropdown filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs font-mono">
          <select
            value={envFilter}
            onChange={e => setEnvFilter(e.target.value)}
            className="bg-[#161C2A] border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="All">Env: All</option>
            <option value="Production">Production</option>
            <option value="Staging">Staging</option>
            <option value="Development">Development</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#161C2A] border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="All">Status: All</option>
            <option value="HEALTHY">HEALTHY</option>
            <option value="DEGRADED">DEGRADED</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-[#161C2A] border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="All">Type: All</option>
            <option value="Web API">Web API</option>
            <option value="Auth API">Auth API</option>
            <option value="Load Balancer">Load Balancer</option>
            <option value="Database">Database</option>
            <option value="Redis Cache">Redis Cache</option>
            <option value="Worker">Worker</option>
          </select>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-[#121722] border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#161C2A] border-b border-slate-800 text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Service & Host</th>
                <th className="py-3 px-4">Environment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">CPU %</th>
                <th className="py-3 px-4">Memory %</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">Uptime %</th>
                <th className="py-3 px-4">Last Check</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {servers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No infrastructure services matched your search filter.
                  </td>
                </tr>
              ) : (
                servers.map(server => (
                  <tr
                    key={server.id}
                    className="hover:bg-[#161C2A]/60 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/services/${server.id}`)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white group-hover:text-blue-400 transition-colors font-sans">
                        {server.name}
                      </div>
                      <div className="text-[10px] text-slate-500">{server.host}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 text-[10px]">
                        {server.environment}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={server.status} size="sm" />
                    </td>

                    <td className="py-3 px-4">
                      <span className={server.currentCpu >= server.cpuThreshold ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                        {server.currentCpu.toFixed(1)}%
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={server.currentMemory >= server.memThreshold ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                        {server.currentMemory.toFixed(1)}%
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-200">
                      {server.currentLatency}ms
                    </td>

                    <td className="py-3 px-4 text-emerald-400 font-semibold">
                      {server.uptimePercent}%
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[10px]">
                      {new Date(server.lastCheckAt).toLocaleTimeString()}
                    </td>

                    <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(server.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                        title="Delete Service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 18. MULTI-STEP ADD SERVICE MODAL WIZARD */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121722] border border-slate-700 rounded-xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#161C2A]">
              <div>
                <h3 className="text-sm font-bold text-white font-mono">ADD NEW SERVICE / SERVER</h3>
                <p className="text-[11px] text-slate-400 font-mono">Step {wizardStep} of 4: Setup telemetry & threshold parameters</p>
              </div>
              <button onClick={() => setIsWizardOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Progress Bar */}
            <div className="flex border-b border-slate-800 text-[11px] font-mono text-center">
              {['1. Information', '2. Monitoring', '3. Alert Policy', '4. Review'].map((label, idx) => (
                <div
                  key={idx}
                  className={`flex-1 py-2 ${
                    wizardStep === idx + 1
                      ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500 font-bold'
                      : wizardStep > idx + 1
                      ? 'text-emerald-400 bg-emerald-500/5'
                      : 'text-slate-500 bg-slate-900/40'
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Step Body Content */}
            <div className="p-6 space-y-4">
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">SERVICE NAME</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Order Processing API"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#161C2A] border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">HOST / IP ADDRESS</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. order-api.prod.nexus.internal"
                      value={formData.host}
                      onChange={e => setFormData({ ...formData, host: e.target.value })}
                      className="w-full bg-[#161C2A] border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">SERVICE TYPE</label>
                    <select
                      value={formData.serviceType}
                      onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
                      className="w-full bg-[#161C2A] border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none font-mono"
                    >
                      <option value="Web API">Web API</option>
                      <option value="Auth API">Auth API</option>
                      <option value="Load Balancer">Load Balancer</option>
                      <option value="Database">Database</option>
                      <option value="Redis Cache">Redis Cache</option>
                      <option value="Worker">Worker</option>
                    </select>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">ENVIRONMENT</label>
                    <select
                      value={formData.environment}
                      onChange={e => setFormData({ ...formData, environment: e.target.value })}
                      className="w-full bg-[#161C2A] border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none font-mono"
                    >
                      <option value="Production">Production</option>
                      <option value="Staging">Staging</option>
                      <option value="Development">Development</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">HTTP HEALTHCHECK URL (OPTIONAL)</label>
                    <input
                      type="text"
                      placeholder="http://10.0.2.25:8080/health"
                      value={formData.monitoringUrl}
                      onChange={e => setFormData({ ...formData, monitoringUrl: e.target.value })}
                      className="w-full bg-[#161C2A] border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">POLLING CHECK INTERVAL (SECONDS)</label>
                    <input
                      type="number"
                      value={formData.checkInterval}
                      onChange={e => setFormData({ ...formData, checkInterval: parseInt(e.target.value, 10) || 10 })}
                      className="w-full bg-[#161C2A] border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">CPU THRESHOLD WARNING (%)</label>
                    <input
                      type="number"
                      value={formData.cpuThreshold}
                      onChange={e => setFormData({ ...formData, cpuThreshold: parseFloat(e.target.value) || 80 })}
                      className="w-full bg-[#161C2A] border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">MEMORY THRESHOLD WARNING (%)</label>
                    <input
                      type="number"
                      value={formData.memThreshold}
                      onChange={e => setFormData({ ...formData, memThreshold: parseFloat(e.target.value) || 85 })}
                      className="w-full bg-[#161C2A] border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">DISK USAGE THRESHOLD WARNING (%)</label>
                    <input
                      type="number"
                      value={formData.diskThreshold}
                      onChange={e => setFormData({ ...formData, diskThreshold: parseFloat(e.target.value) || 90 })}
                      className="w-full bg-[#161C2A] border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {wizardStep === 4 && (
                <div>
                  <h4 className="text-xs font-mono text-slate-400 mb-2">LIVE CONFIGURATION PREVIEW:</h4>
                  <pre className="bg-[#0B0E14] p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
                    {JSON.stringify(formData, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-slate-800 bg-[#161C2A] flex items-center justify-between">
              {wizardStep > 1 ? (
                <button
                  onClick={() => setWizardStep(prev => prev - 1)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono"
                >
                  Back
                </button>
              ) : <div />}

              {wizardStep < 4 ? (
                <button
                  disabled={!formData.name || !formData.host}
                  onClick={() => setWizardStep(prev => prev + 1)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1"
                >
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  disabled={submitting}
                  onClick={handleCreateService}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1 shadow-lg shadow-emerald-600/25"
                >
                  {submitting ? 'Registering...' : 'CONFIRM & DEPLOY MONITOR'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
