// 单个任务条目组件（完整版：步骤可交互 + 自定义颜色 + 月份归档支持）
// 职责：展示任务信息 + 左右滑动交互 + 步骤进度 + 颜色自定义
//
// 交互规则：
// - 左滑：删除任务 🗑
// - 右滑：完成（如果有步骤则完成当前步骤，否则直接完成）
// - 点击/长按：打开编辑弹窗
// - 点击步骤行：切换步骤完成状态

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '../context/ThemeContext';
import { TaskStatus, RecurrenceLabels, TASK_COLORS } from '../utils/constants';
import { formatDateFriendly, isDateToday, isExpired } from '../utils/dateHelpers';
import ThemedText from './ThemedText';

// 滑动阈值
const SWIPE_THRESHOLD = 80;

/**
 * 任务条目组件
 */
export default function TaskItem({
  task,
  onPress,
  onSwipeComplete,
  onSwipeDelete,
  onToggleStep,
  onToggleStar,
}) {
  const { theme, taskBgMode, taskBgColor, styleConfig, isDark } = useTheme();
  const swipeableRef = useRef(null);

  // 动态样式
  const styles = createStyles(theme);

  // 任务状态判断
  const isDone = task.status === TaskStatus.DONE;
  const isOverdue = isExpired(task.end_time) && task.status === TaskStatus.PENDING;
  const isToday = isDateToday(task.start_time);

  // 步骤进度计算
  const steps = task.steps || [];
  const totalSteps = steps.length;
  const completedSteps = steps.filter((s) => s.status === 'completed').length;
  const hasSteps = totalSteps > 0;
  const allStepsCompleted = hasSteps && completedSteps === totalSteps;

  // 任务自定义颜色主题（从预设中查找，找不到则使用默认蓝色）
  const taskTheme = TASK_COLORS.find((c) => c.bar === task.color) || TASK_COLORS[0];
  const taskColor = taskTheme.bar;
  const labelColor = taskTheme.label;
  const dateColor = taskTheme.date;
  const bgColor = taskTheme.bg;

  function getCardBackground() {
    const color = taskBgMode === 'uniform' ? taskBgColor : taskColor;
    return hexToRgba(color, isDark ? 0.2 : 0.12);
  }

  function hexToRgba(hex, alpha) {
    if (!hex || !hex.startsWith('#')) return `rgba(59,130,246,${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  /**
   * 渲染左滑操作：删除
   */
  const renderLeftActions = () => (
    <View style={[styles.leftAction, { backgroundColor: theme.swipeDeleteBg, borderRadius: styleConfig?.cardRadius || 10 }]}>
      <Text style={[styles.actionIcon, { color: theme.danger }]}>🗑</Text>
      <Text style={[styles.actionText, { color: theme.danger }]}>删除</Text>
    </View>
  );

  /**
   * 渲染右滑操作：完成
   */
  const renderRightActions = () => {
    let actionText = '完成';
    let actionIcon = '✓';
    if (hasSteps && !allStepsCompleted) {
      actionText = `下一步 (${completedSteps}/${totalSteps})`;
      actionIcon = '▶';
    }
    return (
      <View style={[styles.rightAction, { backgroundColor: theme.swipeCompleteBg, borderRadius: styleConfig?.cardRadius || 10 }]}>
        <Text style={[styles.actionIcon, { color: theme.done }]}>{actionIcon}</Text>
        <Text style={[styles.actionText, { color: theme.done }]}>{actionText}</Text>
      </View>
    );
  };

  /**
   * 滑动回调
   */
  const onSwipeableOpen = (direction) => {
    if (direction === 'left') {
      onSwipeDelete();
    } else if (direction === 'right') {
      onSwipeComplete();
    }
    setTimeout(() => swipeableRef.current?.close(), 50);
  };

  /**
   * 点击步骤行：切换步骤状态
   */
  const handleStepPress = (stepId) => {
    if (onToggleStep) {
      onToggleStep(task.id, stepId);
    }
  };

  /**
   * 获取状态标签
   */
  function getStatusLabel() {
    if (isDone) return '已完成';
    if (isOverdue) return '已逾期';
    if (isToday) return '今天';
    return '';
  }

  /**
   * 获取循环标签
   */
  function getRecurrenceLabel() {
    if (!task.recurrenceRule) return null;
    const rule = task.recurrenceRule;
    const typeLabel = RecurrenceLabels[rule.type] || rule.type;
    if (rule.interval > 1) {
      const unit = rule.type === 'custom_weeks' ? '周' : '天';
      return `每${rule.interval}${unit}`;
    }
    return typeLabel;
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableOpen={onSwipeableOpen}
      leftThreshold={SWIPE_THRESHOLD}
      rightThreshold={SWIPE_THRESHOLD}
      friction={1.5}
      overshootFriction={8}
    >
      <TouchableOpacity
        style={[styles.card, { backgroundColor: getCardBackground(), opacity: isDone ? 0.6 : 1, borderRadius: styleConfig?.cardRadius || 10 }]}
        onPress={() => onPress(task)}
        onLongPress={() => onPress(task)}
        activeOpacity={0.8}
        delayLongPress={400}
      >
        {/* 左侧状态指示条（使用任务自定义颜色） */}
        <View style={[styles.statusBar, { backgroundColor: isDone ? theme.done : taskColor }]} />

        {/* 任务内容 */}
        <View style={styles.content}>
          {/* 标题行 */}
          <ThemedText
            style={[styles.title, { color: theme.textPrimary, textDecorationLine: isDone ? 'line-through' : 'none' }]}
            numberOfLines={1}
          >
            {task.title}
          </ThemedText>

          {/* 备注 */}
          {task.note ? (
            <ThemedText style={[styles.note, { color: theme.textSecondary }]} numberOfLines={1}>
              {task.note}
            </ThemedText>
          ) : null}

          {/* 步骤列表（可交互） */}
          {hasSteps && (
            <View style={styles.stepsContainer}>
              {steps.map((step, index) => {
                const isStepDone = step.status === 'completed';
                return (
                  <TouchableOpacity
                    key={step.id || index}
                    style={styles.stepRow}
                    onPress={() => handleStepPress(step.id)}
                    activeOpacity={0.6}
                  >
                    <View
                      style={[
                        styles.stepCheckbox,
                        { borderColor: isStepDone ? theme.done : theme.textTertiary },
                        isStepDone && { backgroundColor: theme.done },
                      ]}
                    >
                      {isStepDone && <Text style={styles.stepCheckmark}>✓</Text>}
                    </View>
                    <ThemedText
                      style={[
                        styles.stepTitle,
                        { color: isStepDone ? theme.textTertiary : theme.textSecondary },
                        isStepDone && { textDecorationLine: 'line-through' },
                      ]}
                      numberOfLines={1}
                    >
                      {step.title}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* 底部信息行 */}
          <View style={styles.metaRow}>
            <ThemedText style={[styles.timeText, { color: isOverdue ? theme.danger : theme.textTertiary }]}>
              {formatDateFriendly(task.start_time)}
            </ThemedText>

            {/* 循环标签（使用主题循环标签色） */}
            {getRecurrenceLabel() ? (
              <View style={[styles.recurrenceBadge, { backgroundColor: bgColor }]}>
                <ThemedText style={[styles.recurrenceText, { color: labelColor }]}>
                  ↻ {getRecurrenceLabel()}
                </ThemedText>
              </View>
            ) : null}

            {/* 步骤进度标签 */}
            {hasSteps && (
              <View style={[styles.recurrenceBadge, { backgroundColor: bgColor }]}>
                <ThemedText style={[styles.recurrenceText, { color: taskColor }]}>
                  ✓ {completedSteps}/{totalSteps}
                </ThemedText>
              </View>
            )}

            {/* 状态标签 */}
            {getStatusLabel() ? (
              <View style={[styles.statusBadge, { backgroundColor: (isOverdue ? theme.danger : taskColor) + '20' }]}>
                <ThemedText style={[styles.statusText, { color: isOverdue ? theme.danger : taskColor }]}>
                  {getStatusLabel()}
                </ThemedText>
              </View>
            ) : null}
          </View>
        </View>

        {/* 右上：星标 + 循环暂停指示 */}
        <View style={styles.rightIndicator}>
          {onToggleStar && (
            <TouchableOpacity onPress={() => onToggleStar(task.id)} style={styles.starButton}>
              <Text style={[styles.starText, { color: task.is_starred ? '#F59E0B' : theme.textTertiary }]}>
                {task.is_starred ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          )}
          {task.recurrenceRule?.is_paused ? (
            <Text style={[styles.pausedText, { color: theme.textTertiary }]}>⏸</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      marginHorizontal: 16,
      marginVertical: 4,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
      overflow: 'hidden',
    },
    statusBar: { width: 4 },
    content: { flex: 1, paddingVertical: 12, paddingHorizontal: 14 },
    title: { fontSize: 16, fontWeight: '500', marginBottom: 2 },
    note: { fontSize: 13, marginBottom: 6 },
    // 步骤列表
    stepsContainer: { marginBottom: 6, gap: 2 },
    stepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3, paddingLeft: 12, gap: 8 },
    stepCheckbox: {
      width: 16,
      height: 16,
      borderRadius: 3,
      borderWidth: 1.5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    stepCheckmark: { fontSize: 10, color: '#FFFFFF', fontWeight: '700' },
    stepTitle: { flex: 1, fontSize: 13 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 8, flexWrap: 'wrap' },
    timeText: { fontSize: 12 },
    recurrenceBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    recurrenceText: { fontSize: 11, fontWeight: '500' },
    statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    statusText: { fontSize: 11, fontWeight: '500' },
    rightIndicator: { justifyContent: 'flex-start', alignItems: 'flex-start', paddingRight: 12, paddingTop: 10, gap: 4 },
    starButton: { padding: 4 },
    starText: { fontSize: 20 },
    pausedText: { fontSize: 14 },
    leftAction: { flex: 1, justifyContent: 'center', alignItems: 'flex-end', paddingRight: 20, marginVertical: 4, borderRadius: 10 },
    rightAction: { flex: 1, justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 20, marginVertical: 4, borderRadius: 10 },
    actionIcon: { fontSize: 18, marginBottom: 2 },
    actionText: { fontSize: 13, fontWeight: '600' },
  });
}
