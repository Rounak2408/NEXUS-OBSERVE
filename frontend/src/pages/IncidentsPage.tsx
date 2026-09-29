import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, Clock, UserCheck, ShieldAlert, CheckCircle2, ChevronRight, MessageSquare, Plus, X } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import api from '../services/api';
import { Incident } from '../types';

export const IncidentsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const selectedIdFromUrl = searchParams.get('id');

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchIncidents = async () => {
    try {
      const res = await api.get(`/incidents?status=${statusFilter}&severity=${severityFilter}`);
      setIncidents(res.data);
      if (selectedIdFromUrl) {
        const found = res.data.find((i: Incident) => i.id === selectedIdFromUrl);
        if (found) fetchIncidentDetail(found.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIncidentDetail = async (id: string) => {
    try {
      const res = await api.get(`/incidents/${id}`);
      setSelectedIncident(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [statusFilter, severityFilter, selectedIdFromUrl]);

  const handleAction = async (action: 'ACKNOWLEDGE' | 'ASSIGN' | 'ESCALATE' | 'RESOLVE' | 'CLOSE') => {
    if (!selectedIncident) return;
    try {
      const res = await api.put(`/incidents/${selectedIncident.id}/action`, { action });
      setSelectedIncident(res.data);
      fetchIncidents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTimelineNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !newNote.trim()) return;

    try {
      await api.post(`/incidents/${selectedIncident.id}/timeline`, { message: newNote });
      setNewNote('');
      fetchIncidentDetail(selectedIncident.id);
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
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            SRE Incident Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Investigate production incidents, correlate metrics, and lead resolution workflows.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#161C2A] border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="All">Status: All</option>
            <option value="INVESTIGATING">INVESTIGATING</option>
            <option value="IDENTIFIED">IDENTIFIED</option>
            <option value="MONITORING">MONITORING</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>

          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="bg-[#161C2A] border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="All">Severity: All</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
          </select>
        </div>
      </div>

      {/* Incidents List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Incident Cards */}
        <div className="lg:col-span-2 space-y-3">
          {incidents.length === 0 ? (
            <div className="bg-[#121722] border border-slate-800 rounded-xl p-12 text-center text-slate-500 font-mono text-xs">
              ✓ No active incidents matching selected criteria.
            </div>
          ) : (
            incidents.map(inc => (
              <div
                key={inc.id}
                onClick={() => fetchIncidentDetail(inc.id)}
                className={`bg-[#121722] border ${selectedIncident?.id === inc.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-800 hover:border-slate-700'} rounded-xl p-4 cursor-pointer transition-all duration-150`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={inc.severity} size="sm" />
                    <h3 className="text-sm font-semibold text-white">{inc.title}</h3>
                  </div>
                  <StatusBadge status={inc.status} size="sm" showPulse={false} />
                </div>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {inc.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-4">
                    <span>Service: <strong className="text-white">{inc.server?.name || 'checkout-api'}</strong></span>
                    <span>Duration: <strong className="text-white">{inc.durationMins || 18}m</strong></span>
                  </div>
                  <span>Lead: <strong className="text-blue-400">{inc.assignedTo?.name || 'Alex Rivera'}</strong></span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Col: SRE Console Detail Console */}
        <div className="lg:col-span-1">
          {selectedIncident ? (
            <div className="bg-[#121722] border border-slate-800 rounded-xl p-5 space-y-5 sticky top-6">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <StatusBadge status={selectedIncident.severity} size="sm" />
                  <h3 className="text-sm font-bold text-white mt-1">{selectedIncident.title}</h3>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">ID: {selectedIncident.id.slice(0, 8)}</div>
                </div>
                <button onClick={() => setSelectedIncident(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons */}
              <div>
                <div className="text-[11px] font-mono text-slate-400 mb-2">INCIDENT ACTIONS:</div>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  {selectedIncident.status === 'INVESTIGATING' && (
                    <button
                      onClick={() => handleAction('ACKNOWLEDGE')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold"
                    >
                      Acknowledge
                    </button>
                  )}
                  <button
                    onClick={() => handleAction('ESCALATE')}
                    className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 rounded"
                  >
                    Escalate
                  </button>
                  {selectedIncident.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleAction('RESOLVE')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>

              {/* Timeline Feed */}
              <div>
                <div className="text-[11px] font-mono text-slate-400 mb-3 flex items-center justify-between">
                  <span>RESOLUTION TIMELINE:</span>
                  <span className="text-slate-500">{selectedIncident.timeline?.length || 0} entries</span>
                </div>

                <div className="space-y-3 border-l-2 border-slate-800 pl-3 max-h-64 overflow-y-auto text-xs font-mono">
                  {selectedIncident.timeline?.map(entry => (
                    <div key={entry.id} className="relative">
                      <span className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-blue-400" />
                      <div className="text-slate-400 text-[10px]">
                        {new Date(entry.timestamp).toLocaleTimeString()} • {entry.author}
                      </div>
                      <div className="text-slate-200 mt-0.5">{entry.message}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddTimelineNote} className="space-y-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  placeholder="Add investigation update note..."
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  className="w-full bg-[#161C2A] border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded font-semibold"
                >
                  Post Timeline Note
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-[#121722] border border-slate-800 rounded-xl p-8 text-center text-slate-500 font-mono text-xs">
              Select an incident to open SRE command console.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
