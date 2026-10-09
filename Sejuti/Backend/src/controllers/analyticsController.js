import { Store } from '../services/store.js';
import { rankTasks } from '../services/priorityEngine.js';
import { generateSchedule } from '../services/scheduler.js';

// @desc    Get comprehensive academic analytics and study debt metrics
// @route   GET /api/analytics
// @access  Private
export const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = req.user;
    const capacity = user.dailyCapacityHours || 4;

    const rawTasks = await Store.getTasksByUserId(userId);
    const rankedTasks = rankTasks(rawTasks, capacity);

    const activeTasks = rankedTasks.filter(t => t.status !== 'completed');
    const completedTasks = rankedTasks.filter(t => t.status === 'completed');

    const totalEstimated = rankedTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const totalCompleted = rankedTasks.reduce((sum, t) => sum + (t.hoursCompleted || 0), 0);
    const totalRemaining = activeTasks.reduce((sum, t) => sum + (t.remainingHours || 0), 0);

    // Schedule check for deficit hours
    const schedule = generateSchedule(rawTasks, user, 7);
    const studyDebtHours = schedule.deficitHours || 0;

    // Burnout Risk calculation: (Total active remaining hours / (7 days * daily capacity)) * 100
    const weeklyCapacity = capacity * 7;
    const workloadRatio = weeklyCapacity > 0 ? (totalRemaining / weeklyCapacity) : 0;
    let burnoutIndex = Math.min(100, Math.round(workloadRatio * 100));
    let burnoutLevel = 'Normal';
    if (burnoutIndex > 100 || studyDebtHours > 5) {
      burnoutLevel = 'CRITICAL OVERLOAD';
    } else if (burnoutIndex > 75) {
      burnoutLevel = 'Elevated Risk';
    } else if (burnoutIndex > 50) {
      burnoutLevel = 'Moderate Load';
    } else {
      burnoutLevel = 'Optimal Pace';
    }

    // Course distribution
    const courseMap = {};
    activeTasks.forEach(task => {
      const c = task.course || 'GENERAL';
      if (!courseMap[c]) {
        courseMap[c] = { course: c, hours: 0, count: 0, criticalCount: 0 };
      }
      courseMap[c].hours += task.remainingHours;
      courseMap[c].count += 1;
      if (task.urgencyLevel === 'critical') {
        courseMap[c].criticalCount += 1;
      }
    });

    const courseDistribution = Object.values(courseMap).map(c => ({
      ...c,
      hours: Number(c.hours.toFixed(1))
    }));

    // Urgency breakdown
    const urgencyCounts = {
      critical: activeTasks.filter(t => t.urgencyLevel === 'critical').length,
      warning: activeTasks.filter(t => t.urgencyLevel === 'warning').length,
      elevated: activeTasks.filter(t => t.urgencyLevel === 'elevated').length,
      safe: activeTasks.filter(t => t.urgencyLevel === 'safe').length
    };

    res.json({
      success: true,
      stats: {
        totalTasks: rankedTasks.length,
        activeTasks: activeTasks.length,
        completedTasks: completedTasks.length,
        completionRate: rankedTasks.length > 0 ? Math.round((completedTasks.length / rankedTasks.length) * 100) : 0,
        totalEstimatedHours: Number(totalEstimated.toFixed(1)),
        totalCompletedHours: Number(totalCompleted.toFixed(1)),
        totalRemainingHours: Number(totalRemaining.toFixed(1)),
        studyDebtHours: Number(studyDebtHours.toFixed(1)),
        bottleneckDetected: schedule.bottleneckDetected,
        dailyCapacity: capacity,
        burnoutIndex,
        burnoutLevel,
        urgencyCounts,
        courseDistribution
      }
    });
  } catch (error) {
    next(error);
  }
};
