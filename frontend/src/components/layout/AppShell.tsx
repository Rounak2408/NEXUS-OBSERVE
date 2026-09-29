import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { CommandPalette } from '../common/CommandPalette';
import { NotificationDrawer } from '../common/NotificationDrawer';
import api from '../../services/api';
import { NotificationItem } from '../../types';
import { LayoutDashboard, Server, AlertTriangle, Bell, Terminal, X } from 'lucide-react';

export const AppShell: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedEnv, setSelectedEnv] = useState('Production');
  const location = useLocation();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {
      // Ignore
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {
      // Ignore
    }
  };

  const mobileNavItems = [
    { label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Infra', icon: Server, path: '/infrastructure' },
    { label: 'Incidents', icon: AlertTriangle, path: '/incidents' },
    { label: 'Alerts', icon: Bell, path: '/alerts' },
    { label: 'Logs', icon: Terminal, path: '/logs' },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0E14] text-slate-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Mobile Slide-out Drawer Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          />

          {/* Drawer content */}
          <div className="relative w-72 bg-[#0B0E14] border-r border-slate-800 z-10 flex flex-col animate-in slide-in-from-left duration-200 shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-white">NEXUS OBSERVE NAV</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar collapsed={false} onToggle={() => {}} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <TopNav
          onOpenCommandPalette={() => setIsCommandOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          notifications={notifications}
          selectedEnv={selectedEnv}
          onEnvChange={setSelectedEnv}
        />

        {/* Demo Mode Banner Indicator */}
        <div className="bg-gradient-to-r from-blue-900/30 via-slate-900 to-blue-900/30 border-b border-blue-500/20 px-3 md:px-4 py-1 flex items-center justify-between text-[10px] md:text-[11px] font-mono shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shrink-0" />
            <span className="text-blue-300 font-semibold shrink-0">DEMO MODE ACTIVE</span>
            <span className="text-slate-400 truncate">| Live CloudWatch & synthetic metrics</span>
          </div>
          <div className="text-slate-500 hidden md:block">AWS Telemetry Pipeline</div>
        </div>

        {/* View Content (Extra bottom padding on mobile for bottom navigation bar) */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-[#0B0E14] pb-20 md:pb-6">
          <Outlet context={{ selectedEnv }} />
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#121722] border-t border-slate-800 flex items-center justify-around z-40 px-2 shadow-2xl">
          {mobileNavItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                    isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-mono">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Modals & Overlays */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onMarkRead={handleMarkRead}
      />
    </div>
  );
};
