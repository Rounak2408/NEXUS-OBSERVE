import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCheck, AlertOctagon, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { NotificationItem } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onMarkRead,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Critical': return <AlertOctagon className="w-4 h-4 text-rose-400" />;
      case 'Incident': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'Recovery': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-[#121722] border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-rose-500/20 text-rose-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
              {unreadCount} UNREAD
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark read
            </button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs font-mono">
            No notification alerts at present.
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => {
                onMarkRead(n.id);
                if (n.linkUrl) {
                  navigate(n.linkUrl);
                  onClose();
                }
              }}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                !n.read ? 'bg-[#161C2A] border-slate-700/80 shadow-sm' : 'bg-slate-900/40 border-slate-800/60 opacity-70'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 p-1 rounded bg-slate-800/80">
                  {getCategoryIcon(n.category)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white truncate">{n.title}</span>
                    <span className="text-[10px] font-mono text-slate-500">{n.category}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
