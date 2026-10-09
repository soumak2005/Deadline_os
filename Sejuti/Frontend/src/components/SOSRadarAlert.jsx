import React from 'react';
import { AlertTriangle, Zap, RefreshCw, Radio, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SOSRadarAlert = ({ 
  tasks = [], 
  dailyCapacity = 4, 
  deficitHours = 0,
  bottleneckDetected = false,
  onRebalance,
  isRebalancing = false
}) => {
  // Find critical tasks with imminent deadlines
  const criticalTasks = tasks.filter(t => t.status !== 'completed' && t.urgencyLevel === 'critical');
  const totalRemainingCriticalHours = criticalTasks.reduce((sum, t) => sum + (t.remainingHours || 0), 0);
  
  const isEmergency = bottleneckDetected || deficitHours > 0 || criticalTasks.length > 0;

  const handleReshuffleClick = async () => {
    if (onRebalance) {
      await onRebalance();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.3 },
        colors: ['#FF3B5C', '#00F0FF', '#6366F1']
      });
    }
  };

  if (!isEmergency) {
    return (
      <div className="relative overflow-hidden rounded-2xl glass-card border border-sos-mint/30 bg-gradient-to-r from-sos-mint/10 via-surface to-surface p-4 sm:p-5 shadow-glow-mint transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-sos-mint/20 border border-sos-mint/50 text-sos-mint shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black font-mono tracking-wider text-slate-100 uppercase">
                  RADAR STATUS: <span className="text-sos-mint">OPTIMAL FLIGHT PATH</span>
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sos-mint/20 text-sos-mint border border-sos-mint/40">
                  DEFICIT: 0.0h
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                All academic deadlines are within study capacity buffers. Keep standard momentum.
              </p>
            </div>
          </div>
          <button
            onClick={handleReshuffleClick}
            disabled={isRebalancing}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-surface-hover hover:bg-surface border border-surface-border text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRebalancing ? 'animate-spin text-sos-cyan' : ''}`} />
            <span>Recalibrate</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-sos-crimson bg-gradient-to-r from-sos-crimson/20 via-surface-card to-surface-card p-4 sm:p-5 shadow-glow-crimson animate-pulse-glow transition-all">
      {/* Background Radar Line & Glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-sos-crimson/15 blur-3xl pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        
        {/* Left: Emergency Status Info */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="relative flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-sos-crimson/25 border border-sos-crimson text-sos-crimson shadow-[0_0_30px_rgba(255,59,92,0.6)]">
            <ShieldAlert className="w-7 h-7 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-sos-crimson rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-black uppercase bg-sos-crimson text-white tracking-widest">
                <AlertTriangle className="w-3.5 h-3.5" />
                ACADEMIC EMERGENCY DETECTED
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-black/40 border border-sos-crimson/50 text-sos-crimson">
                STUDY DEFICIT: +{deficitHours > 0 ? deficitHours : (totalRemainingCriticalHours - dailyCapacity).toFixed(1)}h OVERLOAD
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 mt-1.5 font-medium leading-relaxed">
              Remaining workload exceeds available study capacity before hard cutoff. <span className="text-sos-crimson font-bold">{criticalTasks.length} critical deadline(s)</span> require immediate timeline compression!
            </p>
          </div>
        </div>

        {/* Right: Reshuffle Trigger Button */}
        <div className="flex items-center gap-3 self-end lg:self-center flex-shrink-0">
          <button
            onClick={handleReshuffleClick}
            disabled={isRebalancing}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sos-crimson to-rose-600 hover:from-rose-500 hover:to-sos-crimson text-white text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_25px_rgba(255,59,92,0.5)] active:scale-95 transition-all cursor-pointer"
          >
            <Zap className={`w-4 h-4 ${isRebalancing ? 'animate-spin text-sos-cyan' : 'animate-pulse text-amber-300'}`} />
            <span>{isRebalancing ? 'Computing Optimal Slots...' : 'AUTO-RESHUFFLE TIMETABLE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
