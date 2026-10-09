import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Flame, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PomodoroWidget = ({ onLogSession, activeTaskTitle }) => {
  const [mode, setMode] = useState('focus'); // 'focus' (25m) or 'break' (5m)
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (mode === 'focus') {
        confetti({ particleCount: 50, spread: 60 });
        if (onLogSession) {
          onLogSession(0.5); // log 30 mins
        }
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('focus');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, onLogSession]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalTime = mode === 'focus' ? 25 * 60 : 5 * 60;
  const progressPercent = Math.round(((totalTime - timeLeft) / totalTime) * 100);

  return (
    <div className="glass-card rounded-2xl p-4 border border-surface-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-sos-cyan animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
            Focus Reactor
          </span>
        </div>
        <div className="flex bg-abyss rounded-lg p-0.5 border border-surface-border text-[10px] font-mono">
          <button
            onClick={() => switchMode('focus')}
            className={`px-2 py-0.5 rounded ${mode === 'focus' ? 'bg-sos-cyan/20 text-sos-cyan font-bold' : 'text-slate-400'}`}
          >
            25m
          </button>
          <button
            onClick={() => switchMode('break')}
            className={`px-2 py-0.5 rounded ${mode === 'break' ? 'bg-sos-mint/20 text-sos-mint font-bold' : 'text-slate-400'}`}
          >
            5m
          </button>
        </div>
      </div>

      {/* Target Task info if available */}
      {activeTaskTitle && (
        <div className="mb-2 px-2.5 py-1 rounded-md bg-abyss/60 border border-surface-border text-[11px] text-slate-300 truncate font-mono">
          🎯 <span className="text-sos-cyan">{activeTaskTitle}</span>
        </div>
      )}

      {/* Dial & Time Display */}
      <div className="flex items-center justify-between bg-abyss/80 rounded-xl p-3 border border-surface-border">
        <div>
          <div className="text-2xl font-black font-mono tracking-widest text-slate-100">
            {formattedTime}
          </div>
          <div className="text-[10px] font-mono text-slate-400 uppercase">
            {mode === 'focus' ? 'Focus Sprint' : 'Recovery Window'} ({progressPercent}%)
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTimer}
            className={`p-2 rounded-xl text-white transition-all cursor-pointer ${
              isRunning 
                ? 'bg-sos-amber hover:bg-amber-600 text-slate-900 shadow-glow-amber' 
                : 'bg-sos-cyan hover:bg-cyan-400 text-slate-900 shadow-glow-cyan'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4 font-bold" /> : <Play className="w-4 h-4 font-bold fill-current" />}
          </button>
          <button
            onClick={resetTimer}
            className="p-2 rounded-xl bg-surface hover:bg-surface-hover text-slate-400 hover:text-white border border-surface-border transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="mt-3 w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${mode === 'focus' ? 'bg-gradient-to-r from-sos-cyan to-sos-violet' : 'bg-sos-mint'}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
