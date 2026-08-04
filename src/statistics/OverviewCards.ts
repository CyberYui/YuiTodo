/**
 * Overview statistics calculations.
 */

import { TaskStatus, Task, OverviewCounts, TodayProgress, RecurrenceFulfillment } from '../types';
import { isExpired } from '../utils/dateHelpers';

export function calculateOverviewCounts(tasks: Task[]): OverviewCounts {
  let pending = 0;
  let overdue = 0;
  let completed = 0;
  let postponed = 0;

  tasks.forEach((task) => {
    switch (task.status) {
      case TaskStatus.DONE:
        completed++;
        break;
      case TaskStatus.POSTPONED:
        postponed++;
        break;
      case TaskStatus.PENDING:
        if (isExpired(task.end_time)) {
          overdue++;
        } else {
          pending++;
        }
        break;
      default:
        break;
    }
  });

  return { pending, overdue, completed, postponed };
}

export function calculateRecurrenceFulfillment(tasks: Task[], completionRecords: Array<{ task_id: number }>): RecurrenceFulfillment {
  const recurrenceTasks = tasks.filter((task) => (task as any).recurrenceRule && task.recurrence_id);
  if (recurrenceTasks.length === 0) {
    return { rate: 0, totalScheduled: 0, totalCompleted: 0 };
  }

  const recurrenceTaskIds = new Set(recurrenceTasks.map((t) => t.id));
  const totalCompleted = completionRecords.filter((record) =>
    recurrenceTaskIds.has(record.task_id)
  ).length;
  const totalScheduled = Math.max(totalCompleted, recurrenceTasks.length);
  const rate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;

  return { rate, totalScheduled, totalCompleted };
}

export function getTodayProgress(tasks: Task[]): TodayProgress {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1;

  const todayTasks = tasks.filter(
    (task) => task.start_time >= todayStart && task.start_time <= todayEnd
  );
  const total = todayTasks.length;
  const completed = todayTasks.filter((task) => task.status === TaskStatus.DONE).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
}
