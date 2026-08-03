// 单个任务条目组件 v1.7.0 — 10套主题差异化支持
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { TaskStatus, RecurrenceLabels, TASK_COLORS } from '../utils/constants';
import { formatDateFriendly, isDateToday, isExpired } from '../utils/dateHelpers';
import ThemedText from './ThemedText';
import Icon from './Icon';

const SWIPE_THRESHOLD = 80;

export default function TaskItem({ task, onPress, onSwipeComplete, onSwipeDelete, onToggleStep, onToggleStar, onDragStart, showDragHandle }) {
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
  const radius = styleConfig?.cardRadius || 10;
  const showLeftBar = styleConfig?.leftBar !== false;
  const density = styleConfig?.density || 'standard';
  const divider = styleConfig?.divider === true;
  const checkboxStyle = styleConfig?.checkboxStyle || 'circle';
  const checkboxSize = styleConfig?.checkboxSize || 18;
  const checkboxRadius = styleConfig?.checkboxRadius || (checkboxStyle === 'circle' ? checkboxSize / 2 : 4);
  const progressBarHeight = styleConfig?.progressBarHeight ?? 4;
  const fontSizes = styleConfig?.fontSize || { title: 16, subtitle: 13, body: 13 };
  const lineHeight = styleConfig?.lineHeight || 1.4;
  const completedDecoration = styleConfig?.completedTextDecoration || 'line-through';
  const completedColor = styleConfig?.completedTextColor || '#999999';

  // 间距根据密度调整
  const paddingV = density === 'compact' ? 6 : density === 'spacious' ? 14 : 10;
  const paddingH = density === 'compact' ? 8 : density === 'spacious' ? 16 : 12;
  const cardSpacing = density === 'compact' ? 4 : density === 'spacious' ? 12 : 8;

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

  const rightOpacity = translateX.interpolate({ inputRange: [0, SWIPE_THRESHOLD], outputRange: [0, 1], extrapolate: 'clamp' });
  const leftOpacity = translateX.interpolate({ inputRange: [-SWIPE_THRESHOLD, 0], outputRange: [1, 0], extrapolate: 'clamp' });

  const handleStepPress = (stepId) => { if (onToggleStep) onToggleStep(task.id, stepId); };

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
    if (rule.interval > 1) return `每${rule.interval}${rule.type === 'custom_weeks' ? '周' : '天'}`;
    return typeLabel;
  }

  // 复选框渲染
  function renderCheckbox() {
    const isChecked = isDone;
    const size = checkboxSize;

    if (checkboxStyle === 'text') {
      return (
        <Text style={[styles.checkboxText, { color: isChecked ? theme.done : theme.textTertiary, fontSize: fontSizes.title }]}>
          {isChecked ? '☑' : '□'}
        </Text>
      );
    }

    return (
      <View style={[
        styles.checkbox,
        {
          width: size, height: size,
          borderRadius: checkboxRadius,
          borderWidth: isChecked ? 0 : 1.5,
          borderColor: isChecked ? theme.done : theme.textTertiary,
          backgroundColor: isChecked ? theme.done : 'transparent',
        },
      ]}>
        {isChecked && <Icon name="check" size={size * 0.7} color="#FFFFFF" />}
      </View>
    );
  }

  // 进度展示
  function renderProgress() {
    if (!hasSteps) return null;
    // 文字进度（Notion/Linear/Terminal风格）
    if (progressBarHeight === 0) {
      return (
        <ThemedText style={[styles.progressText, { color: theme.textTertiary, fontSize: fontSizes.subtitle - 2 }]}>
          {completedSteps}/{totalSteps}
        </ThemedText>
      );
    }
    // 图形进度条
    return (
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarBg, { height: progressBarHeight }]}>
          <View style={[styles.progressBarFill, { width: `${(completedSteps / totalSteps) * 100}%`, backgroundColor: taskColor, height: progressBarHeight }]} />
        </View>
        <ThemedText style={[styles.progressBarText, { color: theme.textTertiary, fontSize: fontSizes.subtitle - 2 }]}>{completedSteps}/{totalSteps}</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.swipeWrap, { marginHorizontal: cardSpacing, marginVertical: cardSpacing / 2 }]}>
      {/* 操作背景 - 全宽铺满 */}
      <View style={[styles.actionBg, styles.actionRight, { backgroundColor: theme.swipeDeleteBg, width: '100%' }]}>
        <Animated.View style={[styles.actionContent, styles.actionContentLeft, { opacity: leftOpacity }]}>
          <Icon name="delete" size={18} color={theme.danger} />
          <Text style={[styles.actionLabel, { color: theme.danger }]}>删除</Text>
        </Animated.View>
      </View>
      <View style={[styles.actionBg, styles.actionLeft, { backgroundColor: theme.swipeCompleteBg, width: '100%' }]}>
        <Animated.View style={[styles.actionContent, styles.actionContentRight, { opacity: rightOpacity }]}>
          <Icon name={hasSteps && !allStepsCompleted ? 'play' : 'checkmarkCircle'} size={18} color={theme.done} />
          <Text style={[styles.actionLabel, { color: theme.done }]}>{hasSteps && !allStepsCompleted ? '下一步' : '完成'}</Text>
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
            {/* 标题行 */}
            <View style={styles.titleRow}>
              {renderCheckbox()}
              <ThemedText
                style={[
                  styles.title,
                  {
                    color: isDone ? completedColor : theme.textPrimary,
                    fontSize: fontSizes.title,
                    lineHeight: fontSizes.title * lineHeight,
                    textDecorationLine: isDone ? completedDecoration : 'none',
                    marginLeft: checkboxStyle === 'text' ? 4 : 8,
                  },
                ]}
                numberOfLines={1}
              >
                {task.title}
              </ThemedText>
            </View>

            {/* 备注 */}
            {task.note ? (
              <ThemedText
                style={[
                  styles.note,
                  {
                    color: theme.textSecondary,
                    fontSize: fontSizes.subtitle,
                    lineHeight: fontSizes.subtitle * lineHeight,
                    marginLeft: checkboxStyle === 'text' ? 24 : checkboxSize + 8,
                  },
                ]}
                numberOfLines={1}
              >
                {task.note}
              </ThemedText>
            ) : null}

            {/* 进度条/文字进度 */}
            <View style={{ marginLeft: checkboxStyle === 'text' ? 24 : checkboxSize + 8 }}>
              {renderProgress()}
            </View>

            {/* 子任务列表 */}
            {hasSteps && (
              <View style={[styles.stepsContainer, { marginLeft: checkboxStyle === 'text' ? 20 : checkboxSize + 8 }]}>
                {steps.map((step, index) => {
                  const isStepDone = step.status === 'completed';
                  return (
                    <TouchableOpacity key={step.id || index} style={styles.stepRow} onPress={() => handleStepPress(step.id)} activeOpacity={0.6}>
                      <View style={[styles.stepCheckbox, { borderColor: isStepDone ? theme.done : theme.textTertiary, width: 14, height: 14, borderRadius: 3 }, isStepDone && { backgroundColor: theme.done }]}>
                        {isStepDone && <Icon name="check" size={10} color="#FFFFFF" />}
                      </View>
                      <ThemedText style={[styles.stepTitle, { color: isStepDone ? completedColor : theme.textSecondary, fontSize: fontSizes.subtitle, textDecorationLine: isStepDone ? completedDecoration : 'none' }]} numberOfLines={1}>{step.title}</ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* 底部状态栏 */}
            <View style={[styles.metaRow, { marginLeft: checkboxStyle === 'text' ? 24 : checkboxSize + 8 }]}>
              <ThemedText style={[styles.timeText, { color: isOverdue ? theme.overdue || theme.danger : theme.textTertiary, fontSize: fontSizes.subtitle - 1 }]}>{formatDateFriendly(task.start_time)}</ThemedText>
              {getRecurrenceLabel() ? (<View style={[styles.badge, { backgroundColor: bgColor }]}><ThemedText style={[styles.badgeText, { color: labelColor }]}>↻ {getRecurrenceLabel()}</ThemedText></View>) : null}
              {hasSteps && (<View style={[styles.badge, { backgroundColor: bgColor }]}><ThemedText style={[styles.badgeText, { color: taskColor }]}>✓ {completedSteps}/{totalSteps}</ThemedText></View>)}
              {getStatusLabel() ? (<View style={[styles.badge, { backgroundColor: (isOverdue ? theme.overdue || theme.danger : taskColor) + '20' }]}><ThemedText style={[styles.badgeText, { color: isOverdue ? theme.overdue || theme.danger : taskColor }]}>{getStatusLabel()}</ThemedText></View>) : null}
            </View>
          </View>

          {/* 右侧指示器 */}
          <View style={styles.rightIndicator}>
            {showDragHandle && onDragStart && (
              <TouchableOpacity onPressIn={() => onDragStart(task.id)} style={styles.dragHandle} delayLongPress={300}>
                <Icon name="drag" size={18} color={theme.textTertiary} />
              </TouchableOpacity>
            )}
            {onToggleStar && (<TouchableOpacity onPress={() => onToggleStar(task.id)} style={styles.starButton}><Icon name={task.is_starred ? 'starFilled' : 'star'} size={18} color={task.is_starred ? '#F59E0B' : theme.textTertiary} /></TouchableOpacity>)}
            {task.recurrenceRule?.is_paused ? <Icon name="pause" size={14} color={theme.textTertiary} /> : null}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeWrap: { borderRadius: 12, overflow: 'hidden' },
  card: { flexDirection: 'row', overflow: 'hidden' },
  leftBar: { width: 4, alignSelf: 'stretch' },
  content: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
  checkboxText: { fontFamily: 'monospace' },
  title: { fontWeight: '500', flex: 1 },
  note: { marginTop: 2 },
  progressBarContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 },
  progressBarBg: { flex: 1, backgroundColor: '#00000010', borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { borderRadius: 2 },
  progressBarText: { fontSize: 10, fontWeight: '600' },
  progressText: { marginTop: 2, fontWeight: '500' },
  stepsContainer: { marginTop: 4, gap: 2 },
  stepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2, gap: 6 },
  stepCheckbox: { justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
  stepTitle: { flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6, flexWrap: 'wrap' },
  timeText: { fontSize: 11 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: '500' },
  rightIndicator: { justifyContent: 'flex-start', alignItems: 'flex-start', paddingRight: 10, paddingTop: 8, gap: 4 },
  dragHandle: { padding: 4 },
  starButton: { padding: 4 },
  actionBg: { position: 'absolute', top: 0, bottom: 0, justifyContent: 'center' },
  actionLeft: { left: 0, alignItems: 'flex-start', paddingLeft: 24 },
  actionRight: { right: 0, alignItems: 'flex-end', paddingRight: 24 },
  actionContent: { alignItems: 'center', justifyContent: 'center', gap: 4, minWidth: 60 },
  actionContentLeft: { marginLeft: 0 },
  actionContentRight: { marginRight: 0 },
  actionIcon: { fontSize: 20 },
  actionLabel: { fontSize: 12, fontWeight: '600' },
});
