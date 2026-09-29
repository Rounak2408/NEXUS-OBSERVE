import React, { useState, useEffect } from 'react';
import { Terminal, Search, Filter, Copy, Check, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { Log } from '../types';

export const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await api.get(`/logs?search=${search}&level=${levelFilter}`);
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, levelFilter]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-rose-400 font-bold';
      case 'WARN': return 'text-amber-400 font-bold';
      case 'FATAL': return 'text-purple-400 font-bold';
      case 'DEBUG': return 'text-slate-500';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121722] border border-slate-800/80 rounded-xl p-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 font-mono">
            <Terminal className="w-5 h-5 text-blue-400" />
            Monospace Terminal Log Explorer
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            High-performance stream log viewer with keyword filtering and JSON metadata inspection.
          </p>
        </div>

        <button onClick={fetchLogs} className="p-2 bg-[#161C2A] hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-[#121722] border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search regex pattern or keyword (e.g. timeout, 500)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#161C2A] border border-slate-800 focus:border-blue-500 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value)}
            className="bg-[#161C2A] border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="All">Level: All</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
            <option value="DEBUG">DEBUG</option>
          </select>
        </div>
      </div>

      {/* Terminal Viewer Container */}
      <div className="bg-[#0B0E14] border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-mono text-xs">
        {/* Terminal Header */}
        <div className="bg-[#121722] px-4 py-2 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="ml-2 font-semibold text-slate-300">nexus-stdout.log</span>
          </div>
          <span>{logs.length} LOG ENTRIES RETURNED</span>
        </div>

        {/* Log Entries */}
        <div className="p-4 space-y-1.5 max-h-[600px] overflow-y-auto">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No matching log records found.
            </div>
          ) : (
            logs.map(log => {
              const isExpanded = expandedId === log.id;
              const logLineText = `${new Date(log.timestamp).toLocaleTimeString()} [${log.level}] ${log.source}: ${log.message}`;

              return (
                <div key={log.id} className="group rounded hover:bg-[#121722] p-1.5 transition-colors">
                  <div className="flex items-baseline justify-between gap-3 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : log.id)}>
                    <div className="flex items-center gap-2 overflow-hidden">
                      {log.metadata ? (
                        isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      ) : <span className="w-3.5 h-3.5 shrink-0" />}

                      <span className="text-slate-500 text-[11px] shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>

                      <span className={`w-14 shrink-0 ${getLevelColor(log.level)}`}>
                        {log.level}
                      </span>

                      <span className="text-slate-400 shrink-0 font-semibold">
                        [{log.source || 'app'}]
                      </span>

                      <span className="text-slate-200 truncate">
                        {log.message}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(logLineText, log.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white transition-opacity p-1"
                      title="Copy Log Line"
                    >
                      {copiedId === log.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Metadata JSON Expander */}
                  {isExpanded && log.metadata && (
                    <div className="mt-2 ml-7 p-3 bg-[#161C2A] border border-slate-800 rounded text-[11px] text-emerald-400 overflow-x-auto">
                      <div className="text-slate-400 mb-1 text-[10px]">METADATA ATTRIBUTES:</div>
                      <pre>{JSON.stringify(JSON.parse(log.metadata), null, 2)}</pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
