import User from '../models/User.js';
import Task from '../models/Task.js';
import Schedule from '../models/Schedule.js';
import { getDBStatus } from '../config/db.js';
import bcrypt from 'bcryptjs';

// In-Memory Storage collections for resilient offline mode
let memoryUsers = [];
let memoryTasks = [];
let memorySchedules = [];

export const Store = {
  // Users
  async findUserByEmail(email) {
    const { useMemoryFallback } = getDBStatus();
    if (!useMemoryFallback) {
      try {
        return await User.findOne({ email: email.toLowerCase() });
      } catch (err) {
        // Fallback if Mongo disconnects
      }
    }
    return memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id) {
    const { useMemoryFallback } = getDBStatus();
    if (!useMemoryFallback) {
      try {
        return await User.findById(id).select('-password');
      } catch (err) {}
    }
    const user = memoryUsers.find(u => String(u._id) === String(id));
    if (!user) return null;
    const { password, ...rest } = user;
    return rest;
  },

  async createUser({ name, email, password, dailyCapacityHours = 4, peakHours = 'night' }) {
    const { useMemoryFallback } = getDBStatus();
    if (!useMemoryFallback) {
      try {
        const user = await User.create({ name, email, password, dailyCapacityHours, peakHours });
        return user;
      } catch (err) {
        if (!err.message.includes('duplicate key')) {
          // fallback
        } else {
          throw err;
        }
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = {
      _id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      dailyCapacityHours: dailyCapacityHours || 4,
      peakHours: peakHours || 'night',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryUsers.push(newUser);
    return newUser;
  },

  async updateUser(id, updates) {
    const { useMemoryFallback } = getDBStatus();
    if (!useMemoryFallback) {
      try {
        return await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
      } catch (err) {}
    }
    const index = memoryUsers.findIndex(u => String(u._id) === String(id));
    if (index === -1) return null;
    memoryUsers[index] = { ...memoryUsers[index], ...updates, updatedAt: new Date() };
    const { password, ...rest } = memoryUsers[index];
    return rest;
  },

  // Tasks
  async getTasksByUserId(userId) {
    const { useMemoryFallback } = getDBStatus();
    if (!useMemoryFallback) {
      try {
        return await Task.find({ userId }).sort({ createdAt: -1 });
      } catch (err) {}
    }
    return memoryTasks.filter(t => String(t.userId) === String(userId));
  },

  async getTaskById(taskId, userId) {
    const { useMemoryFallback } = getDBStatus();
    if (!useMemoryFallback) {
      try {
        return await Task.findOne({ _id: taskId, userId });
      } catch (err) {}
    }
    return memoryTasks.find(t => String(t._id) === String(taskId) && String(t.userId) === String(userId)) || null;
  },

  async createTask(taskData) {
    const { useMemoryFallback } = getDBStatus();
    if (!useMemoryFallback) {
      try {
        return await Task.create(taskData);
      } catch (err) {}
    }
    const newTask = {
      _id: 'tsk_' + Math.random().toString(36).substr(2, 9),
      ...taskData,
      hoursCompleted: taskData.hoursCompleted || 0,
      subtasks: taskData.subtasks || [],
      status: taskData.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryTasks.push(newTask);
    return newTask;
  },

  async updateTask(taskId, userId, updates) {
    const { useMemoryFallback } = getDBStatus();
    if (!useMemoryFallback) {
      try {
        return await Task.findOneAndUpdate({ _id: taskId, userId }, updates, { new: true });
      } catch (err) {}
    }
    const index = memoryTasks.findIndex(t => String(t._id) === String(taskId) && String(t.userId) === String(userId));
    if (index === -1) return null;
    memoryTasks[index] = { ...memoryTasks[index], ...updates, updatedAt: new Date() };
    return memoryTasks[index];
  },

  async deleteTask(taskId, userId) {
    const { useMemoryFallback } = getDBStatus();
    if (!useMemoryFallback) {
      try {
        return await Task.findOneAndDelete({ _id: taskId, userId });
      } catch (err) {}
    }
    const index = memoryTasks.findIndex(t => String(t._id) === String(taskId) && String(t.userId) === String(userId));
    if (index === -1) return null;
    const removed = memoryTasks.splice(index, 1);
    return removed[0];
  },

  async clearUserTasks(userId) {
    const { useMemoryFallback } = getDBStatus();
    if (!useMemoryFallback) {
      try {
        await Task.deleteMany({ userId });
      } catch (err) {}
    }
    memoryTasks = memoryTasks.filter(t => String(t.userId) !== String(userId));
  },

  // Schedules
  async saveSchedule(userId, scheduleData) {
    const { useMemoryFallback } = getDBStatus();
    if (!useMemoryFallback) {
      try {
        return await Schedule.findOneAndUpdate(
          { userId },
          { ...scheduleData, userId, generatedAt: new Date() },
          { upsert: true, new: true }
        );
      } catch (err) {}
    }
    const index = memorySchedules.findIndex(s => String(s.userId) === String(userId));
    const record = {
      _id: 'sch_' + Math.random().toString(36).substr(2, 9),
      userId,
      ...scheduleData,
      generatedAt: new Date()
    };
    if (index >= 0) {
      memorySchedules[index] = record;
    } else {
      memorySchedules.push(record);
    }
    return record;
  },

  async getScheduleByUserId(userId) {
    const { useMemoryFallback } = getDBStatus();
    if (!useMemoryFallback) {
      try {
        return await Schedule.findOne({ userId });
      } catch (err) {}
    }
    return memorySchedules.find(s => String(s.userId) === String(userId)) || null;
  }
};
