import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { 
  CheckSquare, 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  Layers, 
  Zap, 
  Trash2, 
  Edit3, 
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { AddTaskModal } from '../components/AddTaskModal';

export const TasksPage = () => {
  const { tasks, isLoading, createTask, updateTask, deleteTask, updateProgress } = useTasks();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('score'); // 'score', 'deadline', 'weightage', 'difficulty'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.course.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || task.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'score') return (b.priorityScore || 0) - (a.priorityScore || 0);
    if (sortBy === 'deadline') return new Date(a.deadline) - new Date(b.deadline);
    if (sortBy === 'weightage') return (b.weightage || 0) - (a.weightage || 0);
    if (sortBy === 'difficulty') return (b.difficulty || 0) - (a.difficulty || 0);
    return 0;
  });

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsAddModalOpen(true);
  };

  const handleSave = async (data) => {
    if (editingTask) {
      await updateTask({ id: editingTask._id || editingTask.id, data });
    } else {
      await createTask(data);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-surface-border">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-sos-violet/20 border border-sos-violet/40 text-sos-violet shadow-glow-violet">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold font-mono tracking-wider text-white uppercase">
              Academic Assessment Inventory
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live priority-scored task registry with checkpoint management.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingTask(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sos-crimson to-rose-600 hover:from-rose-500 hover:to-sos-crimson text-white font-mono font-bold text-xs uppercase tracking-wider shadow-glow-crimson transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ingest Deadline</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-surface/70 p-4 rounded-2xl border border-surface-border glass-panel">
        
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search course code or assessment title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl glass-input text-xs font-mono"
          />
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono bg-abyss cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="assignment">Assignments</option>
            <option value="exam">Major Exams</option>
            <option value="project">Course Projects</option>
            <option value="quiz">Quizzes</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono bg-abyss cursor-pointer"
          >
            <option value="score">Sort: Priority Score (Desc)</option>
            <option value="deadline">Sort: Deadline (Earliest)</option>
            <option value="weightage">Sort: Weightage (Highest)</option>
            <option value="difficulty">Sort: Difficulty (Hardest)</option>
          </select>
        </div>
      </div>

      {/* Tasks Table / Cards */}
      <div className="glass-card rounded-2xl border border-surface-border overflow-hidden shadow-cyber-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-surface border-b border-surface-border text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Priority Score</th>
                <th className="py-3.5 px-4">Course & Title</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Deadline Cutoff</th>
                <th className="py-3.5 px-4">Progress / Est</th>
                <th className="py-3.5 px-4">Weight / Diff</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              {filteredTasks.map((task) => {
                const taskId = task._id || task.id;
                const isCritical = task.urgencyLevel === 'critical';
                const progress = task.estimatedHours > 0 ? Math.round((task.hoursCompleted / task.estimatedHours) * 100) : 0;

                return (
                  <tr key={taskId} className="hover:bg-surface-hover/50 transition-colors">
                    
                    {/* Priority Score */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${
                        isCritical
                          ? 'bg-sos-crimson/20 text-sos-crimson border-sos-crimson/50 shadow-glow-crimson'
                          : task.urgencyLevel === 'warning'
                          ? 'bg-sos-amber/20 text-sos-amber border-sos-amber/50'
                          : 'bg-sos-cyan/15 text-sos-cyan border-sos-cyan/40'
                      }`}>
                        <Zap className="w-3 h-3" />
                        <span>{task.priorityScore}</span>
                      </span>
                    </td>

                    {/* Course & Title */}
                    <td className="py-3.5 px-4">
                      <div className="text-white font-bold font-sans text-sm">{task.title}</div>
                      <div className="text-slate-400 text-[11px] font-mono mt-0.5">{task.course}</div>
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded uppercase font-bold text-[10px] bg-abyss border border-surface-border text-slate-300">
                        {task.type}
                      </span>
                    </td>

                    {/* Deadline */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-slate-200">{format(new Date(task.deadline), 'MMM dd, HH:mm')}</div>
                      <div className={`text-[10px] ${isCritical ? 'text-sos-crimson font-bold' : 'text-slate-500'}`}>
                        {formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}
                      </div>
                    </td>

                    {/* Progress */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-abyss rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${task.status === 'completed' ? 'bg-sos-mint' : 'bg-sos-cyan'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-slate-300">{task.hoursCompleted}h / {task.estimatedHours}h</span>
                      </div>
                    </td>

                    {/* Weight & Difficulty */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                      W:{task.weightage}/10 • D:{task.difficulty}/5
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(task)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${task.title}"?`)) {
                              deleteTask(taskId);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sos-crimson hover:bg-sos-crimson/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSave}
        editingTask={editingTask}
      />
    </div>
  );
};
