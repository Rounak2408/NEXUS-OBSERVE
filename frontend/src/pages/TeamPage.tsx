import React, { useState, useEffect } from 'react';
import { Users, Shield, Mail, Activity, UserPlus } from 'lucide-react';
import api from '../services/api';
import { User } from '../types';

export const TeamPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await api.get('/team');
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121722] border border-slate-800/80 rounded-xl p-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 font-mono">
            <Users className="w-5 h-5 text-blue-400" />
            SRE Engineering Team & RBAC Management
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Manage engineering permissions, role-based access control, and incident lead assignments.
          </p>
        </div>
      </div>

      {/* Grid of Team Member Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {users.map(u => (
          <div key={u.id} className="bg-[#121722] border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <img
                src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                alt={u.name}
                className="w-12 h-12 rounded-full border-2 border-blue-500/50 object-cover"
              />
              <div>
                <h3 className="text-sm font-bold text-white">{u.name}</h3>
                <p className="text-xs font-mono text-slate-400">{u.email}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">ACCESS ROLE:</span>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                u.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {u.role}
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">ASSIGNED INCIDENTS:</span>
              <span className="font-bold text-white">{u.incidents?.length || 0} Active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
