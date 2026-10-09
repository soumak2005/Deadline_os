import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { usePlanner } from '../hooks/usePlanner';
import { useAuth } from '../context/AuthContext';
import { SOSRadarAlert } from '../components/SOSRadarAlert';
import { StudyBudgetGauge } from '../components/StudyBudgetGauge';
import { BattlePlanQueue } from '../components/BattlePlanQueue';
import { DeadlineHorizon } from '../components/DeadlineHorizon';
import { AddTaskModal } from '../components/AddTaskModal';
import { CapacitySettingsModal } from '../components/CapacitySettingsModal';
import { Loader2, Plus, Sparkles } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const {
    tasks,
    isLoading: isTasksLoading,
    updateProgress,
    updateTask,
    deleteTask,
    createTask
  } = useTasks();

  const {
    schedule,
    deficitHours,
    bottleneckDetected,
    rebalance,
    isRebalancing,
    isLoading: isPlannerLoading
  } = usePlanner();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeFocusTask, setActiveFocusTask] = useState(null);

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = async (taskData) => {
    if (editingTask) {
      await updateTask({ id: editingTask._id || editingTask.id, data: taskData });
    } else {
      await createTask(taskData);
    }
  };

  const handleToggleSubtask = async (taskId, subtaskId, isDone) => {
    await updateProgress({
      id: taskId,
      data: { subtaskId, isDone }
    });
  };

  const handleLogProgress = async (taskId, data) => {
    await updateProgress({ id: taskId, data });
  };

  const handleLogPomodoroFocus = async (hours) => {
    if (activeFocusTask) {
      await updateProgress({
        id: activeFocusTask._id || activeFocusTask.id,
        data: { logHours: hours }
      });
    } else if (tasks.length > 0) {
      // Log to highest priority active task
      const topTask = tasks.find(t => t.status !== 'completed');
      if (topTask) {
        await updateProgress({
          id: topTask._id || topTask.id,
          data: { logHours: hours }
        });
      }
    }
  };

  if (isTasksLoading || isPlannerLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="w-10 h-10 text-sos-cyan animate-spin" />
        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
          Booting Priority Scoring Engine & Allocating Schedule...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. TOP BANNER: SOS Radar Alert */}
      <SOSRadarAlert
        tasks={tasks}
        dailyCapacity={user?.dailyCapacityHours || 4}
        deficitHours={deficitHours}
        bottleneckDetected={bottleneckDetected}
        onRebalance={() => rebalance({})}
        isRebalancing={isRebalancing}
      />

      {/* 2. THREE-COLUMN COMMAND DASHBOARD LAYOUT (25% Left Rail | 50% Center Stream | 25% Right Rail) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Rail (25% / 3 cols): StudyBudgetGauge, Pomodoro, Status */}
        <div className="lg:col-span-3 space-y-4">
          <StudyBudgetGauge
            dailyCapacity={user?.dailyCapacityHours || 4}
            tasks={tasks}
            studyDebtHours={deficitHours}
            onLogFocusTime={handleLogPomodoroFocus}
            activeTask={activeFocusTask}
          />
        </div>

        {/* Center Stream (50% / 6 cols): BattlePlanQueue with Priority Cards */}
        <div className="lg:col-span-6 space-y-4">
          <BattlePlanQueue
            tasks={tasks}
            onLogProgress={handleLogProgress}
            onToggleSubtask={handleToggleSubtask}
            onDeleteTask={(id) => deleteTask(id)}
            onEditTask={handleEditTask}
            onSelectActiveTask={(task) => setActiveFocusTask(task)}
            activeTaskId={activeFocusTask?._id || activeFocusTask?.id}
          />
        </div>

        {/* Right Rail (25% / 3 cols): DeadlineHorizon with Chronological 48h Countdown Chips */}
        <div className="lg:col-span-3 space-y-4">
          <DeadlineHorizon
            tasks={tasks}
            onSelectTask={(task) => setActiveFocusTask(task)}
          />
        </div>

      </div>

      {/* Add / Edit Task Modal */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        editingTask={editingTask}
      />

      {/* Capacity Settings Modal */}
      <CapacitySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
