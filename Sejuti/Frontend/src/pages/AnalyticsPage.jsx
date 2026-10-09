import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/api';
import { 
  BarChart3, 
  Flame, 
  ShieldAlert, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  BookOpen,
  PieChart,
  Activity
} from 'lucide-react';

export const AnalyticsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsService.getAnalytics
  });

  const stats = data?.stats || {};

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-surface-border">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-sos-cyan/20 border border-sos-cyan/40 text-sos-cyan shadow-glow-cyan">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold font-mono tracking-wider text-white uppercase">
              Emergency Analytics & Burnout Telemetry
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Study debt calculations, velocity analysis, and cognitive workload distribution.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Academic Study Debt */}
        <div className="glass-panel rounded-2xl p-5 border border-surface-border relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Academic Study Debt</span>
            <AlertTriangle className={`w-4 h-4 ${stats.studyDebtHours > 0 ? 'text-sos-crimson' : 'text-sos-mint'}`} />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {stats.studyDebtHours > 0 ? `+${stats.studyDebtHours}h` : '0.0h'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            {stats.studyDebtHours > 0 ? 'Hours required beyond daily capacity' : 'Workload within safe flight envelope'}
          </p>
        </div>

        {/* Card 2: Burnout Index */}
        <div className="glass-panel rounded-2xl p-5 border border-surface-border relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Burnout Index</span>
            <Activity className="w-4 h-4 text-sos-amber" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {stats.burnoutIndex || 0}%
          </div>
          <p className={`text-[11px] font-mono mt-1 font-bold ${
            stats.burnoutIndex > 80 ? 'text-sos-crimson' : stats.burnoutIndex > 50 ? 'text-sos-amber' : 'text-sos-mint'
          }`}>
            {stats.burnoutLevel || 'Nominal'}
          </p>
        </div>

        {/* Card 3: Completion Rate */}
        <div className="glass-panel rounded-2xl p-5 border border-surface-border relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-sos-mint" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {stats.completionRate || 0}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            {stats.completedTasks || 0} of {stats.totalTasks || 0} assessment units cleared
          </p>
        </div>

        {/* Card 4: Logged Study Hours */}
        <div className="glass-panel rounded-2xl p-5 border border-surface-border relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Logged Effort</span>
            <Clock className="w-4 h-4 text-sos-violet" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {stats.totalCompletedHours || 0}h
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            {stats.totalRemainingHours || 0}h active effort remaining
          </p>
        </div>

      </div>

      {/* Course Workload Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Course Effort Distribution */}
        <div className="glass-card rounded-2xl p-5 border border-surface-border space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sos-cyan" />
            <h2 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
              Course Workload Distribution (Remaining Hours)
            </h2>
          </div>

          <div className="space-y-3 pt-2">
            {(stats.courseDistribution || []).map((c) => {
              const maxHours = 15;
              const percent = Math.min(100, Math.round((c.hours / maxHours) * 100));

              return (
                <div key={c.course} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-bold">{c.course}</span>
                    <span className="text-sos-cyan font-bold">{c.hours}h ({c.count} tasks)</span>
                  </div>
                  <div className="w-full bg-abyss rounded-full h-2 overflow-hidden border border-surface-border">
                    <div
                      className={`h-full rounded-full ${c.criticalCount > 0 ? 'bg-sos-crimson' : 'bg-gradient-to-r from-sos-cyan to-sos-violet'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Triage Breakdown */}
        <div className="glass-card rounded-2xl p-5 border border-surface-border space-y-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-sos-crimson" />
            <h2 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
              Urgency Classification Breakdown
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-abyss/80 border border-sos-crimson/40">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Critical Urgency</span>
              <div className="text-2xl font-black font-mono text-sos-crimson mt-1">
                {stats.urgencyCounts?.critical || 0}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Score &gt; 20 or &lt; 24h</span>
            </div>

            <div className="p-4 rounded-xl bg-abyss/80 border border-sos-amber/40">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Moderate Warning</span>
              <div className="text-2xl font-black font-mono text-sos-amber mt-1">
                {stats.urgencyCounts?.warning || 0}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Score 10 - 20</span>
            </div>

            <div className="p-4 rounded-xl bg-abyss/80 border border-sos-cyan/40">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Elevated Priority</span>
              <div className="text-2xl font-black font-mono text-sos-cyan mt-1">
                {stats.urgencyCounts?.elevated || 0}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Score 4 - 10</span>
            </div>

            <div className="p-4 rounded-xl bg-abyss/80 border border-sos-mint/40">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Safe Horizon</span>
              <div className="text-2xl font-black font-mono text-sos-mint mt-1">
                {stats.urgencyCounts?.safe || 0}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Score &lt; 4 or Done</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
