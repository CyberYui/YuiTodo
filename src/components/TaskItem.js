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
  const { theme, styleConfig, isDark } = useTheme();
  const swipeableRef = useRef(null);

  const styles = createStyles(theme);

  const isDone = task.status === TaskStatus.DONE;
  const isOverdue = isExpired(task.end_time) && task.status === TaskStatus.PENDING;
  const isToday = isDateToday(task.start_time);

  const steps = task.steps || [];
  const totalSteps = steps.length;
  const completedSteps = steps.filter((s) => s.status === 'completed').length;
  const hasSteps = totalSteps > 0;
  const allStepsCompleted = hasSteps && completedSteps === totalSteps;

  const taskTheme = TASK_COLORS.find((c) => c.bar === task.color) || TASK_COLORS[0];
  const taskColor = taskTheme.bar;
  const labelColor = taskTheme.label;
  const dateColor = taskTheme.date;
  const bgColor = taskTheme.bg;

  const leftBarWidth = styleConfig?.leftBarWidth || 0;

  const renderLeftActions = () => (
    <View style={[styles.leftAction, { backgroundColor: theme.swipeDeleteBg, borderRadius: styleConfig?.cardRadius || 10 }]}>
      <Text style={[styles.actionIcon, { color: theme.danger }]}>🗑</Text>
      <Text style={[styles.actionText, { color: theme.danger }]}>删除</Text>
    </View>
  );

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

  const onSwipeableOpen = (direction) => {
    if (direction === 'left') {
      onSwipeDelete();
    } else if (direction === 'right') {
      onSwipeComplete();
    }
    setTimeout(() => swipeableRef.current?.close(), 50);
  };

  const handleStepPress = (stepId) => {
    if (onToggleStep) {
      onToggleStep(task.id, stepId);
    }
  };

  function getStatusLabel() {
    if (isDone) return '已完成';
    if (isOverdue) return '已逾期';
    if (isToday) return '今天';
    return '';
  }

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
        style={[
          styles.card,
          {
            backgroundColor: theme.cardBackground,
            opacity: isDone ? 0.6 : 1,
            borderRadius: styleConfig?.cardRadius || 10,
            ...(styleConfig?.shadowStyle || {}),
          },
        ]}
        onPress={() => onPress(task)}
        onLongPress={() => onPress(task)}
        activeOpacity={0.8}
        delayLongPress={400}
      >
        {/* 左侧彩色细条（颜色指示器，部分风格可能为 0） */}
        {leftBarWidth > 0 && (
          <View style={[styles.leftBar, { backgroundColor: isDone ? theme.done : taskColor, width: leftBarWidth }]} />
        )}

        {/* 任务内容 */}
        <View style={styles.content}>
          <ThemedText
            style={[styles.title, { color: theme.textPrimary, textDecorationLine: isDone ? 'line-through' : 'none' }]}
            numberOfLines={1}
          >
            {task.title}
          </ThemedText>

          {task.note ? (
            <ThemedText style={[styles.note, { color: theme.textSecondary }]} numberOfLines={1}>
              {task.note}
            </ThemedText>
          ) : null}

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

          <View style={styles.metaRow}>
            <ThemedText style={[styles.timeText, { color: isOverdue ? theme.danger : theme.textTertiary }]}>
              {formatDateFriendly(task.start_time)}
            </ThemedText>

            {getRecurrenceLabel() ? (
              <View style={[styles.recurrenceBadge, { backgroundColor: bgColor }]}>
                <ThemedText style={[styles.recurrenceText, { color: labelColor }]}>
                  ↻ {getRecurrenceLabel()}
                </ThemedText>
              </View>
            ) : null}

            {hasSteps && (
              <View style={[styles.recurrenceBadge, { backgroundColor: bgColor }]}>
                <ThemedText style={[styles.recurrenceText, { color: taskColor }]}>
                  ✓ {completedSteps}/{totalSteps}
                </ThemedText>
              </View>
            )}

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
    leftBar: {
      alignSelf: 'stretch',
    },
    content: { flex: 1, paddingVertical: 12, paddingHorizontal: 14 },
    title: { fontSize: 16, fontWeight: '500', marginBottom: 2 },
    note: { fontSize: 13, marginBottom: 6 },
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
