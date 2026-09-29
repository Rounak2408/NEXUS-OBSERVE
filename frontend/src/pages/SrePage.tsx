import React, { useState, useEffect } from 'react';
import { Award, ShieldCheck, CheckCircle2, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import api from '../services/api';
import { SREScorecard } from '../types';

export const SrePage: React.FC = () => {
  const [scorecard, setScorecard] = useState<SREScorecard | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchScorecard = async () => {
    try {
      const res = await api.get('/sre/scorecard');
      setScorecard(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScorecard();
  }, []);

  if (loading || !scorecard) {
    return <div className="p-12 text-center font-mono text-xs text-slate-500">Loading SRE Scorecard...</div>;
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121722] border border-slate-800/80 rounded-xl p-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 font-mono">
            <Award className="w-5 h-5 text-emerald-400" />
            SRE Reliability & SLO Compliance Scorecard
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Service Level Objectives (SLOs), Service Level Indicators (SLIs), and Error Budget tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold px-3 py-1.5 rounded-lg">
            OVERALL SLO COMPLIANT (99.92%)
          </span>
        </div>
      </div>

      {/* Hero Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#121722] border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-mono text-slate-400">SLO Compliance Index</div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">{scorecard.sloCompliance}%</div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">Target: {scorecard.sloTarget}%</div>
        </div>

        <div className="bg-[#121722] border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-mono text-slate-400">Error Budget Remaining</div>
          <div className="text-3xl font-extrabold font-mono text-blue-400 mt-1">{scorecard.errorBudgetRemaining}</div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">Reset in 12 days</div>
        </div>

        <div className="bg-[#121722] border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-mono text-slate-400">MTTR (Mean Time to Resolve)</div>
          <div className="text-3xl font-extrabold font-mono text-purple-400 mt-1">{scorecard.mttr}</div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">Target: &lt; 30m</div>
        </div>

        <div className="bg-[#121722] border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-mono text-slate-400">MTBF (Between Failures)</div>
          <div className="text-3xl font-extrabold font-mono text-teal-400 mt-1">{scorecard.mtbf}</div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">Target: &gt; 48h</div>
        </div>
      </div>

      {/* Detailed Indicator Progress Bars */}
      <div className="bg-[#121722] border border-slate-800/80 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">SERVICE LEVEL INDICATORS (SLIs)</h3>

        <div className="space-y-4">
          {scorecard.indicators.map((ind, idx) => (
            <div key={idx} className="bg-[#161C2A] border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-white">{ind.name}</span>
                  <StatusBadge status={ind.status} size="sm" showPulse={false} />
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-slate-400">Target: <strong className="text-slate-200">{ind.target}</strong></span>
                  <span className="text-slate-400">Current: <strong className="text-emerald-400">{ind.current}</strong></span>
                  <span className="text-emerald-400">{ind.trend}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${ind.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
