// 单个任务条目组件 v1.6.0
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { TaskStatus, RecurrenceLabels, TASK_COLORS } from '../utils/constants';
import { formatDateFriendly, isDateToday, isExpired } from '../utils/dateHelpers';
import ThemedText from './ThemedText';

const SWIPE_THRESHOLD = 80;

export default function TaskItem({ task, onPress, onSwipeComplete, onSwipeDelete, onToggleStep, onToggleStar }) {
  const { theme, styleConfig, taskBgEnabled, taskBgColor } = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const [swiping, setSwiping] = useState(false);

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

  // 主题属性
  const cardStyle = styleConfig?.cardStyle || 'elevated';
  const radius = styleConfig?.radius || 10;
  const showLeftBar = styleConfig?.leftBar !== false;
  const density = styleConfig?.density || 'standard';
  const divider = styleConfig?.divider === true;

  // 间距根据密度调整
  const paddingV = density === 'compact' ? 8 : density === 'spacious' ? 14 : 10;
  const paddingH = density === 'compact' ? 10 : density === 'spacious' ? 16 : 12;

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
    const shadow = styleConfig?.shadow !== false;
    switch (cardStyle) {
      case 'bordered': return { borderRadius: radius, borderWidth: 1, borderColor: theme.separator };
      case 'glass': return { borderRadius: radius, borderWidth: 1, borderColor: theme.separator + '80', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 };
      case 'lined': return { borderRadius: radius, borderBottomWidth: 2, borderColor: theme.separator };
      case 'flat': return { borderRadius: radius };
      default: return { borderRadius: radius, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 };
    }
  }

  const resetPosition = () => { Animated.spring(translateX, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start(); };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dy) < 15,
      onPanResponderGrant: () => setSwiping(true),
      onPanResponderMove: (_, g) => { translateX.setValue(g.dx); },
      onPanResponderRelease: (_, g) => {
        setSwiping(false);
        if (g.dx < -SWIPE_THRESHOLD) {
          Animated.timing(translateX, { toValue: -400, duration: 180, useNativeDriver: true }).start(() => { onSwipeDelete(); resetPosition(); });
        } else if (g.dx > SWIPE_THRESHOLD) {
          Animated.timing(translateX, { toValue: 400, duration: 180, useNativeDriver: true }).start(() => { onSwipeComplete(); resetPosition(); });
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  // 滑动时操作文字渐显
  const rightOpacity = translateX.interpolate({ inputRange: [0, SWIPE_THRESHOLD], outputRange: [0, 1], extrapolate: 'clamp' });
  const leftOpacity = translateX.interpolate({ inputRange: [-SWIPE_THRESHOLD, 0], outputRange: [1, 0], extrapolate: 'clamp' });

  const handleStepPress = (stepId) => { if (onToggleStep) onToggleStep(task.id, stepId); };
  function getStatusLabel() { if (isDone) return '已完成'; if (isOverdue) return '已逾期'; if (isToday) return '今天'; return ''; }
  function getRecurrenceLabel() {
    if (!task.recurrenceRule) return null;
    const rule = task.recurrenceRule;
    const typeLabel = RecurrenceLabels[rule.type] || rule.type;
    if (rule.interval > 1) return `每${rule.interval}${rule.type === 'custom_weeks' ? '周' : '天'}`;
    return typeLabel;
  }

  return (
    <View style={styles.swipeWrap}>
      {/* 操作背景 */}
      <View style={[styles.actionBg, styles.actionRight, { backgroundColor: theme.swipeDeleteBg }]}>
        <Animated.View style={[styles.actionContent, { opacity: leftOpacity }]}>
          <Text style={[styles.actionIcon, { color: theme.danger }]}>🗑</Text>
          <Text style={[styles.actionLabel, { color: theme.danger }]}>删除</Text>
        </Animated.View>
      </View>
      <View style={[styles.actionBg, styles.actionLeft, { backgroundColor: theme.swipeCompleteBg }]}>
        <Animated.View style={[styles.actionContent, { opacity: rightOpacity }]}>
          <Text style={[styles.actionIcon, { color: theme.done }]}>{hasSteps && !allStepsCompleted ? '▶' : '✓'}</Text>
          <Text style={[styles.actionLabel, { color: theme.done }]}>{hasSteps && !allStepsCompleted ? `下一步` : '完成'}</Text>
        </Animated.View>
      </View>

      {/* 卡片 */}
      <Animated.View style={[{ transform: [{ translateX }] }]} {...panResponder.panHandlers}>
        <TouchableOpacity
          activeOpacity={swiping ? 1 : 0.8}
          delayLongPress={400}
          onPress={() => onPress(task)}
          onLongPress={() => onPress(task)}
          style={[
            styles.card,
            { backgroundColor: getCardBackground() },
            getCardStyle(),
            { opacity: isDone ? 0.6 : 1 },
            divider && { borderBottomWidth: 1, borderBottomColor: theme.separator },
          ]}
        >
          {showLeftBar && <View style={[styles.leftBar, { backgroundColor: isDone ? theme.done : taskColor }]} />}

          <View style={[styles.content, { paddingVertical: paddingV, paddingHorizontal: paddingH }]}>
            <ThemedText style={[styles.title, { color: theme.textPrimary, textDecorationLine: isDone ? 'line-through' : 'none' }]} numberOfLines={1}>{task.title}</ThemedText>
            {task.note ? <ThemedText style={[styles.note, { color: theme.textSecondary }]} numberOfLines={1}>{task.note}</ThemedText> : null}

            {/* 子任务进度条 */}
            {hasSteps && (
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${(completedSteps / totalSteps) * 100}%`, backgroundColor: taskColor }]} />
                </View>
                <ThemedText style={[styles.progressBarText, { color: theme.textTertiary }]}>{completedSteps}/{totalSteps}</ThemedText>
              </View>
            )}

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

const styles = StyleSheet.create({
  swipeWrap: { marginHorizontal: 16, marginVertical: 3, borderRadius: 12, overflow: 'hidden' },
  card: { flexDirection: 'row', overflow: 'hidden' },
  leftBar: { width: 4, alignSelf: 'stretch' },
  content: { flex: 1 },
  title: { fontSize: 16, fontWeight: '500', marginBottom: 2 },
  note: { fontSize: 13, marginBottom: 4 },
    progressBarContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
    progressBarBg: { flex: 1, height: 4, backgroundColor: '#00000010', borderRadius: 2, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 2 },
    progressBarText: { fontSize: 11, fontWeight: '600' },
    stepsContainer: { marginBottom: 4, gap: 2 },
  stepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2, paddingLeft: 12, gap: 8 },
  stepCheckbox: { width: 16, height: 16, borderRadius: 3, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  stepCheckmark: { fontSize: 10, color: '#FFFFFF', fontWeight: '700' },
  stepTitle: { flex: 1, fontSize: 13 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 8, flexWrap: 'wrap' },
  timeText: { fontSize: 12 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 11, fontWeight: '500' },
  rightIndicator: { justifyContent: 'flex-start', alignItems: 'flex-start', paddingRight: 10, paddingTop: 8, gap: 4 },
  starButton: { padding: 4 },
  starText: { fontSize: 18 },
  pausedText: { fontSize: 14 },
  actionBg: { position: 'absolute', top: 0, bottom: 0, justifyContent: 'center', paddingHorizontal: 24 },
  actionLeft: { left: 0 },
  actionRight: { right: 0 },
  actionContent: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  actionIcon: { fontSize: 20 },
  actionLabel: { fontSize: 12, fontWeight: '600' },
});
