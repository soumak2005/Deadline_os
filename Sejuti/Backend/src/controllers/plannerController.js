import { Store } from '../services/store.js';
import { generateSchedule, rebalanceSchedule } from '../services/scheduler.js';

// @desc    Generate full 7-day timetable from active tasks
// @route   GET /api/planner/generate
// @access  Private
export const getGeneratedSchedule = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = req.user;

    const tasks = await Store.getTasksByUserId(userId);
    const schedule = generateSchedule(tasks, user, 7);

    // Save/cache schedule
    await Store.saveSchedule(userId, schedule);

    res.json({
      success: true,
      schedule
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rebalance and compact timetable
// @route   POST /api/planner/rebalance
// @access  Private
export const rebalanceTimetable = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = req.user;
    const { missedSlotIds } = req.body;

    const tasks = await Store.getTasksByUserId(userId);
    const newSchedule = rebalanceSchedule(tasks, user, missedSlotIds || []);

    await Store.saveSchedule(userId, newSchedule);

    res.json({
      success: true,
      message: 'Timetable dynamically rebalanced and optimized',
      schedule: newSchedule
    });
  } catch (error) {
    next(error);
  }
};
