import React, { useState, useEffect } from 'react';
import { X, Flame, Sparkles, Plus, Trash2, Calendar, Clock, Sliders, Zap } from 'lucide-react';
import { usePriorityEngine } from '../hooks/usePriorityEngine';
import { format, addDays, addHours } from 'date-fns';

export const AddTaskModal = ({ isOpen, onClose, onSave, editingTask = null }) => {
  const defaultDeadline = format(addHours(new Date(), 24), "yyyy-MM-dd'T'HH:mm");

  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [type, setType] = useState('assignment');
  const [deadline, setDeadline] = useState(defaultDeadline);
  const [estimatedHours, setEstimatedHours] = useState(4);
  const [weightage, setWeightage] = useState(6);
  const [difficulty, setDifficulty] = useState(3);
  const [subtasks, setSubtasks] = useState([{ title: '', isDone: false }]);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setCourse(editingTask.course || '');
      setType(editingTask.type || 'assignment');
      setDeadline(
        editingTask.deadline
          ? format(new Date(editingTask.deadline), "yyyy-MM-dd'T'HH:mm")
          : defaultDeadline
      );
      setEstimatedHours(editingTask.estimatedHours || 4);
      setWeightage(editingTask.weightage || 6);
      setDifficulty(editingTask.difficulty || 3);
      setSubtasks(
        editingTask.subtasks && editingTask.subtasks.length > 0
          ? editingTask.subtasks
          : [{ title: '', isDone: false }]
      );
    } else {
      setTitle('');
      setCourse('');
      setType('assignment');
      setDeadline(defaultDeadline);
      setEstimatedHours(4);
      setWeightage(6);
      setDifficulty(3);
      setSubtasks([{ title: '', isDone: false }]);
    }
  }, [editingTask, isOpen]);

  // Live Priority Engine Score Preview
  const previewScore = usePriorityEngine({
    deadline,
    estimatedHours,
    hoursCompleted: editingTask?.hoursCompleted || 0,
    weightage,
    difficulty
  });

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, { title: '', isDone: false }]);
  };

  const handleSubtaskChange = (index, val) => {
    const next = [...subtasks];
    next[index].title = val;
    setSubtasks(next);
  };

  const handleRemoveSubtask = (index) => {
    const next = subtasks.filter((_, i) => i !== index);
    setSubtasks(next.length > 0 ? next : [{ title: '', isDone: false }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !course.trim() || !deadline) return;

    const payload = {
      title: title.trim(),
      course: course.trim().toUpperCase(),
      type,
      deadline: new Date(deadline).toISOString(),
      estimatedHours: Number(estimatedHours),
      weightage: Number(weightage),
      difficulty: Number(difficulty),
      subtasks: subtasks.filter(s => s.title && s.title.trim().length > 0)
    };

    await onSave(payload);
    onClose();
  };

  const getUrgencyBadgeStyle = (level) => {
    switch (level) {
      case 'critical':
        return 'bg-sos-crimson text-white shadow-glow-crimson border-sos-crimson';
      case 'warning':
        return 'bg-sos-amber text-slate-950 shadow-glow-amber border-sos-amber';
      case 'elevated':
        return 'bg-sos-cyan text-slate-950 shadow-glow-cyan border-sos-cyan';
      default:
        return 'bg-sos-mint text-slate-950 shadow-glow-mint border-sos-mint';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-surface border border-surface-border-bright rounded-3xl shadow-2xl overflow-hidden z-10 my-8">
        
        {/* Header with Live Score Chip */}
        <div className="p-6 border-b border-surface-border bg-gradient-to-r from-surface-card to-surface flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sos-crimson/20 border border-sos-crimson/40 flex items-center justify-center text-sos-crimson">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono text-white uppercase tracking-wider">
                {editingTask ? 'Modify Target Deadline' : 'Ingest Academic Deadline'}
              </h2>
              <p className="text-xs text-slate-400">Calculates live priority score & feeds scheduler</p>
            </div>
          </div>

          {/* Live Score Preview Chip */}
          <div className="flex items-center gap-2.5">
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Projected Score</span>
              <div className={`px-3 py-1 rounded-xl text-xs font-mono font-black border uppercase tracking-wider ${getUrgencyBadgeStyle(previewScore.urgencyLevel)}`}>
                ⚡ {previewScore.priorityScore} ({previewScore.urgencyLevel})
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Row 1: Title */}
          <div>
            <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1.5">
              Task / Exam Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Dynamic Programming & NP-Hard Assignment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          {/* Row 2: Course & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1.5">
                Course Code / Subject *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., CS301 ALGORITHMS"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1.5">
                Assessment Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm bg-abyss cursor-pointer"
              >
                <option value="assignment">Assignment / Lab</option>
                <option value="exam">Major Exam / Final</option>
                <option value="project">Course Project</option>
                <option value="quiz">Quiz / Assessment</option>
              </select>
            </div>
          </div>

          {/* Row 3: Deadline Date/Time Picker */}
          <div>
            <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1.5">
              Cutoff Deadline (Date & Time) *
            </label>
            <input
              type="datetime-local"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm font-mono cursor-pointer"
            />
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-1">
              <span>Remaining time until cutoff:</span>
              <span className="text-sos-cyan font-bold">{previewScore.hoursUntilDeadline} hours</span>
            </div>
          </div>

          {/* Row 4: Sliders Section */}
          <div className="bg-abyss/80 rounded-2xl p-4 border border-surface-border space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300 font-bold uppercase">
              <Sliders className="w-3.5 h-3.5 text-sos-cyan" />
              <span>Priority Engine Tuning Factors</span>
            </div>

            {/* Slider 1: Estimated Hours */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Estimated Effort Required:</span>
                <span className="text-sos-cyan font-bold">{estimatedHours} Hours</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="24"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full accent-sos-cyan cursor-pointer"
              />
            </div>

            {/* Slider 2: Weightage (1-10) */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Grade Weightage Impact (1-10):</span>
                <span className="text-sos-amber font-bold">{weightage} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={weightage}
                onChange={(e) => setWeightage(Number(e.target.value))}
                className="w-full accent-sos-amber cursor-pointer"
              />
            </div>

            {/* Slider 3: Difficulty (1-5) */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Cognitive Difficulty (1-5):</span>
                <span className="text-sos-crimson font-bold">{difficulty} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="w-full accent-sos-crimson cursor-pointer"
              />
            </div>
          </div>

          {/* Subtasks Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase font-bold text-slate-300">
                Checkpoints & Subtasks
              </label>
              <button
                type="button"
                onClick={handleAddSubtask}
                className="flex items-center gap-1 text-[11px] font-mono text-sos-cyan hover:text-cyan-300 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>

            <div className="space-y-2">
              {subtasks.map((sub, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500 w-5">{idx + 1}.</span>
                  <input
                    type="text"
                    placeholder={`e.g., Step ${idx + 1}: Implementation or review`}
                    value={sub.title}
                    onChange={(e) => handleSubtaskChange(idx, e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg glass-input text-xs"
                  />
                  {subtasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(idx)}
                      className="p-1.5 text-slate-500 hover:text-sos-crimson transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-surface-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-slate-300 text-xs font-mono transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sos-crimson to-rose-600 hover:from-rose-500 hover:to-sos-crimson text-white text-xs font-mono font-bold uppercase tracking-wider shadow-glow-crimson transition-all active:scale-95 cursor-pointer"
            >
              {editingTask ? 'Save Changes' : 'Confirm & Ingest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
