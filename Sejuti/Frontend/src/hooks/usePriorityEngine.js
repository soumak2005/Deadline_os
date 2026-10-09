import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Real-time Priority Preview Hook for Modals and Interactive Sliders
 */
export const usePriorityEngine = ({
  deadline,
  estimatedHours = 3,
  hoursCompleted = 0,
  weightage = 5,
  difficulty = 3
}) => {
  const { user } = useAuth();
  const dailyCapacity = user?.dailyCapacityHours || 4;

  const calculation = useMemo(() => {
    if (!deadline) {
      return {
        priorityScore: 0,
        urgencyFactor: 0,
        remainingHours: Math.max(0, estimatedHours - hoursCompleted),
        hoursUntilDeadline: 0,
        urgencyLevel: 'safe'
      };
    }

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffMs = deadlineDate.getTime() - now.getTime();
    const rawHoursUntilDeadline = diffMs / (1000 * 60 * 60);
    const hoursUntilDeadline = Math.max(0.5, rawHoursUntilDeadline);

    const remainingHours = Math.max(0, Number(estimatedHours) - Number(hoursCompleted));
    const capacity = Math.max(1, dailyCapacity);
    const w = Number(weightage) || 1;
    const d = Number(difficulty) || 1;

    // Formula:
    // Urgency Factor = (Weightage * Difficulty) / max(Hours Until Deadline, 1)
    // Priority Score = Urgency Factor * (1 + (Remaining Effort / Daily Study Capacity))
    const urgencyFactor = (w * d) / Math.max(hoursUntilDeadline, 1);
    const effortRatio = remainingHours / capacity;
    const rawScore = urgencyFactor * (1 + effortRatio);
    const priorityScore = Number(rawScore.toFixed(2));

    let urgencyLevel = 'safe';
    if (rawHoursUntilDeadline <= 0 || priorityScore >= 20 || remainingHours >= hoursUntilDeadline) {
      urgencyLevel = 'critical';
    } else if (priorityScore >= 10 || rawHoursUntilDeadline <= 24) {
      urgencyLevel = 'warning';
    } else if (priorityScore >= 4) {
      urgencyLevel = 'elevated';
    }

    return {
      priorityScore,
      urgencyFactor: Number(urgencyFactor.toFixed(2)),
      remainingHours: Number(remainingHours.toFixed(1)),
      hoursUntilDeadline: Number(rawHoursUntilDeadline.toFixed(1)),
      urgencyLevel
    };
  }, [deadline, estimatedHours, hoursCompleted, weightage, difficulty, dailyCapacity]);

  return calculation;
};
