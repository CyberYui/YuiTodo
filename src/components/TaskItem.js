// 单个任务条目组件（带滑动删除/完成效果）
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { TaskStatus, RecurrenceLabels, TASK_COLORS } from '../utils/constants';
import { formatDateFriendly, isDateToday, isExpired } from '../utils/dateHelpers';
import ThemedText from './ThemedText';

const SWIPE_THRESHOLD = 100;

export default function TaskItem({ task, onPress, onSwipeComplete, onSwipeDelete, onToggleStep, onToggleStar }) {
  const { theme, styleConfig, taskBgEnabled, taskBgColor } = useTheme();
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
  const bgColor = taskTheme.bg;

  const showLeftBar = styleConfig?.leftBar !== false;
  const translateX = useRef(new Animated.Value(0)).current;
  const [swiping, setSwiping] = useState(false);

  function blendWithWhite(hex, whiteRatio) {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return '#FFFFFF';
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return `rgb(${Math.round(r * (1 - whiteRatio) + 255 * whiteRatio)},${Math.round(g * (1 - whiteRatio) + 255 * whiteRatio)},${Math.round(b * (1 - whiteRatio) + 255 * whiteRatio)})`;
  }

  function getCardBackground() {
    if (taskBgEnabled && taskBgColor) return blendWithWhite(taskBgColor, 0.85);
    return theme.cardBackground;
  }

  function getCardStyle() {
    const cardStyle = styleConfig?.cardStyle || 'elevated';
    const radius = styleConfig?.cardRadius || 10;
    const shadow = styleConfig?.shadow || {};
    if (cardStyle === 'bordered') return { borderRadius: radius, borderWidth: 1, borderColor: theme.separator, ...shadow };
    if (cardStyle === 'flat') return { borderRadius: radius };
    return { borderRadius: radius, ...shadow };
  }

  const resetPosition = () => { Animated.spring(translateX, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start(); };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 20,
      onPanResponderGrant: () => setSwiping(true),
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < -20 || gestureState.dx > 20) translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        setSwiping(false);
        if (gestureState.dx < -SWIPE_THRESHOLD) {
          // 左滑 → 删除
          Animated.timing(translateX, { toValue: -400, duration: 200, useNativeDriver: true }).start(() => {
            onSwipeDelete();
            resetPosition();
          });
        } else if (gestureState.dx > SWIPE_THRESHOLD) {
          // 右滑 → 完成
          Animated.timing(translateX, { toValue: 400, duration: 200, useNativeDriver: true }).start(() => {
            onSwipeComplete();
            resetPosition();
          });
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const handleStepPress = (stepId) => { if (onToggleStep) onToggleStep(task.id, stepId); };
  function getStatusLabel() { if (isDone) return '已完成'; if (isOverdue) return '已逾期'; if (isToday) return '今天'; return ''; }
  function getRecurrenceLabel() {
    if (!task.recurrenceRule) return null;
    const rule = task.recurrenceRule;
    const typeLabel = RecurrenceLabels[rule.type] || rule.type;
    if (rule.interval > 1) return `每${rule.interval}${rule.type === 'custom_weeks' ? '周' : '天'}`;
    return typeLabel;
  }

  // 滑动时左侧动作预览（右滑显示完成）
  const rightActionOpacity = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // 滑动时右侧动作预览（左滑显示删除）
  const leftActionOpacity = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.swipeContainer}>
      {/* 右侧背景（左滑时显示-删除） */}
      <View style={[styles.actionBackground, styles.actionRight, { backgroundColor: theme.swipeDeleteBg }]}>
        <Animated.View style={[styles.actionContent, { opacity: leftActionOpacity }]}>
          <Text style={[styles.actionIcon, { color: theme.danger }]}>🗑</Text>
          <Text style={[styles.actionLabel, { color: theme.danger }]}>删除</Text>
        </Animated.View>
      </View>

      {/* 左侧背景（右滑时显示-完成） */}
      <View style={[styles.actionBackground, styles.actionLeft, { backgroundColor: theme.swipeCompleteBg }]}>
        <Animated.View style={[styles.actionContent, { opacity: rightActionOpacity }]}>
          <Text style={[styles.actionIcon, { color: theme.done }]}>{hasSteps && !allStepsCompleted ? '▶' : '✓'}</Text>
          <Text style={[styles.actionLabel, { color: theme.done }]}>{hasSteps && !allStepsCompleted ? `下一步 ${completedSteps}/${totalSteps}` : '完成'}</Text>
        </Animated.View>
      </View>

      {/* 卡片内容 */}
      <Animated.View style={[{ transform: [{ translateX }] }]} {...panResponder.panHandlers}>
        <TouchableOpacity
          activeOpacity={swiping ? 1 : 0.8}
          delayLongPress={400}
          onPress={() => onPress(task)}
          onLongPress={() => onPress(task)}
          style={[styles.card, { backgroundColor: getCardBackground() }, getCardStyle(), { opacity: isDone ? 0.6 : 1 }]}
        >
          {showLeftBar && <View style={[styles.leftBar, { backgroundColor: isDone ? theme.done : taskColor }]} />}

          <View style={styles.content}>
            <ThemedText style={[styles.title, { color: theme.textPrimary, textDecorationLine: isDone ? 'line-through' : 'none' }]} numberOfLines={1}>{task.title}</ThemedText>
            {task.note ? <ThemedText style={[styles.note, { color: theme.textSecondary }]} numberOfLines={1}>{task.note}</ThemedText> : null}

            {hasSteps && (
              <View style={styles.stepsContainer}>
                {steps.map((step, index) => {
                  const isStepDone = step.status === 'completed';
                  return (
                    <TouchableOpacity key={step.id || index} style={styles.stepRow} onPress={() => handleStepPress(step.id)} activeOpacity={0.6}>
                      <View style={[styles.stepCheckbox, { borderColor: isStepDone ? theme.done : theme.textTertiary }, isStepDone && { backgroundColor: theme.done }]}>
                        {isStepDone && <Text style={styles.stepCheckmark}>✓</Text>}
                      </View>
                      <ThemedText style={[styles.stepTitle, { color: isStepDone ? theme.textTertiary : theme.textSecondary }, isStepDone && { textDecorationLine: 'line-through' }]} numberOfLines={1}>{step.title}</ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <View style={styles.metaRow}>
              <ThemedText style={[styles.timeText, { color: isOverdue ? theme.danger : theme.textTertiary }]}>{formatDateFriendly(task.start_time)}</ThemedText>
              {getRecurrenceLabel() ? (<View style={[styles.badge, { backgroundColor: bgColor }]}><ThemedText style={[styles.badgeText, { color: labelColor }]}>↻ {getRecurrenceLabel()}</ThemedText></View>) : null}
              {hasSteps && (<View style={[styles.badge, { backgroundColor: bgColor }]}><ThemedText style={[styles.badgeText, { color: taskColor }]}>✓ {completedSteps}/{totalSteps}</ThemedText></View>)}
              {getStatusLabel() ? (<View style={[styles.badge, { backgroundColor: (isOverdue ? theme.danger : taskColor) + '20' }]}><ThemedText style={[styles.badgeText, { color: isOverdue ? theme.danger : taskColor }]}>{getStatusLabel()}</ThemedText></View>) : null}
            </View>
          </View>

          <View style={styles.rightIndicator}>
            {onToggleStar && (<TouchableOpacity onPress={() => onToggleStar(task.id)} style={styles.starButton}><Text style={[styles.starText, { color: task.is_starred ? '#F59E0B' : theme.textTertiary }]}>{task.is_starred ? '★' : '☆'}</Text></TouchableOpacity>)}
            {task.recurrenceRule?.is_paused ? <Text style={[styles.pausedText, { color: theme.textTertiary }]}>⏸</Text> : null}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    swipeContainer: { marginHorizontal: 16, marginVertical: 4, borderRadius: 12, overflow: 'hidden' },
    card: { flexDirection: 'row', overflow: 'hidden' },
    leftBar: { width: 4, alignSelf: 'stretch' },
    content: { flex: 1, paddingVertical: 12, paddingHorizontal: 14 },
    title: { fontSize: 16, fontWeight: '500', marginBottom: 2 },
    note: { fontSize: 13, marginBottom: 6 },
    stepsContainer: { marginBottom: 6, gap: 2 },
    stepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3, paddingLeft: 12, gap: 8 },
    stepCheckbox: { width: 16, height: 16, borderRadius: 3, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
    stepCheckmark: { fontSize: 10, color: '#FFFFFF', fontWeight: '700' },
    stepTitle: { flex: 1, fontSize: 13 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 8, flexWrap: 'wrap' },
    timeText: { fontSize: 12 },
    badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    badgeText: { fontSize: 11, fontWeight: '500' },
    rightIndicator: { justifyContent: 'flex-start', alignItems: 'flex-start', paddingRight: 12, paddingTop: 10, gap: 4 },
    starButton: { padding: 4 },
    starText: { fontSize: 20 },
    pausedText: { fontSize: 14 },
    // 滑动操作背景
    actionBackground: { position: 'absolute', top: 0, bottom: 0, justifyContent: 'center', paddingHorizontal: 24 },
    actionLeft: { left: 0 },
    actionRight: { right: 0 },
    actionContent: { alignItems: 'center', justifyContent: 'center', gap: 4 },
    actionIcon: { fontSize: 22 },
    actionLabel: { fontSize: 13, fontWeight: '600' },
  });
}
