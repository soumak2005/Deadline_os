import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Flame, 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckSquare, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Zap
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import confetti from 'canvas-confetti';

export const BattlePlanQueue = ({
  tasks = [],
  onLogProgress,
  onToggleSubtask,
  onDeleteTask,
  onEditTask,
  onSelectActiveTask,
  activeTaskId
}) => {
  const [filterType, setFilterType] = useState('all'); // all, assignment, exam, project, quiz
  const [filterStatus, setFilterStatus] = useState('active'); // active, completed, all
  const [expandedCards, setExpandedCards] = useState({});

  const toggleExpand = (taskId) => {
    setExpandedCards(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleQuickLog30m = async (e, task) => {
    e.stopPropagation();
    if (onLogProgress) {
      await onLogProgress(task._id || task.id, { logHours: 0.5 });
      confetti({
        particleCount: 25,
        spread: 40,
        origin: { y: 0.7 }
      });
    }
  };

  const handleToggleSubtask = async (e, taskId, subtaskId, currentStatus) => {
    e.stopPropagation();
    if (onToggleSubtask) {
      await onToggleSubtask(taskId, subtaskId, !currentStatus);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filterType !== 'all' && task.type !== filterType) return false;
    if (filterStatus === 'active' && task.status === 'completed') return false;
    if (filterStatus === 'completed' && task.status !== 'completed') return false;
    return true;
  });

  const getUrgencyBadgeStyle = (level, score) => {
    switch (level) {
      case 'critical':
        return 'bg-sos-crimson/15 text-sos-crimson border-sos-crimson/40 shadow-glow-crimson';
      case 'warning':
        return 'bg-sos-amber/15 text-sos-amber border-sos-amber/40 shadow-glow-amber';
      case 'elevated':
        return 'bg-sos-cyan/15 text-sos-cyan border-sos-cyan/40 shadow-glow-cyan';
      default:
        return 'bg-sos-mint/15 text-sos-mint border-sos-mint/40';
    }
  };

  const getTypePillStyle = (type) => {
    switch (type) {
      case 'exam':
        return 'bg-rose-950/60 text-rose-300 border-rose-800/50';
      case 'project':
        return 'bg-indigo-950/60 text-indigo-300 border-indigo-800/50';
      case 'quiz':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/50';
      case 'assignment':
      default:
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-800/50';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface/60 p-3.5 rounded-2xl border border-surface-border glass-panel">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sos-crimson animate-pulse" />
            <h2 className="text-sm font-black font-mono tracking-wider text-slate-100 uppercase">
              Battle Plan Queue
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-card border border-surface-border text-slate-400">
              {filteredTasks.length} Ranked Units
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-mono">
          {['all', 'assignment', 'exam', 'project', 'quiz'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded-lg uppercase text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-sos-cyan text-slate-950 shadow-glow-cyan'
                  : 'text-slate-400 hover:text-slate-200 bg-abyss/60 border border-surface-border'
              }`}
            >
              {type}
            </button>
          ))}
          <div className="h-4 w-[1px] bg-surface-border mx-1" />
          <button
            onClick={() => setFilterStatus(filterStatus === 'active' ? 'completed' : 'active')}
            className="px-2.5 py-1 rounded-lg uppercase text-[10px] font-bold tracking-wider bg-abyss/60 text-slate-400 hover:text-white border border-surface-border cursor-pointer"
          >
            {filterStatus === 'active' ? 'Active' : 'Completed'}
          </button>
        </div>
      </div>

      {/* Task Queue Cards */}
      {filteredTasks.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-surface-border">
          <Sparkles className="w-10 h-10 text-sos-mint mx-auto mb-3 opacity-60 animate-bounce" />
          <h3 className="text-sm font-bold text-slate-200 font-mono uppercase">Zero Pending Tasks in Queue</h3>
          <p className="text-xs text-slate-400 mt-1">All target deadlines have been completed or filtered out.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task, index) => {
            const taskId = task._id || task.id;
            const isSelected = activeTaskId === taskId;
            const isExpanded = expandedCards[taskId] ?? (index === 0);
            const remaining = task.remainingHours || Math.max(0, task.estimatedHours - task.hoursCompleted);
            const progress = task.estimatedHours > 0 ? Math.min(100, Math.round((task.hoursCompleted / task.estimatedHours) * 100)) : 0;
            const subtasksDone = (task.subtasks || []).filter(s => s.isDone).length;
            const totalSubtasks = (task.subtasks || []).length;
            const isCritical = task.urgencyLevel === 'critical';

            return (
              <div
                key={taskId}
                onClick={() => onSelectActiveTask?.(task)}
                className={`relative rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-sos-cyan border-sos-cyan/60 bg-surface-card/95 shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                    : isCritical
                    ? 'border-sos-crimson/50 bg-gradient-to-r from-sos-crimson/10 via-surface-card to-surface-card hover:border-sos-crimson shadow-glow-crimson'
                    : 'border-surface-border bg-surface-card/75 hover:border-surface-border-bright hover:bg-surface-hover/80'
                }`}
              >
                {/* Left Priority Indicator Stripe */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    isCritical
                      ? 'bg-sos-crimson animate-pulse'
                      : task.urgencyLevel === 'warning'
                      ? 'bg-sos-amber'
                      : task.urgencyLevel === 'elevated'
                      ? 'bg-sos-cyan'
                      : 'bg-sos-mint'
                  }`}
                />

                <div className="p-4 sm:p-5 pl-5 sm:pl-6">
                  {/* Top Bar: Subject Pill, Type Pill, Urgency Score Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Course / Subject Pill */}
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-black uppercase tracking-wider bg-abyss border border-surface-border-bright text-slate-200">
                        {task.course || 'GENERAL'}
                      </span>

                      {/* Type Pill */}
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${getTypePillStyle(task.type)}`}>
                        {task.type}
                      </span>

                      {/* Weightage & Difficulty */}
                      <span className="text-[10px] font-mono text-slate-400 bg-abyss/60 px-2 py-0.5 rounded border border-surface-border">
                        W:{task.weightage}/10 • D:{task.difficulty}/5
                      </span>
                    </div>

                    {/* Urgency Score Badge (Score / 100) */}
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-mono font-bold ${getUrgencyBadgeStyle(task.urgencyLevel, task.priorityScore)}`}>
                        <Zap className="w-3.5 h-3.5" />
                        <span>SCORE {task.priorityScore}</span>
                      </div>
                    </div>
                  </div>

                  {/* Task Title & Deadline */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className={`text-base font-bold text-white tracking-tight leading-snug ${task.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-mono">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-sos-cyan" />
                          <span>Deadline: {format(new Date(task.deadline), 'MMM dd, HH:mm')}</span>
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className={`${isCritical ? 'text-sos-crimson font-bold' : 'text-slate-300'}`}>
                          ({formatDistanceToNow(new Date(task.deadline), { addSuffix: true })})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar & Hours */}
                  <div className="space-y-1.5 mb-3.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Progress: <strong className="text-slate-200">{task.hoursCompleted || 0}h</strong> / {task.estimatedHours}h</span>
                      <span className="text-sos-cyan font-bold">{remaining}h Remaining ({progress}%)</span>
                    </div>
                    <div className="w-full bg-abyss rounded-full h-2 overflow-hidden border border-surface-border">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          task.status === 'completed'
                            ? 'bg-sos-mint'
                            : isCritical
                            ? 'bg-gradient-to-r from-sos-crimson to-amber-500'
                            : 'bg-gradient-to-r from-sos-cyan to-sos-violet'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Subtasks Accordion Checklist */}
                  {totalSubtasks > 0 && (
                    <div className="mt-3 pt-3 border-t border-surface-border/60">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(taskId);
                        }}
                        className="flex items-center justify-between w-full text-xs font-mono text-slate-400 hover:text-slate-200 py-1"
                      >
                        <span className="flex items-center gap-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-sos-cyan" />
                          <span>Subtask Checkpoints ({subtasksDone}/{totalSubtasks})</span>
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 space-y-1.5 pl-2">
                          {task.subtasks.map((sub, sIdx) => {
                            const subId = sub._id || sub.id || sIdx;
                            return (
                              <div
                                key={subId}
                                onClick={(e) => handleToggleSubtask(e, taskId, subId, sub.isDone)}
                                className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-abyss/60 text-xs transition-all cursor-pointer group"
                              >
                                {sub.isDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-sos-mint flex-shrink-0" />
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-500 group-hover:text-sos-cyan flex-shrink-0" />
                                )}
                                <span className={`text-xs ${sub.isDone ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                                  {sub.title}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons Row */}
                  <div className="mt-4 pt-3 border-t border-surface-border flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {/* Log 30m Fast Action */}
                      <button
                        onClick={(e) => handleQuickLog30m(e, task)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sos-cyan/15 hover:bg-sos-cyan/25 border border-sos-cyan/40 text-sos-cyan text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-[0_0_15px_-3px_rgba(0,240,255,0.2)] active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Log 30m</span>
                      </button>

                      {/* Select as active Pomodoro target */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectActiveTask?.(task);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-sos-violet text-white border-sos-violet shadow-glow-violet'
                            : 'bg-surface hover:bg-surface-hover text-slate-300 border-surface-border'
                        }`}
                      >
                        {isSelected ? '🎯 Target Focus' : 'Set Focus'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Edit Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTask?.(task);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface transition-all cursor-pointer"
                        title="Edit Task"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Remove "${task.title}" from queue?`)) {
                            onDeleteTask?.(taskId);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sos-crimson hover:bg-sos-crimson/10 transition-all cursor-pointer"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
