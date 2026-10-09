import { format, addDays, isBefore, isAfter, differenceInHours, parseISO } from 'date-fns';
import { rankTasks } from './priorityEngine.js';

/**
 * Intelligent Bin-Packing Scheduler for Academic Deadlines
 * 
 * @param {Array} tasks - List of active tasks
 * @param {Object} user - User object with dailyCapacityHours and peakHours
 * @param {Number} horizonDays - Schedule horizon (default 7 days)
 * @returns {Object} { blocks, deficitHours, bottleneckDetected, totalScheduledHours, summary }
 */
export const generateSchedule = (tasks, user, horizonDays = 7) => {
  const dailyCapacity = user?.dailyCapacityHours || 4;
  const peakHours = user?.peakHours || 'night';
  const now = new Date();

  // 1. Rank tasks by real-time priority score
  const ranked = rankTasks(tasks, dailyCapacity).filter(t => t.status !== 'completed' && t.remainingHours > 0);

  // Time slot windows based on peak preference
  const getSlotStartingHours = (pref) => {
    switch (pref) {
      case 'morning':
        return [8, 10, 14, 16];
      case 'afternoon':
        return [13, 15, 17, 19];
      case 'night':
      default:
        return [19, 21, 14, 16];
    }
  };

  const preferredStartHours = getSlotStartingHours(peakHours);

  // 2. Prepare 7-day calendar bins
  const dayBins = [];
  for (let i = 0; i < horizonDays; i++) {
    const targetDate = addDays(now, i);
    const dateStr = format(targetDate, 'yyyy-MM-dd');
    dayBins.push({
      dateStr,
      dateObj: targetDate,
      capacityLeft: dailyCapacity,
      blocks: []
    });
  }

  let totalDeficitHours = 0;
  let bottleneckDetected = false;

  // 3. For each ranked task, allocate effort into future days before deadline - buffer
  for (const task of ranked) {
    let remainingToSchedule = task.remainingHours;
    const taskDeadline = new Date(task.deadline);
    
    // 12-hour buffer rule before exams/assignments
    const cutoffTime = new Date(taskDeadline.getTime() - (12 * 60 * 60 * 1000));
    
    // Find allowable days where task can be scheduled prior to cutoff
    for (const bin of dayBins) {
      if (remainingToSchedule <= 0) break;
      
      // If the current bin date is after cutoff, we cannot pack anymore into this bin for this task
      if (isAfter(bin.dateObj, cutoffTime) && format(bin.dateObj, 'yyyy-MM-dd') !== format(cutoffTime, 'yyyy-MM-dd')) {
        continue;
      }

      if (bin.capacityLeft > 0) {
        // Chunk sizes: 1h to 2h focus blocks
        const allocatable = Math.min(bin.capacityLeft, remainingToSchedule, 2);
        
        if (allocatable > 0) {
          const slotIndex = bin.blocks.length % preferredStartHours.length;
          const startHour = preferredStartHours[slotIndex];
          const startTimeStr = `${String(startHour).padStart(2, '0')}:00`;

          bin.blocks.push({
            date: bin.dateStr,
            startTime: startTimeStr,
            duration: allocatable,
            taskId: task._id || task.id,
            title: task.title,
            course: task.course,
            type: task.type,
            isBuffer: false,
            urgencyLevel: task.urgencyLevel,
            priorityScore: task.priorityScore
          });

          bin.capacityLeft -= allocatable;
          remainingToSchedule -= allocatable;
        }
      }
    }

    // If task still has unscheduled hours before deadline, it triggers SOS radar deficit
    if (remainingToSchedule > 0) {
      totalDeficitHours += remainingToSchedule;
      bottleneckDetected = true;
    }
  }

  // 4. Inject safety buffer blocks in gaps before critical deadlines
  for (const bin of dayBins) {
    if (bin.capacityLeft >= 1) {
      const bufferDuration = Math.min(bin.capacityLeft, 1.5);
      bin.blocks.push({
        date: bin.dateStr,
        startTime: '21:30',
        duration: bufferDuration,
        taskId: null,
        title: 'Safety Buffer / Emergency Review',
        course: 'BUFFER',
        type: 'buffer',
        isBuffer: true,
        urgencyLevel: 'safe',
        priorityScore: 0
      });
      bin.capacityLeft -= bufferDuration;
    }
  }

  // Flatten blocks and sort chronologically
  const allBlocks = dayBins.flatMap(b => b.blocks);

  return {
    blocks: allBlocks,
    deficitHours: Number(totalDeficitHours.toFixed(1)),
    bottleneckDetected,
    totalScheduledHours: Number(allBlocks.reduce((acc, b) => acc + (b.isBuffer ? 0 : b.duration), 0).toFixed(1)),
    dailyCapacity,
    horizonDays,
    generatedAt: new Date().toISOString()
  };
};

/**
 * Rebalance schedule when study slots were missed or modified
 */
export const rebalanceSchedule = (tasks, user, missedSlotIds = []) => {
  // Fresh dynamic re-allocation
  return generateSchedule(tasks, user, 7);
};
