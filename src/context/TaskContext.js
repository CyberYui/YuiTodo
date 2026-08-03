// 任务数据全局状态管理（legacy API异步版本）
// 负责：统一管理所有任务数据的加载、增删改查、状态切换
// 通过Context向所有子组件提供任务数据和操作方法

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  createTask,
  getAllActiveTasksIncludingDone,
  updateTask,
  updateTaskStatus,
  deleteTask,
  restoreTask,
  softDeleteTask,
  restoreDeletedTask,
  permanentDeleteTask,
  getDeletedTasks,
  cleanupDeletedTasks,
} from '../database/TaskTable';
import {
  createRecurrenceRule,
  getRecurrenceRuleById,
  updateRecurrenceRule,
  deleteRecurrenceRule,
  pauseRecurrenceRule,
  resumeRecurrenceRule,
} from '../database/RecurrenceTable';
import { recordCompletion, removeCompletion } from '../database/CompletionTable';
import {
  getStepsByTaskId,
  getNextPendingStep,
  completeStep,
  undoStep,
  areAllStepsCompleted,
  createSteps,
  deleteStepsByTask,
} from '../database/TaskStepTable';
import { calculateNextOccurrence } from '../cycle/CycleCalculator';
import { isRecurrenceActive, isRecurrencePaused } from '../cycle/CycleStatus';
import { TaskStatus, TASK_COLORS } from '../utils/constants';
import { initDatabase, getDatabase } from '../database/Database';
import { createGroup, getAllGroups, updateGroup, deleteGroup } from '../database/TaskGroupTable';

// 创建Context
const TaskContext = createContext();

/**
 * 任务Provider组件
 * 提供任务列表数据 + 所有操作函数
 */
export function TaskProvider({ children }) {
  // 任务列表状态
  const [tasks, setTasks] = useState([]);
  // 分组列表状态
  const [groups, setGroups] = useState([]);
  // 当前选中的分组（0=全部）
  const [currentGroupId, setCurrentGroupId] = useState(0);
  // 当前选中的列表（1=默认）
  const [currentListId, setCurrentListId] = useState(1);
  // 加载状态
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 从数据库加载所有活跃任务
   */
  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      // 从数据库读取所有活跃任务（包括已完成）
      let dbTasks = await getAllActiveTasksIncludingDone();
      // 按列表过滤
      if (currentListId > 0) {
        dbTasks = dbTasks.filter(t => (t.list_id || 1) === currentListId);
      }

      // 为每条任务加载关联的循环规则和步骤
      const tasksWithRules = [];
      for (const task of dbTasks) {
        let recurrenceRule = null;
        if (task.recurrence_id) {
          try {
            recurrenceRule = await getRecurrenceRuleById(task.recurrence_id);
          } catch (e) {
            // 循环规则读取失败不影响任务显示
          }
        }
        // 加载该任务的步骤列表
        let steps = [];
        try {
          steps = await getStepsByTaskId(task.id);
        } catch (e) {
          // 步骤读取失败不影响任务显示
        }
        tasksWithRules.push({
          ...task,
          recurrenceRule,
          steps,
          nextOccurrence: recurrenceRule
            ? calculateNextOccurrence(recurrenceRule, Date.now())
            : null,
        });
      }

      setTasks(tasksWithRules);
    } catch (error) {
      console.error('加载任务失败:', error);
      setTasks([]); // 加载失败时显示空列表而非一直loading
    } finally {
      setIsLoading(false);
    }
  }, [currentListId]);

  // 组件挂载时加载任务，首次启动创建演示任务
  useEffect(() => {
    initApp();
  }, []);

  /**
   * 初始化应用：如果任务表为空则创建演示任务
   */
  async function initApp() {
    try {
      // 先确保数据库初始化完成（表创建完毕）
      await initDatabase();
      const db = getDatabase();
      // 检查任务表是否为空（比检查initialized标志更可靠）
      const countResult = await db.execAsync(
        [{ sql: 'SELECT COUNT(*) as cnt FROM task', args: [] }],
        true
      );
      const taskCount = countResult[0].rows[0]?.cnt || 0;
      if (taskCount === 0) {
        // 任务表为空：创建演示任务和分组
        await createDemoTasks();
      }
      await loadTasks();
      await loadGroups();
    } catch (error) {
      console.error('初始化失败:', error);
      await loadTasks();
      await loadGroups();
    }
  }

  /**
   * 加载所有分组
   */
  const loadGroups = useCallback(async () => {
    try {
      const dbGroups = await getAllGroups();
      setGroups(dbGroups);
    } catch (error) {
      console.error('加载分组失败:', error);
      setGroups([]);
    }
  }, []);

  /**
   * 添加自定义分组
   */
  const addGroup = useCallback(async (name, icon) => {
    try {
      const id = await createGroup(name, icon || '📋', groups.length);
      await loadGroups();
      return id;
    } catch (error) {
      console.error('添加分组失败:', error);
      return null;
    }
  }, [groups.length, loadGroups]);

  /**
   * 编辑分组
   */
  const editGroup = useCallback(async (groupId, updates) => {
    try {
      await updateGroup(groupId, updates);
      await loadGroups();
    } catch (error) {
      console.error('编辑分组失败:', error);
    }
  }, [loadGroups]);

  /**
   * 删除分组
   */
  const removeGroup = useCallback(async (groupId) => {
    try {
      await deleteGroup(groupId);
      await loadGroups();
    } catch (error) {
      console.error('删除分组失败:', error);
    }
  }, [loadGroups]);

  /**
   * 创建演示任务（展示所有功能）
   */
  async function createDemoTasks() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const day = 24 * 60 * 60 * 1000;

    // 演示任务1：带步骤的今日任务（蓝色主题）
    const task1Id = await createTask({
      title: '📝 完成项目报告',
      note: '这是一个带步骤的任务示例',
      start_time: today,
      end_time: today + 2 * 60 * 60 * 1000,
      start_date: today,
      color: TASK_COLORS[0].bar, // 蓝色
      deadline: null,
      recurrence_id: null,
    });
    await createSteps(task1Id, ['收集数据', '撰写初稿', '审核修改', '提交报告']);

    // 演示任务2：有循环的任务（绿色主题，每年生日）
    const birthday = new Date(now.getFullYear(), 2, 12).getTime(); // 3月12日
    const recurRule2Id = await createRecurrenceRule({ type: 'yearly', interval: 1, month_of_year: 3, day_of_month: 12 });
    await createTask({
      title: '🎂 妈妈生日',
      note: '每年循环的纪念日示例',
      start_time: birthday,
      end_time: birthday + day,
      start_date: birthday,
      color: TASK_COLORS[1].bar, // 绿色
      deadline: null,
      recurrence_id: recurRule2Id,
    });

    // 演示任务3：未来任务（紫色主题）
    const task3Id = await createTask({
      title: '🏖️ 暑假旅行计划',
      note: '未来任务示例，已自动归档到对应月份',
      start_time: today + 30 * day,
      end_time: today + 37 * day,
      start_date: today + 30 * day,
      color: TASK_COLORS[4].bar, // 紫色
      deadline: null,
      recurrence_id: null,
    });
    await createSteps(task3Id, ['确定目的地', '预订机票', '打包行李']);

    // 演示任务4：已完成任务（橙色主题）
    const task4Id = await createTask({
      title: '✅ 已完成示例',
      note: '这是一个已完成的任务示例',
      start_time: today - day,
      end_time: today - day + 60 * 60 * 1000,
      start_date: today - day,
      color: TASK_COLORS[2].bar, // 橙色
      deadline: null,
      recurrence_id: null,
    });
    await createSteps(task4Id, ['步骤1', '步骤2']);
    // 标记为已完成
    await updateTaskStatus(task4Id, TaskStatus.DONE);
    const steps4 = await getStepsByTaskId(task4Id);
    for (const s of steps4) {
      await completeStep(s.id);
    }

    // 演示任务5：过去日期的任务（粉色主题，纪念日）
    const memorial = new Date(now.getFullYear(), 0, 1).getTime(); // 1月1日
    await createTask({
      title: '🎉 元旦纪念日',
      note: '过去日期的任务示例，归档到1月',
      start_time: memorial,
      end_time: memorial + day,
      start_date: memorial,
      color: TASK_COLORS[5].bar, // 粉色
      deadline: null,
      recurrence_id: null,
    });

    // 创建演示分组
    await createGroup('日常', '🏠', 0);
    await createGroup('工作', '💼', 1);
    await createGroup('学习', '📚', 2);
  }

  /**
   * 创建新任务（可能同时创建循环规则和步骤）
   */
  const addTask = useCallback(async (taskData) => {
    let recurrenceId = null;

    // 如果指定了循环规则，先创建循环规则
    if (taskData.recurrenceRule) {
      recurrenceId = await createRecurrenceRule(taskData.recurrenceRule);
    }

    // 再创建任务
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
      is_starred: 0,
      sort_order: 0,
    });

    // 如果有步骤，批量创建步骤
    if (taskData.steps && taskData.steps.length > 0) {
      await createSteps(taskId, taskData.steps);
    }

    // 刷新任务列表
    await loadTasks();
    await loadGroups();
    return taskId;
  }, [loadTasks, loadGroups]);

  /**
   * 切换任务星标
   * @param {number} taskId - 任务ID
   */
  const toggleStar = useCallback(async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    await updateTask(taskId, { is_starred: task.is_starred ? 0 : 1 });
    await loadTasks();
  }, [tasks, loadTasks]);

  /**
   * 更新任务信息
   */
  const editTask = useCallback(async (taskId, updates) => {
    await updateTask(taskId, updates);
    await loadTasks();
  }, [loadTasks]);

  /**
   * 切换任务状态（核心状态机）   */
  const changeTaskStatus = useCallback(async (taskId, newStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (!newStatus) {
      if (task.status === TaskStatus.DONE) {
        newStatus = TaskStatus.PENDING;
      } else if (task.status === TaskStatus.POSTPONED) {
        newStatus = TaskStatus.PENDING;
      } else {
        newStatus = TaskStatus.DONE;
      }
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

  /**
   * 标记任务为已完成（Sorted风格步骤版）
   *
   * 逻辑：
   * - 如果任务有步骤：完成下一个待完成步骤
   *   - 如果所有步骤都完成了，自动标记任务为已完成
   * - 如果任务没有步骤：直接标记完成/撤销
   * - 如果任务已标记完成：撤销为待完成，同时清除步骤完成状态
   */
  const completeTask = useCallback(async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.status === TaskStatus.DONE) {
      // 已完成的任务 → 撤销为待完成
      await removeCompletion(taskId, task.start_time);
      await updateTaskStatus(taskId, TaskStatus.PENDING);
    } else if (task.steps && task.steps.length > 0) {
      // 有步骤的任务 → 完成下一个待完成步骤
      const nextStep = await getNextPendingStep(taskId);
      if (nextStep) {
        await completeStep(nextStep.id);
        // 检查是否所有步骤都已完成
        const allDone = await areAllStepsCompleted(taskId);
        if (allDone) {
          // 所有步骤完成，自动标记任务为已完成
          await updateTaskStatus(taskId, TaskStatus.DONE);
          await recordCompletion(taskId, Date.now());
        }
      }
    } else {
      // 没有步骤的任务 → 直接标记完成
      await updateTaskStatus(taskId, TaskStatus.DONE);
      await recordCompletion(taskId, Date.now());
    }

    await loadTasks();
  }, [tasks, loadTasks]);

  /**
   * 删除任务（软删除，移入回收站）
   */
  const removeTask = useCallback(async (taskId) => {
    await softDeleteTask(taskId);
    await loadTasks();
  }, [loadTasks]);

  /**
   * 从回收站恢复任务
   */
  const restoreFromRecycleBin = useCallback(async (taskId) => {
    await restoreDeletedTask(taskId);
    await loadTasks();
  }, [loadTasks]);

  /**
   * 永久删除任务
   */
  const permanentDeleteTaskCb = useCallback(async (taskId) => {
    await deleteStepsByTask(taskId);
    await permanentDeleteTask(taskId);
    await loadTasks();
  }, [loadTasks]);

  /**
   * 获取回收站任务
   */
  const getRecycleBinTasks = useCallback(async () => {
    return await getDeletedTasks();
  }, []);

  /**
   * 清空回收站
   */
  const emptyRecycleBin = useCallback(async () => {
    const deletedTasks = await getDeletedTasks();
    for (const task of deletedTasks) {
      await deleteStepsByTask(task.id);
      await permanentDeleteTask(task.id);
    }
    await loadTasks();
  }, [loadTasks]);

  /**
   * 恢复已删除的任务（用于撤销删除）
   */
  const restoreTaskCallback = useCallback(async (task) => {
    await restoreTask(task);
    await loadTasks();
  }, [loadTasks]);

  /**
   * 复制任务
   */
  const copyTask = useCallback(async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // 创建新任务（复制属性）
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

    // 复制步骤
    if (task.steps && task.steps.length > 0) {
      const newSteps = task.steps.map((step, idx) => ({
        task_id: newId,
        title: step.title,
        sort_order: idx,
      }));
      await createSteps(newSteps);
    }

    await loadTasks();
    return newId;
  }, [tasks, loadTasks]);

  /**
   * 切换步骤完成状态（点击步骤勾选/取消）
   * @param {number} taskId - 任务ID
   * @param {number} stepId - 步骤ID
   */
  const toggleStep = useCallback(async (taskId, stepId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task.steps) return;

    const step = task.steps.find((s) => s.id === stepId);
    if (!step) return;

    if (step.status === 'completed') {
      await undoStep(stepId);
    } else {
      await completeStep(stepId);
      // 检查是否所有步骤都已完成
      const allDone = await areAllStepsCompleted(taskId);
      if (allDone) {
        await updateTaskStatus(taskId, TaskStatus.DONE);
        await recordCompletion(taskId, Date.now());
      }
    }

    await loadTasks();
  }, [tasks, loadTasks]);

  /**
   * 暂停循环规则
   */
  const pauseRecurrence = useCallback(async (ruleId) => {
    await pauseRecurrenceRule(ruleId);
    await loadTasks();
  }, [loadTasks]);

  /**
   * 恢复循环规则
   */
  const resumeRecurrence = useCallback(async (ruleId) => {
    await resumeRecurrenceRule(ruleId);
    await loadTasks();
  }, [loadTasks]);

  /**
   * 获取循环状态描述
   */
  const getTaskRecurrenceStatus = useCallback((task) => {
    if (!task.recurrenceRule) return null;
    if (isRecurrencePaused(task.recurrenceRule)) return '已暂停';
    if (isRecurrenceActive(task.recurrenceRule)) return '进行中';
    return '已结束';
  }, []);

  /**
   * 重置演示任务（清空所有任务后重新创建演示任务）
   */
  const resetDemoTasks = useCallback(async () => {
    try {
      const db = getDatabase();
      // 获取所有任务ID
      const allTasks = await db.execAsync([{ sql: 'SELECT id FROM task', args: [] }], true);
      const rows = allTasks[0].rows;
      for (const row of rows) {
        await deleteStepsByTask(row.id);
        await deleteTask(row.id);
      }
      await createDemoTasks();
      await loadTasks();
      await loadGroups();
    } catch (error) {
      console.error('重置演示任务失败:', error);
      await loadTasks();
      await loadGroups();
    }
  }, [loadTasks, loadGroups]);

  // 提供给子组件的值（useMemo缓存）
  const value = useMemo(() => ({
    tasks,
    isLoading,
    groups,
    currentGroupId,
    setCurrentGroupId,
    currentListId,
    setCurrentListId,
    loadTasks,
    loadGroups,
    addTask,
    editTask,
    changeTaskStatus,
    completeTask,
    removeTask,
    restoreTask: restoreTaskCallback,
    copyTask,
    restoreFromRecycleBin,
    permanentDeleteTask: permanentDeleteTaskCb,
    getRecycleBinTasks,
    emptyRecycleBin,
    toggleStep,
    toggleStar,
    pauseRecurrence,
    resumeRecurrence,
    getTaskRecurrenceStatus,
    addGroup,
    editGroup,
    removeGroup,
    resetDemoTasks,
  }), [tasks, isLoading, groups, currentGroupId, currentListId, setCurrentListId, loadTasks, loadGroups, addTask, editTask, changeTaskStatus,
       completeTask, removeTask, restoreTaskCallback, copyTask, restoreFromRecycleBin, permanentDeleteTaskCb, getRecycleBinTasks, emptyRecycleBin, toggleStep, toggleStar, pauseRecurrence, resumeRecurrence, getTaskRecurrenceStatus,
       addGroup, editGroup, removeGroup, resetDemoTasks]);

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}

/**
 * 自定义Hook：在子组件中获取任务数据和操作
 */
export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks必须在TaskProvider内部使用');
  }
  return context;
}
