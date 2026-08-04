/**
 * Task state management — tasks, groups, and all task operations.
 * Single source of truth for task-related data and actions.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  createTask, getAllActiveTasksIncludingDone, updateTask, updateTaskStatus,
  softDeleteTask, restoreDeletedTask, permanentDeleteTask, getDeletedTasks,
} from '../database/TaskRepository';
import {
  createRecurrenceRule, getRecurrenceRuleById, updateRecurrenceRule,
  deleteRecurrenceRule, pauseRecurrenceRule, resumeRecurrenceRule,
} from '../database/RecurrenceRepository';
import { recordCompletion, removeCompletion } from '../database/CompletionRepository';
import {
  getStepsByTaskId, completeStep, undoStep, areAllStepsCompleted,
  createSteps, deleteStepsByTask, getNextPendingStep,
} from '../database/TaskStepRepository';
import { createGroup, getAllGroups, updateGroup, deleteGroup } from '../database/TaskGroupRepository';
import { calculateNextOccurrence } from '../cycle/CycleCalculator';
import { isRecurrenceActive, isRecurrencePaused } from '../cycle/CycleStatus';
import { TaskStatus, Task, TaskWithRelations, TaskGroup, RecurrenceRule } from '../types';
import { TASK_COLORS } from '../utils/constants';
import { initDatabase, getDatabase } from '../database/Database';

interface TaskContextValue {
  tasks: TaskWithRelations[];
  isLoading: boolean;
  groups: TaskGroup[];
  currentGroupId: number;
  setCurrentGroupId: (id: number) => void;
  loadTasks: () => Promise<void>;
  loadGroups: () => Promise<void>;
  addTask: (taskData: any) => Promise<number | undefined>;
  editTask: (taskId: number, updates: any) => Promise<void>;
  changeTaskStatus: (taskId: number, newStatus?: TaskStatus) => Promise<void>;
  completeTask: (taskId: number) => Promise<void>;
  removeTask: (taskId: number) => Promise<void>;
  restoreTask: (task: any) => Promise<void>;
  copyTask: (taskId: number) => Promise<number | undefined>;
  restoreFromRecycleBin: (taskId: number) => Promise<void>;
  permanentDeleteTask: (taskId: number) => Promise<void>;
  getRecycleBinTasks: () => Promise<Task[]>;
  emptyRecycleBin: () => Promise<void>;
  toggleStep: (taskId: number, stepId: number) => Promise<void>;
  toggleStar: (taskId: number) => Promise<void>;
  pauseRecurrence: (ruleId: number) => Promise<void>;
  resumeRecurrence: (ruleId: number) => Promise<void>;
  getTaskRecurrenceStatus: (task: TaskWithRelations) => string | null;
  addGroup: (name: string, icon: string) => Promise<number | null>;
  editGroup: (groupId: number, updates: any) => Promise<void>;
  removeGroup: (groupId: number) => Promise<void>;
  resetDemoTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [groups, setGroups] = useState<TaskGroup[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      let dbTasks = await getAllActiveTasksIncludingDone();
      const tasksWithRelations: TaskWithRelations[] = [];
      for (const task of dbTasks) {
        let recurrenceRule: RecurrenceRule | null = null;
        if (task.recurrence_id) {
          try { recurrenceRule = await getRecurrenceRuleById(task.recurrence_id); } catch {}
        }
        let steps: any[] = [];
        try { steps = await getStepsByTaskId(task.id); } catch {}
        tasksWithRelations.push({
          ...task,
          recurrenceRule,
          steps,
          nextOccurrence: recurrenceRule ? calculateNextOccurrence(recurrenceRule, Date.now()) : null,
        });
      }
      setTasks(tasksWithRelations);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadGroups = useCallback(async () => {
    try {
      const dbGroups = await getAllGroups();
      setGroups(dbGroups);
    } catch (error) {
      console.error('Failed to load groups:', error);
      setGroups([]);
    }
  }, []);

  useEffect(() => {
    initApp();
  }, []);

  async function initApp() {
    try {
      await initDatabase();
      const db = getDatabase();
      const countResult = await db.execAsync([{ sql: 'SELECT COUNT(*) as cnt FROM task', args: [] }], true);
      const taskCount = (countResult[0] as any).rows[0]?.cnt || 0;
      if (taskCount === 0) {
        await createDemoTasks();
      }
      await loadTasks();
      await loadGroups();
    } catch (error) {
      console.error('Init failed:', error);
      await loadTasks();
      await loadGroups();
    }
  }

  const addTask = useCallback(async (taskData: any) => {
    let recurrenceId: number | null = null;
    if (taskData.recurrenceRule) {
      recurrenceId = await createRecurrenceRule(taskData.recurrenceRule as any);
    }
    const taskId = await createTask({
      title: taskData.title,
      note: taskData.note,
      start_time: taskData.startTime,
      end_time: taskData.endTime,
      deadline: taskData.deadline || null,
      start_date: taskData.startDate || taskData.startTime,
      color: taskData.color || '#3B82F6',
      recurrence_id: recurrenceId,
      group_id: taskData.groupId || 0,
    });
    if (taskData.steps && taskData.steps.length > 0) {
      await createSteps(taskId, taskData.steps);
    }
    await loadTasks();
    await loadGroups();
    return taskId;
  }, [loadTasks, loadGroups]);

  const toggleStar = useCallback(async (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    await updateTask(taskId, { is_starred: task.is_starred ? 0 : 1 });
    await loadTasks();
  }, [tasks, loadTasks]);

  const editTask = useCallback(async (taskId: number, updates: any) => {
    await updateTask(taskId, updates);
    await loadTasks();
  }, [loadTasks]);

  const changeTaskStatus = useCallback(async (taskId: number, newStatus?: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    if (!newStatus) {
      if (task.status === TaskStatus.DONE) newStatus = TaskStatus.PENDING;
      else if (task.status === TaskStatus.POSTPONED) newStatus = TaskStatus.PENDING;
      else newStatus = TaskStatus.DONE;
    }
    if (task.status === TaskStatus.DONE && newStatus !== TaskStatus.DONE) {
      await removeCompletion(taskId, task.start_time);
    }
    if (newStatus === TaskStatus.DONE && task.status !== TaskStatus.DONE) {
      await recordCompletion(taskId, Date.now());
    }
    await updateTaskStatus(taskId, newStatus);
    await loadTasks();
  }, [tasks, loadTasks]);

  const completeTask = useCallback(async (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.status === TaskStatus.DONE) {
      await removeCompletion(taskId, task.start_time);
      await updateTaskStatus(taskId, TaskStatus.PENDING);
    } else if (task.steps && task.steps.length > 0) {
      const nextStep = await getNextPendingStep(taskId);
      if (nextStep) {
        await completeStep(nextStep.id);
        const allDone = await areAllStepsCompleted(taskId);
        if (allDone) {
          await updateTaskStatus(taskId, TaskStatus.DONE);
          await recordCompletion(taskId, Date.now());
        }
      }
    } else {
      await updateTaskStatus(taskId, TaskStatus.DONE);
      await recordCompletion(taskId, Date.now());
    }
    await loadTasks();
  }, [tasks, loadTasks]);

  const removeTask = useCallback(async (taskId: number) => {
    await softDeleteTask(taskId);
    await loadTasks();
  }, [loadTasks]);

  const restoreFromRecycleBin = useCallback(async (taskId: number) => {
    await restoreDeletedTask(taskId);
    await loadTasks();
  }, [loadTasks]);

  const permanentDeleteTaskCb = useCallback(async (taskId: number) => {
    await deleteStepsByTask(taskId);
    await permanentDeleteTask(taskId);
    await loadTasks();
  }, [loadTasks]);

  const getRecycleBinTasks = useCallback(async () => {
    return await getDeletedTasks();
  }, []);

  const emptyRecycleBin = useCallback(async () => {
    const deletedTasks = await getDeletedTasks();
    for (const task of deletedTasks) {
      await deleteStepsByTask(task.id);
      await permanentDeleteTask(task.id);
    }
    await loadTasks();
  }, [loadTasks]);

  const restoreTaskCallback = useCallback(async (task: any) => {
    await restoreDeletedTask(task.id);
    await loadTasks();
  }, [loadTasks]);

  const copyTask = useCallback(async (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newTask = {
      title: `${task.title} (副本)`,
      note: task.note || '',
      start_time: task.start_time,
      end_time: task.end_time,
      deadline: task.deadline || null,
      start_date: task.start_date || task.start_time,
      color: task.color || '#3B82F6',
      is_starred: 0,
      group_id: task.group_id || 0,
      sort_order: task.sort_order || 0,
    };

    const newId = await createTask(newTask);
    if (task.steps && task.steps.length > 0) {
      await createSteps(newId, task.steps.map((s: any) => s.title));
    }
    await loadTasks();
    return newId;
  }, [tasks, loadTasks]);

  const toggleStep = useCallback(async (taskId: number, stepId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task.steps) return;
    const step = task.steps.find((s: any) => s.id === stepId);
    if (!step) return;

    if (step.status === 'completed') {
      await undoStep(stepId);
    } else {
      await completeStep(stepId);
      const allDone = await areAllStepsCompleted(taskId);
      if (allDone) {
        await updateTaskStatus(taskId, TaskStatus.DONE);
        await recordCompletion(taskId, Date.now());
      }
    }
    await loadTasks();
  }, [tasks, loadTasks]);

  const pauseRecurrence = useCallback(async (ruleId: number) => {
    await pauseRecurrenceRule(ruleId);
    await loadTasks();
  }, [loadTasks]);

  const resumeRecurrence = useCallback(async (ruleId: number) => {
    await resumeRecurrenceRule(ruleId);
    await loadTasks();
  }, [loadTasks]);

  const getTaskRecurrenceStatus = useCallback((task: TaskWithRelations): string | null => {
    if (!task.recurrenceRule) return null;
    if (isRecurrencePaused(task.recurrenceRule)) return '已暂停';
    if (isRecurrenceActive(task.recurrenceRule)) return '进行中';
    return '已结束';
  }, []);

  const addGroup = useCallback(async (name: string, icon: string) => {
    try {
      const id = await createGroup(name, icon || '📋', groups.length);
      await loadGroups();
      return id;
    } catch {
      return null;
    }
  }, [groups.length, loadGroups]);

  const editGroup = useCallback(async (groupId: number, updates: any) => {
    await updateGroup(groupId, updates);
    await loadGroups();
  }, [loadGroups]);

  const removeGroup = useCallback(async (groupId: number) => {
    await deleteGroup(groupId);
    await loadGroups();
  }, [loadGroups]);

  const resetDemoTasks = useCallback(async () => {
    try {
      const db = getDatabase();
      const allTasks = await db.execAsync([{ sql: 'SELECT id FROM task', args: [] }], true);
      const rows = (allTasks[0] as any).rows;
      for (const row of rows) {
        await deleteStepsByTask(row.id);
        await permanentDeleteTask(row.id);
      }
      await createDemoTasks();
      await loadTasks();
      await loadGroups();
    } catch (error) {
      console.error('Reset demo failed:', error);
      await loadTasks();
      await loadGroups();
    }
  }, [loadTasks, loadGroups]);

  const value = useMemo<TaskContextValue>(() => ({
    tasks, isLoading, groups, currentGroupId, setCurrentGroupId,
    loadTasks, loadGroups, addTask, editTask, changeTaskStatus, completeTask,
    removeTask, restoreTask: restoreTaskCallback, copyTask, restoreFromRecycleBin,
    permanentDeleteTask: permanentDeleteTaskCb, getRecycleBinTasks, emptyRecycleBin,
    toggleStep, toggleStar, pauseRecurrence, resumeRecurrence,
    getTaskRecurrenceStatus, addGroup, editGroup, removeGroup, resetDemoTasks,
  }), [tasks, isLoading, groups, currentGroupId, loadTasks, loadGroups,
    addTask, editTask, changeTaskStatus, completeTask, removeTask,
    restoreTaskCallback, copyTask, restoreFromRecycleBin, permanentDeleteTaskCb,
    getRecycleBinTasks, emptyRecycleBin, toggleStep, toggleStar,
    pauseRecurrence, resumeRecurrence, getTaskRecurrenceStatus,
    addGroup, editGroup, removeGroup, resetDemoTasks]);

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks(): TaskContextValue {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
}

async function createDemoTasks() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const day = 24 * 60 * 60 * 1000;

  const task1Id = await createTask({
    title: '完成项目报告', note: '这是一个带步骤的任务示例',
    start_time: today, end_time: today + 2 * 60 * 60 * 1000, start_date: today,
    color: TASK_COLORS[0].bar, sort_order: 0,
  });
  await createSteps(task1Id, ['收集数据', '撰写初稿', '审核修改', '提交报告']);

  const birthday = new Date(now.getFullYear(), 2, 12).getTime();
  const recurRule2Id = await createRecurrenceRule({ type: 'daily' as any, interval: 1, days_of_week: null, day_of_month: null, month_of_year: null, end_date: null, is_paused: false });
  await createTask({
    title: '妈妈生日', note: '每年循环的纪念日示例',
    start_time: birthday, end_time: birthday + day, start_date: birthday,
    color: TASK_COLORS[1].bar, recurrence_id: recurRule2Id, sort_order: 1,
  });

  const task3Id = await createTask({
    title: '暑假旅行计划', note: '未来任务示例',
    start_time: today + 30 * day, end_time: today + 37 * day, start_date: today + 30 * day,
    color: TASK_COLORS[4].bar, sort_order: 2,
  });
  await createSteps(task3Id, ['确定目的地', '预订机票', '打包行李']);

  const task4Id = await createTask({
    title: '已完成示例', note: '这是一个已完成的任务示例',
    start_time: today - day, end_time: today - day + 60 * 60 * 1000, start_date: today - day,
    color: TASK_COLORS[2].bar, sort_order: 3,
  });
  await createSteps(task4Id, ['步骤1', '步骤2']);
  await updateTaskStatus(task4Id, TaskStatus.DONE);
  const steps4 = await getStepsByTaskId(task4Id);
  for (const s of steps4) {
    await completeStep(s.id);
  }

  const memorial = new Date(now.getFullYear(), 0, 1).getTime();
  await createTask({
    title: '元旦纪念日', note: '过去日期的任务示例',
    start_time: memorial, end_time: memorial + day, start_date: memorial,
    color: TASK_COLORS[5].bar, sort_order: 4,
  });

  const task6Id = await createTask({
    title: '专注学习新技能', note: '使用番茄钟进行专注学习',
    start_time: today + day, end_time: today + day + 3 * 60 * 60 * 1000, start_date: today + day,
    color: TASK_COLORS[6].bar, sort_order: 5,
  });
  await createSteps(task6Id, ['观看教学视频', '完成练习题目', '总结学习笔记']);

  const recurRule7Id = await createRecurrenceRule({ type: 'daily' as any, interval: 1, days_of_week: null, day_of_month: null, month_of_year: null, end_date: null, is_paused: false });
  await createTask({
    title: '每日运动30分钟', note: '保持健康的生活习惯',
    start_time: today, end_time: today + 30 * 60 * 1000, start_date: today,
    color: TASK_COLORS[7].bar, recurrence_id: recurRule7Id, sort_order: 6,
  });

  await createGroup('日常', '🏠', 0);
  await createGroup('工作', '💼', 1);
  await createGroup('学习', '📚', 2);
}
