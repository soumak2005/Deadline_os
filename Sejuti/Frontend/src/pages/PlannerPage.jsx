import React, { useState } from 'react';
import { usePlanner } from '../hooks/usePlanner';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import { 
  CalendarDays, 
  RefreshCw, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';
import confetti from 'canvas-confetti';

export const PlannerPage = () => {
  const { user } = useAuth();
  const { schedule, blocks, deficitHours, bottleneckDetected, rebalance, isRebalancing, isLoading } = usePlanner();
  const { tasks, updateProgress } = useTasks();
  const [selectedBlock, setSelectedBlock] = useState(null);

  const now = new Date();
  const daysList = Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(now, i);
    return {
      dateStr: format(d, 'yyyy-MM-dd'),
      dayName: format(d, 'EEE'),
      dayNum: format(d, 'dd MMM'),
      isToday: i === 0
    };
  });

  // Hours range: 08:00 to 23:00
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  const handleRebalance = async () => {
    await rebalance({});
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.4 },
      colors: ['#00F0FF', '#6366F1', '#10B981']
    });
  };

  const handleMarkBlockCompleted = async (block) => {
    if (block.taskId) {
      await updateProgress({
        id: block.taskId,
        data: { logHours: block.duration }
      });
      confetti({ particleCount: 30, spread: 50 });
      setSelectedBlock(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner: Timetable Engine Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-surface-border">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-sos-cyan/20 border border-sos-cyan/40 text-sos-cyan shadow-glow-cyan">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-mono tracking-wider text-white uppercase">
                Intelligent 7-Day Bin-Packing Timetable
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sos-cyan/10 text-sos-cyan border border-sos-cyan/30">
                CAP: {user?.dailyCapacityHours || 4}h/DAY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated focus allocation respecting 12-hour pre-deadline safety buffers & peak circadian energy.
            </p>
          </div>
        </div>

        {/* Rebalance Timetable Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRebalance}
            disabled={isRebalancing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sos-cyan to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider shadow-glow-cyan transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRebalancing ? 'animate-spin' : ''}`} />
            <span>{isRebalancing ? 'Optimizing Bins...' : 'REBALANCE TIMETABLE'}</span>
          </button>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-abyss/70 border border-surface-border text-xs font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-gradient-to-r from-sos-cyan to-sos-violet border border-sos-cyan/50" />
            <span className="text-slate-300">Focus Blocks</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded pattern-buffer border border-sos-mint/50" />
            <span className="text-slate-300">Safety Buffer Slots (12h Pre-Cutoff)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-sos-crimson shadow-glow-crimson" />
            <span className="text-slate-300">Hard Cutoff Deadlines</span>
          </div>
        </div>

        {bottleneckDetected && (
          <div className="flex items-center gap-1.5 text-sos-crimson font-bold text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Deficit: {deficitHours}h unscheduled load</span>
          </div>
        )}
      </div>

      {/* 7-DAY INTERACTIVE TIMETABLE GRID (08:00 to 23:00) */}
      <div className="glass-card rounded-2xl border border-surface-border overflow-x-auto shadow-cyber-card">
        <div className="min-w-[840px]">
          
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-surface-border bg-surface/90 sticky top-0 z-20">
            <div className="p-3 text-center text-xs font-mono font-bold text-slate-500 border-r border-surface-border">
              TIME (UTC)
            </div>
            {daysList.map((day) => (
              <div
                key={day.dateStr}
                className={`p-3 text-center border-r border-surface-border last:border-r-0 ${
                  day.isToday ? 'bg-sos-cyan/10 text-sos-cyan border-b-2 border-b-sos-cyan' : 'text-slate-300'
                }`}
              >
                <div className="text-xs font-mono font-black uppercase">{day.dayName}</div>
                <div className="text-[11px] font-mono text-slate-400">{day.dayNum}</div>
              </div>
            ))}
          </div>

          {/* Time Slot Rows (08:00 to 23:00) */}
          <div className="divide-y divide-surface-border/50">
            {timeSlots.map((timeStr) => {
              const currentHourNum = parseInt(timeStr.split(':')[0], 10);

              return (
                <div key={timeStr} className="grid grid-cols-8 min-h-[64px] transition-colors hover:bg-surface-hover/20">
                  
                  {/* Time Gutter */}
                  <div className="p-2 text-center text-xs font-mono text-slate-500 border-r border-surface-border bg-abyss/40 flex items-center justify-center">
                    {timeStr}
                  </div>

                  {/* Day Columns */}
                  {daysList.map((day) => {
                    // Find blocks scheduled on this day near this start hour
                    const cellBlocks = blocks.filter(b => {
                      if (b.date !== day.dateStr) return false;
                      const blockHour = parseInt(b.startTime?.split(':')[0] || '0', 10);
                      return blockHour === currentHourNum;
                    });

                    // Check for hard deadline markers on this day & time
                    const dayDeadlines = tasks.filter(t => {
                      const d = new Date(t.deadline);
                      const tDateStr = format(d, 'yyyy-MM-dd');
                      const tHour = d.getHours();
                      return tDateStr === day.dateStr && tHour === currentHourNum && t.status !== 'completed';
                    });

                    return (
                      <div
                        key={`${day.dateStr}-${timeStr}`}
                        className="p-1 border-r border-surface-border/40 last:border-r-0 relative min-h-[64px] flex flex-col gap-1 justify-center"
                      >
                        {/* Deadline Marker */}
                        {dayDeadlines.map((dl) => (
                          <div
                            key={dl._id || dl.id}
                            className="p-1.5 rounded-lg bg-sos-crimson text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-glow-crimson flex items-center gap-1 animate-pulse"
                            title={`HARD CUTOFF: ${dl.title}`}
                          >
                            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">CUTOFF: {dl.course}</span>
                          </div>
                        ))}

                        {/* Scheduled Study / Buffer Block */}
                        {cellBlocks.map((block, bIdx) => {
                          const isBuffer = block.isBuffer;
                          const isCritical = block.urgencyLevel === 'critical';

                          return (
                            <div
                              key={bIdx}
                              onClick={() => setSelectedBlock(block)}
                              className={`p-2 rounded-xl text-xs font-mono transition-all cursor-pointer group select-none ${
                                isBuffer
                                  ? 'pattern-buffer text-emerald-300 hover:border-sos-mint shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]'
                                  : isCritical
                                  ? 'bg-gradient-to-br from-sos-crimson/90 to-rose-700 text-white shadow-glow-crimson border border-sos-crimson'
                                  : 'bg-gradient-to-br from-sos-cyan/20 to-sos-violet/30 border border-sos-cyan/40 text-white hover:border-sos-cyan shadow-[0_0_15px_-3px_rgba(0,240,255,0.25)]'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span className="text-[9px] font-black uppercase px-1 py-0.2 rounded bg-black/40 text-slate-200">
                                  {block.course || (isBuffer ? 'BUFFER' : 'STUDY')}
                                </span>
                                <span className="text-[9px] text-slate-300 font-bold">
                                  {block.duration}h
                                </span>
                              </div>
                              <div className="font-semibold text-[11px] truncate leading-tight">
                                {block.title}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Block Action Modal / Popover */}
      {selectedBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedBlock(null)} />
          <div className="relative w-full max-w-md bg-surface border border-surface-border-bright rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-sos-cyan/10 text-sos-cyan border border-sos-cyan/30">
                {selectedBlock.isBuffer ? 'Safety Buffer' : 'Scheduled Study Block'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {selectedBlock.date} @ {selectedBlock.startTime} ({selectedBlock.duration}h)
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">{selectedBlock.title}</h3>
              <p className="text-xs font-mono text-slate-400 mt-1">Course: {selectedBlock.course}</p>
            </div>

            <div className="pt-3 border-t border-surface-border flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedBlock(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-300 hover:bg-surface-hover cursor-pointer"
              >
                Dismiss
              </button>
              {!selectedBlock.isBuffer && (
                <button
                  onClick={() => handleMarkBlockCompleted(selectedBlock)}
                  className="px-4 py-2 rounded-xl bg-sos-mint hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold uppercase shadow-glow-mint cursor-pointer"
                >
                  Log Block ({selectedBlock.duration}h)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
