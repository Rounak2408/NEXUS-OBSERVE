import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { CommandPalette } from '../common/CommandPalette';
import { NotificationDrawer } from '../common/NotificationDrawer';
import api from '../../services/api';
import { NotificationItem } from '../../types';

export const AppShell: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedEnv, setSelectedEnv] = useState('Production');

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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0E14] text-slate-100">
      {/* Collapsible Sidebar */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <TopNav
          onOpenCommandPalette={() => setIsCommandOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          notifications={notifications}
          selectedEnv={selectedEnv}
          onEnvChange={setSelectedEnv}
        />

        {/* Demo Mode Banner Indicator */}
        <div className="bg-gradient-to-r from-blue-900/30 via-slate-900 to-blue-900/30 border-b border-blue-500/20 px-4 py-1 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-blue-300 font-semibold">DEMO MODE ACTIVE</span>
            <span className="text-slate-400">| Simulating live CloudWatch telemetry & synthetic server metrics</span>
          </div>
          <div className="text-slate-500 hidden md:block">AWS EC2 / RDS / S3 Telemetry Pipeline</div>
        </div>

        {/* View Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0B0E14]">
          <Outlet context={{ selectedEnv }} />
        </main>
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
