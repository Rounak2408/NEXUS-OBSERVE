import React, { useState, useEffect } from 'react';
import { Settings, Cloud, ShieldCheck, Database, Lock, Server } from 'lucide-react';
import api from '../services/api';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        setSettings(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading || !settings) {
    return <div className="p-12 text-center font-mono text-xs text-slate-500">Loading settings...</div>;
  }

  const { integrations } = settings;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121722] border border-slate-800/80 rounded-xl p-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 font-mono">
            <Settings className="w-5 h-5 text-blue-400" />
            Cloud Integration & Platform Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            AWS IAM Role bindings, CloudWatch telemetry streams, S3 buckets, and RDS MySQL connections.
          </p>
        </div>
      </div>

      {/* Cloud Integration Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CloudWatch */}
        <div className="bg-[#121722] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Cloud className="w-5 h-5 text-blue-400" /> AWS CloudWatch Metrics & Alarms
            </div>
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30">
              ● CONNECTED
            </span>
          </div>
          <p className="text-xs text-slate-400">Status: {integrations.cloudwatch.status}</p>
          <div className="text-[11px] font-mono text-slate-500 bg-[#161C2A] p-2.5 rounded border border-slate-800">
            IAM Role: arn:aws:iam::84910291:role/NexusObserveCloudWatchRole
          </div>
        </div>

        {/* S3 */}
        <div className="bg-[#121722] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Server className="w-5 h-5 text-purple-400" /> AWS S3 Diagnostic Storage
            </div>
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30">
              ● CONNECTED
            </span>
          </div>
          <p className="text-xs text-slate-400">Status: {integrations.s3.status}</p>
          <div className="text-[11px] font-mono text-slate-500 bg-[#161C2A] p-2.5 rounded border border-slate-800">
            Bucket Name: nexus-observe-telemetry-reports
          </div>
        </div>

        {/* RDS */}
        <div className="bg-[#121722] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Database className="w-5 h-5 text-amber-400" /> AWS RDS MySQL Production Database
            </div>
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30">
              ● CONNECTED
            </span>
          </div>
          <p className="text-xs text-slate-400">Status: {integrations.rds.status}</p>
          <div className="text-[11px] font-mono text-slate-500 bg-[#161C2A] p-2.5 rounded border border-slate-800">
            Host: db-master.rds.us-east-1.amazonaws.com:3306 (SSL Encrypted)
          </div>
        </div>

        {/* VPC & Security */}
        <div className="bg-[#121722] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Lock className="w-5 h-5 text-teal-400" /> Private VPC & Security Groups
            </div>
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30">
              ● SECURED
            </span>
          </div>
          <p className="text-xs text-slate-400">VPC: {integrations.vpc.status}</p>
          <div className="text-[11px] font-mono text-slate-500 bg-[#161C2A] p-2.5 rounded border border-slate-800">
            Security Group: {integrations.securityGroup.status}
          </div>
        </div>
      </div>
    </div>
  );
};
