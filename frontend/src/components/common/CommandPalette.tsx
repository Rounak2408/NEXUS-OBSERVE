import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, Server, AlertTriangle, Terminal, BarChart2, Award, PlusCircle, Folder, Users, Settings } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const commands = [
    { id: 'dash', label: 'Go to Command Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'infra', label: 'View Infrastructure & Services', icon: Server, path: '/infrastructure' },
    { id: 'add-service', label: 'Add New Service / Server', icon: PlusCircle, path: '/infrastructure?add=true' },
    { id: 'incidents', label: 'Open Incident Command Center', icon: AlertTriangle, path: '/incidents' },
    { id: 'alerts', label: 'Open Real-time Alert Stream', icon: AlertTriangle, path: '/alerts' },
    { id: 'logs', label: 'Open Monospace Log Explorer', icon: Terminal, path: '/logs' },
    { id: 'analytics', label: 'View Executive Analytics', icon: BarChart2, path: '/analytics' },
    { id: 'sre', label: 'View SRE Reliability Scorecard', icon: Award, path: '/sre' },
    { id: 'files', label: 'Open AWS S3 Storage & Logs', icon: Folder, path: '/files' },
    { id: 'team', label: 'Manage Team & Access Roles', icon: Users, path: '/team' },
    { id: 'settings', label: 'Open Cloud & Platform Settings', icon: Settings, path: '/settings' },
  ];

  const filtered = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }

      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        navigate(filtered[selectedIndex].path);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24 px-4 animate-in fade-in duration-150">
      <div className="bg-[#121722] border border-slate-700/80 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-blue-400" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search platform features... (Esc to cancel)"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-white text-sm focus:outline-none font-sans placeholder-slate-500"
          />
          <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">ESC</span>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs font-mono">
              No matching commands found.
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    navigate(cmd.path);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-xs font-medium transition-colors ${
                    isSelected ? 'bg-blue-600/20 text-white border border-blue-500/30' : 'text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span>{cmd.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{cmd.path}</span>
                </div>
              );
            })
          )}
        </div>

        <div className="bg-[#161C2A] px-4 py-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Navigate <kbd className="bg-slate-800 px-1 rounded border border-slate-700">↑</kbd> <kbd className="bg-slate-800 px-1 rounded border border-slate-700">↓</kbd></span>
          <span>Select <kbd className="bg-slate-800 px-1 rounded border border-slate-700">↵</kbd></span>
          <span>Shortcut <kbd className="bg-slate-800 px-1 rounded border border-slate-700">Ctrl+K</kbd></span>
        </div>
      </div>
    </div>
  );
};
