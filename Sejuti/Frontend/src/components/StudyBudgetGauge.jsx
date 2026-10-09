import React from 'react';
import { PomodoroWidget } from './PomodoroWidget';
import { Gauge, Flame, AlertCircle, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

export const StudyBudgetGauge = ({
  dailyCapacity = 4,
  tasks = [],
  studyDebtHours = 0,
  onLogFocusTime,
  activeTask
}) => {
  const activeTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  
  // Calculate today's completed study hours
  const totalCompletedHours = tasks.reduce((sum, t) => sum + (t.hoursCompleted || 0), 0);
  const totalRemainingHours = activeTasks.reduce((sum, t) => sum + (t.remainingHours || 0), 0);
  
  // Today's study target used (simulated today's progress vs daily capacity)
  const todayUsedHours = Math.min(dailyCapacity, Number(totalCompletedHours.toFixed(1)));
  const percentUsed = Math.min(100, Math.round((todayUsedHours / dailyCapacity) * 100));

  const criticalCount = activeTasks.filter(t => t.urgencyLevel === 'critical').length;
  const warningCount = activeTasks.filter(t => t.urgencyLevel === 'warning').length;

  // SVG Circular Gauge calculation
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentUsed / 100) * circumference;

  return (
    <div className="space-y-4">
      
      {/* 1. Daily Study Capacity Gauge Card */}
      <div className="glass-panel rounded-2xl p-5 border border-surface-border relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-sos-cyan" />
            <h3 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
              Study Budget Gauge
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sos-cyan/10 text-sos-cyan border border-sos-cyan/30">
            {dailyCapacity}h / DAY
          </span>
        </div>

        {/* Circular Progress Gauge */}
        <div className="flex items-center justify-center my-2 relative">
          <svg className="w-36 h-36 transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="url(#cyanGradient)"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00F0FF" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Centered Stats in Gauge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black font-mono text-white tracking-tight">
              {percentUsed}%
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              {todayUsedHours}h / {dailyCapacity}h Logged
            </span>
          </div>
        </div>

        {/* Budget Summary Metrics */}
        <div className="mt-4 pt-4 border-t border-surface-border grid grid-cols-2 gap-2 text-center">
          <div className="bg-abyss/60 rounded-xl p-2.5 border border-surface-border">
            <span className="text-[10px] text-slate-400 font-mono block">REMAINING LOAD</span>
            <span className="text-sm font-bold font-mono text-sos-cyan">{totalRemainingHours}h</span>
          </div>
          <div className="bg-abyss/60 rounded-xl p-2.5 border border-surface-border">
            <span className="text-[10px] text-slate-400 font-mono block">STUDY DEBT</span>
            <span className={`text-sm font-bold font-mono ${studyDebtHours > 0 ? 'text-sos-crimson' : 'text-sos-mint'}`}>
              {studyDebtHours > 0 ? `+${studyDebtHours}h` : '0.0h'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Quick Status Matrix */}
      <div className="glass-card rounded-2xl p-4 border border-surface-border space-y-2.5">
        <div className="text-[11px] font-mono font-bold tracking-wider text-slate-300 uppercase flex items-center justify-between">
          <span>Priority Triage</span>
          <span className="text-slate-500 font-normal">{activeTasks.length} Active</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-abyss/70 border border-sos-crimson/30">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-sos-crimson animate-ping" />
            <span>Critical Bottlenecks</span>
          </div>
          <span className="text-xs font-bold font-mono text-sos-crimson bg-sos-crimson/10 px-2 py-0.5 rounded">
            {criticalCount}
          </span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-abyss/70 border border-sos-amber/30">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-sos-amber" />
            <span>Moderate Warnings</span>
          </div>
          <span className="text-xs font-bold font-mono text-sos-amber bg-sos-amber/10 px-2 py-0.5 rounded">
            {warningCount}
          </span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-abyss/70 border border-sos-mint/30">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-sos-mint" />
            <span>Completed Units</span>
          </div>
          <span className="text-xs font-bold font-mono text-sos-mint bg-sos-mint/10 px-2 py-0.5 rounded">
            {completedTasks.length}
          </span>
        </div>
      </div>

      {/* 3. Pomodoro Focus Module */}
      <PomodoroWidget 
        onLogSession={onLogFocusTime}
        activeTaskTitle={activeTask?.title}
      />
    </div>
  );
};
