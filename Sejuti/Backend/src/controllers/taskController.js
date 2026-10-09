import { Store } from '../services/store.js';
import { calculateTaskScore, rankTasks } from '../services/priorityEngine.js';

// @desc    Get all tasks for current user with live priority scores
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const userCapacity = req.user.dailyCapacityHours || 4;

    const rawTasks = await Store.getTasksByUserId(userId);
    const rankedTasks = rankTasks(rawTasks, userCapacity);

    // Summary metadata
    const activeTasks = rankedTasks.filter(t => t.status !== 'completed');
    const criticalCount = activeTasks.filter(t => t.urgencyLevel === 'critical').length;
    const warningCount = activeTasks.filter(t => t.urgencyLevel === 'warning').length;
    const totalRemainingHours = activeTasks.reduce((sum, t) => sum + (t.remainingHours || 0), 0);

    res.json({
      success: true,
      count: rankedTasks.length,
      criticalCount,
      warningCount,
      totalRemainingHours: Number(totalRemainingHours.toFixed(1)),
      tasks: rankedTasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const userCapacity = req.user.dailyCapacityHours || 4;

    const {
      title,
      course,
      type,
      deadline,
      estimatedHours,
      weightage,
      difficulty,
      subtasks
    } = req.body;

    if (!title || !course || !deadline) {
      return res.status(400).json({ success: false, message: 'Please provide title, course, and deadline' });
    }

    const taskData = {
      userId,
      title: title.trim(),
      course: course.trim().toUpperCase(),
      type: type || 'assignment',
      deadline: new Date(deadline),
      estimatedHours: Number(estimatedHours) || 3,
      hoursCompleted: 0,
      weightage: Number(weightage) || 5,
      difficulty: Number(difficulty) || 3,
      status: 'pending',
      subtasks: Array.isArray(subtasks) ? subtasks : []
    };

    const scoreData = calculateTaskScore(taskData, userCapacity);
    taskData.priorityScore = scoreData.priorityScore;

    const created = await Store.createTask(taskData);

    res.status(201).json({
      success: true,
      task: {
        ...created,
        ...scoreData
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const userCapacity = req.user.dailyCapacityHours || 4;

    const task = await Store.getTaskById(req.params.id, userId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const scoreData = calculateTaskScore(task, userCapacity);

    res.json({
      success: true,
      task: {
        ...(task.toObject ? task.toObject() : task),
        ...scoreData
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log progress (time spent or subtask toggle)
// @route   PATCH /api/tasks/:id/progress
// @access  Private
export const updateTaskProgress = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const userCapacity = req.user.dailyCapacityHours || 4;
    const { id } = req.params;
    const { logHours, hoursCompleted, subtaskId, isDone, status, subtasks } = req.body;

    const task = await Store.getTaskById(id, userId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const updates = {};

    // 1. Update hours completed
    if (logHours !== undefined && logHours > 0) {
      const currentHours = task.hoursCompleted || 0;
      updates.hoursCompleted = Math.min(task.estimatedHours, currentHours + Number(logHours));
    } else if (hoursCompleted !== undefined) {
      updates.hoursCompleted = Math.max(0, Number(hoursCompleted));
    }

    // 2. Subtask updates
    if (subtasks && Array.isArray(subtasks)) {
      updates.subtasks = subtasks;
    } else if (subtaskId !== undefined && isDone !== undefined) {
      const currentSubtasks = [...(task.subtasks || [])];
      const index = currentSubtasks.findIndex(s => String(s._id || s.id) === String(subtaskId));
      if (index >= 0) {
        currentSubtasks[index].isDone = Boolean(isDone);
        updates.subtasks = currentSubtasks;
      }
    }

    // 3. Status updates or auto-completion
    if (status) {
      updates.status = status;
    } else {
      const newHours = updates.hoursCompleted !== undefined ? updates.hoursCompleted : task.hoursCompleted;
      if (newHours >= task.estimatedHours) {
        updates.status = 'completed';
      } else if (newHours > 0) {
        updates.status = 'in-progress';
      }
    }

    // Recalculate score
    const merged = { ...(task.toObject ? task.toObject() : task), ...updates };
    const scoreData = calculateTaskScore(merged, userCapacity);
    updates.priorityScore = scoreData.priorityScore;

    const updatedTask = await Store.updateTask(id, userId, updates);

    res.json({
      success: true,
      task: {
        ...(updatedTask.toObject ? updatedTask.toObject() : updatedTask),
        ...scoreData
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const userCapacity = req.user.dailyCapacityHours || 4;
    const { id } = req.params;

    const task = await Store.getTaskById(id, userId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const {
      title,
      course,
      type,
      deadline,
      estimatedHours,
      weightage,
      difficulty,
      status,
      subtasks
    } = req.body;

    const updates = {};
    if (title) updates.title = title.trim();
    if (course) updates.course = course.trim().toUpperCase();
    if (type) updates.type = type;
    if (deadline) updates.deadline = new Date(deadline);
    if (estimatedHours !== undefined) updates.estimatedHours = Number(estimatedHours);
    if (weightage !== undefined) updates.weightage = Number(weightage);
    if (difficulty !== undefined) updates.difficulty = Number(difficulty);
    if (status) updates.status = status;
    if (subtasks) updates.subtasks = subtasks;

    const merged = { ...(task.toObject ? task.toObject() : task), ...updates };
    const scoreData = calculateTaskScore(merged, userCapacity);
    updates.priorityScore = scoreData.priorityScore;

    const updated = await Store.updateTask(id, userId, updates);

    res.json({
      success: true,
      task: {
        ...(updated.toObject ? updated.toObject() : updated),
        ...scoreData
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const deleted = await Store.deleteTask(id, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({
      success: true,
      message: 'Task successfully removed'
    });
  } catch (error) {
    next(error);
  }
};
