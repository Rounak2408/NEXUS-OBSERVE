import React, { useState, useEffect } from 'react';
import { Search, Bell, LogOut, Shield, ChevronDown, Radio } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationItem } from '../../types';

interface TopNavProps {
  onOpenCommandPalette: () => void;
  onOpenNotifications: () => void;
  notifications: NotificationItem[];
  selectedEnv: string;
  onEnvChange: (env: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenCommandPalette,
  onOpenNotifications,
  notifications,
  selectedEnv,
  onEnvChange,
}) => {
  const { user, logout } = useAuth();
  const [timeStr, setTimeStr] = useState(new Date().toLocaleTimeString());
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-[#0B0E14] border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between z-20 shrink-0">
      {/* Search trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-3 bg-[#121722] hover:bg-[#161C2A] text-slate-400 hover:text-slate-200 border border-slate-800 px-3.5 py-1.5 rounded-lg text-xs font-sans transition-all w-48 md:w-72"
        >
          <Search className="w-3.5 h-3.5 text-blue-400" />
          <span className="truncate">Search services, metrics, logs...</span>
          <span className="ml-auto text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">⌘K</span>
        </button>
      </div>

      {/* Center / Right controls */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Environment Selector */}
        <div className="relative flex items-center bg-[#121722] border border-slate-800 rounded-lg p-1 text-xs font-mono">
          {['Production', 'Staging', 'Development'].map(env => (
            <button
              key={env}
              onClick={() => onEnvChange(env)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                selectedEnv === env
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {env}
            </button>
          ))}
        </div>

        {/* Live status badge */}
        <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-mono">
          <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
          <span className="font-bold">LIVE</span>
          <span className="text-slate-500 text-[11px]">| {timeStr}</span>
        </div>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800/80 transition-colors"
          title="Notification Center"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-4 ring-[#0B0E14]" />
          )}
        </button>

        {/* User Profile menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
              alt={user?.name}
              className="w-8 h-8 rounded-full border border-blue-500/50 object-cover"
            />
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-white leading-none">{user?.name || 'Alex Rivera'}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{user?.role || 'ADMIN'}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-[#121722] border border-slate-700/80 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in duration-100">
              <div className="p-2 border-b border-slate-800 text-xs">
                <div className="font-semibold text-white">{user?.name}</div>
                <div className="text-slate-400 text-[11px] font-mono truncate">{user?.email}</div>
              </div>
              <div className="py-1">
                <div className="px-2 py-1.5 text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  Role: <span className="text-white font-bold">{user?.role}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="w-full text-left px-2 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
