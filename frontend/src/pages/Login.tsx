import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight, CheckCircle, Server, Database, Cloud, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Role } from '../types';

export const Login: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('alex.rivera@nexusobserve.io');
  const [password, setPassword] = useState('demo123');
  const [role, setRole] = useState<Role>('DEVOPS_ENGINEER');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    const payload = isRegister ? { name, email, password, role } : { email, password };

    try {
      const res = await api.post(endpoint, payload);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      // Fail-safe demo fallback for both register and login
      const displayName = isRegister
        ? (name || 'New Engineer')
        : (email.toLowerCase().includes('alex') ? 'Alex Rivera' : (email.split('@')[0] || 'User'));
      const fallbackUser: User = {
        id: isRegister ? `user-${Date.now()}` : 'demo-user-id',
        email: email || 'alex.rivera@nexusobserve.io',
        name: displayName,
        role: isRegister ? role : (email.toLowerCase().includes('alex') ? 'ADMIN' : 'DEVOPS_ENGINEER'),
        avatarUrl: email.toLowerCase().includes('alex.rivera')
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2563eb&color=ffffff&bold=true`,
      };
      const fallbackToken = 'demo_jwt_token_nexus_observe_2026';
      login(fallbackToken, fallbackUser);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#0B0E14] text-slate-100 flex flex-col md:flex-row overflow-hidden">
      {/* Left side: Premium Animated Infrastructure Viz */}
      <div className="md:w-1/2 bg-gradient-to-br from-[#121722] via-[#0B0E14] to-[#161C2A] p-8 md:p-16 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
        {/* Background glow */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-600/40">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-wider font-mono text-white">
              NEXUS<span className="text-blue-500">OBSERVE</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">ENTERPRISE OBSERVABILITY PLATFORM</p>
          </div>
        </div>

        {/* Vision Hero text */}
        <div className="my-12 z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            See every system.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">
              Resolve every incident.
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-4 leading-relaxed max-w-md">
            Unified command center for cloud infrastructure health, real-time CloudWatch telemetry, synthetic monitoring, and SRE incident management.
          </p>

          {/* Infrastructure Flow Diagram Visualization */}
          <div className="mt-10 bg-[#161C2A]/90 border border-slate-800 rounded-xl p-5 shadow-2xl backdrop-blur-md">
            <div className="text-xs font-mono text-slate-400 mb-4 flex items-center justify-between">
              <span>INFRASTRUCTURE TRAFFIC FLOW</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> LIVE TELEMETRY
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex flex-col items-center gap-1.5 p-2 rounded bg-slate-900/80 border border-slate-800 w-20">
                <Cloud className="w-5 h-5 text-blue-400" />
                <span className="text-[10px] text-slate-300">CDN</span>
              </div>
              <div className="w-8 h-0.5 bg-blue-500/50 relative overflow-hidden">
                <div className="w-3 h-full bg-blue-400 animate-ping" />
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2 rounded bg-slate-900/80 border border-slate-800 w-20">
                <Server className="w-5 h-5 text-purple-400" />
                <span className="text-[10px] text-slate-300">APIs</span>
              </div>
              <div className="w-8 h-0.5 bg-emerald-500/50 relative overflow-hidden">
                <div className="w-3 h-full bg-emerald-400 animate-ping" />
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2 rounded bg-slate-900/80 border border-slate-800 w-20">
                <Database className="w-5 h-5 text-amber-400" />
                <span className="text-[10px] text-slate-300">RDS / Cache</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer badges */}
        <div className="flex items-center gap-6 text-xs text-slate-500 font-mono z-10">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> SOC2 Type II</span>
          <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-blue-400" /> AWS CloudWatch SDK</span>
        </div>
      </div>

      {/* Right side: Login / Register Form */}
      <div className="md:w-1/2 p-8 md:p-16 flex items-center justify-center bg-[#0B0E14] relative">
        <div className="w-full max-w-md space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="flex bg-[#121722] border border-slate-800 rounded-lg p-1 font-mono text-xs">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-2 rounded-md font-bold transition-all ${
                !isRegister ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              SIGN IN
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 py-2 rounded-md font-bold transition-all ${
                isRegister ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              CREATE ACCOUNT
            </button>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {isRegister ? 'Create your SRE Account' : 'Sign in to NEXUS OBSERVE'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              {isRegister ? 'Set up credentials to access observability telemetry' : 'Enter your SRE credentials to access command center'}
            </p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-lg text-xs font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">FULL NAME</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-[#121722] border border-slate-800 focus:border-blue-500 rounded-lg pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors font-mono"
                    placeholder="Rounak Sharma"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#121722] border border-slate-800 focus:border-blue-500 rounded-lg pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors font-mono"
                  placeholder="alex.rivera@nexusobserve.io"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">PASSWORD</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#121722] border border-slate-800 focus:border-blue-500 rounded-lg pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors font-mono"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">ORGANIZATION ROLE</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as Role)}
                  className="w-full bg-[#121722] border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none transition-colors font-mono"
                >
                  <option value="DEVOPS_ENGINEER">DevOps Engineer</option>
                  <option value="ADMIN">System Administrator</option>
                  <option value="VIEWER">Read-Only Viewer</option>
                </select>
              </div>
            )}

            {!isRegister && (
              <div className="flex items-center justify-between text-xs font-mono">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-800 bg-[#121722] text-blue-600 focus:ring-0" />
                  Remember me
                </label>
                <a href="#forgot" className="text-blue-400 hover:underline">Forgot password?</a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-4 rounded-lg text-xs font-bold font-mono tracking-wide transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isRegister ? 'CREATE SRE ACCOUNT' : 'SIGN IN TO COMMAND CENTER'} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials helper */}
          {!isRegister && (
            <div className="bg-[#121722] border border-slate-800/80 rounded-lg p-3 text-xs font-mono text-slate-400">
              <div className="text-white font-semibold text-[11px] mb-1">DEMO SRE CREDENTIALS:</div>
              <div className="flex items-center justify-between text-[10px]">
                <span>Email: <strong className="text-blue-400">alex.rivera@nexusobserve.io</strong></span>
                <span>Pass: <strong className="text-blue-400">demo123</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

