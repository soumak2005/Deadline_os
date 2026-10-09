import React, { useState, useEffect } from 'react';
import { Compass, AlertCircle, Clock, Calendar, CheckCircle2, ChevronRight } from 'lucide-react';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';

export const DeadlineHorizon = ({ tasks = [], onSelectTask }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000); // refresh every 10s
    return () => clearInterval(timer);
  }, []);

  // Filter active tasks and sort strictly chronologically by deadline
  const upcomingTasks = tasks
    .filter(t => t.status !== 'completed')
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  const formatCountdown = (deadlineStr) => {
    const deadline = new Date(deadlineStr);
    const diffMins = differenceInMinutes(deadline, currentTime);
    
    if (diffMins <= 0) {
      return { text: 'PASSED CUTOFF', isPassed: true, isImminent: true };
    }

    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;

    if (hours < 24) {
      return {
        text: `Due in ${hours}h ${mins}m`,
        isPassed: false,
        isImminent: hours < 18,
        hours
      };
    }

    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return {
      text: `Due in ${days}d ${remHours}h`,
      isPassed: false,
      isImminent: false,
      hours
    };
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-surface-border space-y-4">
      
      {/* Radar Scope Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-sos-crimson animate-spin" style={{ animationDuration: '8s' }} />
          <h3 className="text-xs font-mono font-bold tracking-wider text-slate-100 uppercase">
            Deadline Horizon
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-abyss border border-surface-border text-sos-crimson font-bold">
          CHRONO RADAR
        </span>
      </div>

      {/* Mini Radar Scope Display */}
      <div className="relative w-full h-20 rounded-xl bg-abyss border border-surface-border overflow-hidden flex items-center justify-center">
        {/* Radar Concentric Circles */}
        <div className="absolute w-12 h-12 rounded-full border border-sos-crimson/20" />
        <div className="absolute w-28 h-28 rounded-full border border-sos-crimson/15" />
        <div className="absolute w-44 h-44 rounded-full border border-sos-crimson/10" />
        
        {/* Radar Crosshairs */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-[1px] bg-sos-crimson/10" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-[1px] bg-sos-crimson/10" />
        </div>

        {/* Sweep Line */}
        <div className="radar-sweep-line" />

        {/* Blips for imminent tasks */}
        <div className="relative z-10 flex items-center gap-2 text-[11px] font-mono font-bold text-slate-300">
          <span className="w-2 h-2 rounded-full bg-sos-crimson animate-ping" />
          <span>{upcomingTasks.length} TARGETS IN RANGE</span>
        </div>
      </div>

      {/* Chronological List of Deadlines */}
      <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
        {upcomingTasks.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 font-mono">
            No upcoming deadlines recorded.
          </div>
        ) : (
          upcomingTasks.map((task) => {
            const countdown = formatCountdown(task.deadline);
            const isCritical = countdown.isImminent || countdown.isPassed || task.urgencyLevel === 'critical';

            return (
              <div
                key={task._id || task.id}
                onClick={() => onSelectTask?.(task)}
                className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                  isCritical
                    ? 'bg-sos-crimson/10 border-sos-crimson/40 hover:border-sos-crimson'
                    : 'bg-abyss/60 border-surface-border hover:border-surface-border-bright hover:bg-surface-hover/50'
                }`}
              >
                {/* Course & Chip */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-300 bg-surface px-1.5 py-0.5 rounded border border-surface-border">
                    {task.course}
                  </span>
                  
                  {/* JetBrains Mono Timer Chip */}
                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                      countdown.isPassed
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : countdown.isImminent
                        ? 'bg-sos-crimson text-white shadow-glow-crimson'
                        : 'bg-abyss text-sos-cyan border border-sos-cyan/30'
                    }`}
                  >
                    {countdown.text}
                  </span>
                </div>

                {/* Task Title */}
                <h4 className="text-xs font-semibold text-white group-hover:text-sos-cyan transition-colors line-clamp-1">
                  {task.title}
                </h4>

                {/* Date and remaining load footer */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2 pt-2 border-t border-surface-border/50">
                  <span>{format(new Date(task.deadline), 'MMM dd, HH:mm')}</span>
                  <span className="text-slate-300 font-medium">
                    {task.remainingHours || (task.estimatedHours - task.hoursCompleted)}h left
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
