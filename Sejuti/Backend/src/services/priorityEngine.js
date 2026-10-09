/**
 * Priority Engine Service
 * Implements real-time academic urgency and bottleneck calculation.
 */

/**
 * Calculates priority score for a single task.
 * 
 * Formula:
 * Urgency Factor = (Weightage * Difficulty) / max(Hours Until Deadline, 1)
 * Priority Score = Urgency Factor * (1 + (Remaining Effort / Daily Study Capacity))
 * 
 * @param {Object} task 
 * @param {Number} dailyCapacityHours - default 4
 * @returns {Object} { priorityScore, urgencyFactor, remainingHours, hoursUntilDeadline, urgencyLevel }
 */
export const calculateTaskScore = (task, dailyCapacityHours = 4) => {
  if (task.status === 'completed') {
    return {
      priorityScore: 0,
      urgencyFactor: 0,
      remainingHours: 0,
      hoursUntilDeadline: 0,
      urgencyLevel: 'safe'
    };
  }

  const now = new Date();
  const deadlineDate = new Date(task.deadline);
  const diffMs = deadlineDate.getTime() - now.getTime();
  const rawHoursUntilDeadline = diffMs / (1000 * 60 * 60);
  const hoursUntilDeadline = Math.max(0.5, rawHoursUntilDeadline);

  const remainingHours = Math.max(0, (task.estimatedHours || 3) - (task.hoursCompleted || 0));
  const capacity = Math.max(1, dailyCapacityHours || 4);
  const weightage = Number(task.weightage) || 5;
  const difficulty = Number(task.difficulty) || 3;

  // Urgency Factor
  const urgencyFactor = (weightage * difficulty) / Math.max(hoursUntilDeadline, 1);

  // Priority Score
  const effortRatio = remainingHours / capacity;
  const rawScore = urgencyFactor * (1 + effortRatio);

  // Round to 2 decimal places
  const priorityScore = Number(rawScore.toFixed(2));

  // Determine urgency band
  let urgencyLevel = 'normal';
  if (rawHoursUntilDeadline <= 0 || priorityScore >= 20 || remainingHours >= hoursUntilDeadline) {
    urgencyLevel = 'critical'; // sos-crimson
  } else if (priorityScore >= 10 || rawHoursUntilDeadline <= 24) {
    urgencyLevel = 'warning'; // sos-amber
  } else if (priorityScore >= 4) {
    urgencyLevel = 'elevated'; // sos-cyan
  } else {
    urgencyLevel = 'safe'; // sos-mint
  }

  return {
    priorityScore,
    urgencyFactor: Number(urgencyFactor.toFixed(2)),
    remainingHours: Number(remainingHours.toFixed(1)),
    hoursUntilDeadline: Number(rawHoursUntilDeadline.toFixed(1)),
    urgencyLevel
  };
};

/**
 * Calculates priority scores for a collection of tasks and sorts descending.
 * 
 * @param {Array} tasks 
 * @param {Number} dailyCapacityHours 
 * @returns {Array} sorted tasks with enriched scoring
 */
export const rankTasks = (tasks, dailyCapacityHours = 4) => {
  return tasks
    .map(task => {
      const taskObj = task.toObject ? task.toObject() : { ...task };
      const scoreData = calculateTaskScore(taskObj, dailyCapacityHours);
      return {
        ...taskObj,
        priorityScore: scoreData.priorityScore,
        urgencyFactor: scoreData.urgencyFactor,
        remainingHours: scoreData.remainingHours,
        hoursUntilDeadline: scoreData.hoursUntilDeadline,
        urgencyLevel: scoreData.urgencyLevel
      };
    })
    .sort((a, b) => {
      // Pending/in-progress first, then higher priority score, then earlier deadline
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
      return new Date(a.deadline) - new Date(b.deadline);
    });
};
