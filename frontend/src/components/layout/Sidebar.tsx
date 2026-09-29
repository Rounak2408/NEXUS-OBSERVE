import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  AlertTriangle,
  Bell,
  Terminal,
  BarChart2,
  Award,
  Folder,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const navItems = [
    { label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Infrastructure', icon: Server, path: '/infrastructure' },
    { label: 'Incidents', icon: AlertTriangle, path: '/incidents', badge: '1 CRITICAL' },
    { label: 'Alerts', icon: Bell, path: '/alerts' },
    { label: 'Logs', icon: Terminal, path: '/logs' },
    { label: 'Analytics', icon: BarChart2, path: '/analytics' },
    { label: 'SRE Scorecard', icon: Award, path: '/sre' },
    { label: 'Files', icon: Folder, path: '/files' },
    { label: 'Team', icon: Users, path: '/team' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside
      className={`bg-[#0B0E14] border-r border-slate-800/80 flex flex-col transition-all duration-300 z-30 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-wider text-white font-mono flex items-center gap-1">
                NEXUS<span className="text-blue-500">OBSERVE</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono tracking-tight">ENTERPRISE SRE v2.4</div>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center mx-auto">
            <Activity className="w-5 h-5 text-white" />
          </div>
        )}

        <button
          onClick={onToggle}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800/80 transition-colors hidden md:block"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all relative group ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />

              {!collapsed && (
                <div className="flex-1 flex items-center justify-between overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-mono font-bold bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/30">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-mono rounded border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info */}
      {!collapsed && (
        <div className="p-3 m-3 bg-[#121722] border border-slate-800 rounded-lg text-xs">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>ENGINE: ACTIVE</span>
            <span className="text-emerald-400">● 10s PULL</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 truncate">CloudWatch AWS SDK v3</div>
        </div>
      )}
    </aside>
  );
};
