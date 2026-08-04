/**
 * Single task item component — theme-aware, swipe-enabled.
 */

import React, { useRef, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { TaskStatus, RecurrenceLabels, TASK_COLORS } from '../utils/constants';
import { formatDateFriendly, isDateToday, isExpired } from '../utils/dateHelpers';
import { TaskWithRelations } from '../types';
import { SWIPE_THRESHOLD } from '../utils/constants';
import ThemedText from './ThemedText';
import Icon from './Icon';

interface Props {
  task: TaskWithRelations;
  onPress: (task: TaskWithRelations) => void;
  onSwipeComplete: () => void;
  onSwipeDelete: () => void;
  onToggleStep: (taskId: number, stepId: number) => void;
  onToggleStar: (taskId: number) => void;
  onDragStart: (taskId: number) => void;
  showDragHandle: boolean;
}

export default function TaskItem({ task, onPress, onSwipeComplete, onSwipeDelete, onToggleStep, onToggleStar, onDragStart, showDragHandle }: Props) {
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

  const taskTheme = useMemo(() => TASK_COLORS.find((c) => c.bar === task.color) || TASK_COLORS[0], [task.color]);
  const taskColor = taskTheme.bar;
  const labelColor = taskTheme.label;
  const bgColor = taskTheme.bg;

  const radius = styleConfig?.cardRadius || 10;
  const showLeftBar = styleConfig?.leftBar !== false;
  const density = styleConfig?.density || 'standard';
  const checkboxStyle = styleConfig?.checkboxStyle || 'circle';
  const checkboxSize = styleConfig?.checkboxSize || 18;
  const checkboxRadius = styleConfig?.checkboxRadius || (checkboxStyle === 'circle' ? checkboxSize / 2 : 4);
  const progressBarHeight = styleConfig?.progressBarHeight ?? 4;
  const fontSizes = styleConfig?.fontSize || { title: 16, subtitle: 13, body: 13 };
  const lineHeight = styleConfig?.lineHeight || 1.4;
  const completedDecoration = styleConfig?.completedTextDecoration || 'line-through';
  const completedColor = styleConfig?.completedTextColor || '#999999';

  const paddingV = density === 'compact' ? 6 : density === 'spacious' ? 14 : 10;
  const paddingH = density === 'compact' ? 8 : density === 'spacious' ? 16 : 12;
  const cardSpacing = density === 'compact' ? 4 : density === 'spacious' ? 12 : 8;

  const resetPosition = useCallback(() => {
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
  }, [translateX]);

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

  const handleStepPress = useCallback((stepId: number) => {
    if (onToggleStep) onToggleStep(task.id, stepId);
  }, [onToggleStep, task.id]);

  const getStatusLabel = useCallback((): string => {
    if (isDone) return '已完成';
    if (isOverdue) return '已逾期';
    if (isToday) return '今天';
    return '';
  }, [isDone, isOverdue, isToday]);

  const getRecurrenceLabel = useCallback((): string | null => {
    if (!task.recurrenceRule) return null;
    const rule = task.recurrenceRule;
    const typeLabel = RecurrenceLabels[rule.type] || rule.type;
    if (rule.interval > 1) return `每${rule.interval}${rule.type === 'custom_weeks' ? '周' : '天'}`;
    return typeLabel;
  }, [task.recurrenceRule]);

  const blendWithWhite = useCallback((hex: string, whiteRatio: number): string => {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return '#FFFFFF';
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return `rgb(${Math.round(r * (1 - whiteRatio) + 255 * whiteRatio)},${Math.round(g * (1 - whiteRatio) + 255 * whiteRatio)},${Math.round(b * (1 - whiteRatio) + 255 * whiteRatio)})`;
  }, []);

  const getCardBackground = useCallback((): string => {
    if (taskBgEnabled && taskBgColor) return blendWithWhite(taskBgColor, 0.85);
    return theme.cardBackground;
  }, [taskBgEnabled, taskBgColor, blendWithWhite, theme.cardBackground]);

  const renderCheckbox = () => {
    const isChecked = isDone;
    if (checkboxStyle === 'text') {
      return <Text style={{ color: isChecked ? theme.done : theme.textTertiary, fontSize: fontSizes.title }}>{isChecked ? '☑' : '□'}</Text>;
    }
    return (
      <View style={{
        width: checkboxSize, height: checkboxSize, borderRadius: checkboxRadius,
        borderWidth: isChecked ? 0 : 1.5, borderColor: isChecked ? theme.done : theme.textTertiary,
        backgroundColor: isChecked ? theme.done : 'transparent', justifyContent: 'center', alignItems: 'center',
      }}>
        {isChecked && <Icon name="check" size={checkboxSize * 0.7} color="#FFFFFF" />}
      </View>
    );
  };

  const renderProgress = () => {
    if (!hasSteps) return null;
    if (progressBarHeight === 0) {
      return <ThemedText style={{ color: theme.textTertiary, fontSize: fontSizes.subtitle - 2, marginTop: 2, fontWeight: '500' }}>{completedSteps}/{totalSteps}</ThemedText>;
    }
    return (
      <View style={s.progressBarContainer}>
        <View style={[s.progressBarBg, { height: progressBarHeight }]}>
          <View style={{ width: `${(completedSteps / totalSteps) * 100}%`, backgroundColor: taskColor, height: progressBarHeight, borderRadius: 2 }} />
        </View>
        <ThemedText style={{ color: theme.textTertiary, fontSize: fontSizes.subtitle - 2, fontWeight: '600' }}>{completedSteps}/{totalSteps}</ThemedText>
      </View>
    );
  };

  return (
    <View style={{ marginHorizontal: cardSpacing, marginVertical: cardSpacing / 2, borderRadius: 12, overflow: 'hidden' }}>
      <View style={[s.actionBg, s.actionRight, { backgroundColor: theme.swipeDeleteBg, width: '100%' }]}>
        <Animated.View style={[s.actionContent, s.actionContentLeft, { opacity: leftOpacity }]}>
          <Icon name="delete" size={18} color={theme.danger} />
          <Text style={[s.actionLabel, { color: theme.danger }]}>删除</Text>
        </Animated.View>
      </View>
      <View style={[s.actionBg, s.actionLeft, { backgroundColor: theme.swipeCompleteBg, width: '100%' }]}>
        <Animated.View style={[s.actionContent, s.actionContentRight, { opacity: rightOpacity }]}>
          <Icon name={hasSteps && !allStepsCompleted ? 'play' : 'checkmarkCircle'} size={18} color={theme.done} />
          <Text style={[s.actionLabel, { color: theme.done }]}>{hasSteps && !allStepsCompleted ? '下一步' : '完成'}</Text>
        </Animated.View>
      </View>

      <Animated.View style={[{ transform: [{ translateX }] }]} {...panResponder.panHandlers}>
        <TouchableOpacity activeOpacity={swiping ? 1 : 0.8} delayLongPress={400} onPress={() => onPress(task)} onLongPress={() => onPress(task)}
          style={[s.card, { backgroundColor: getCardBackground(), borderRadius: radius, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }, { opacity: isDone ? 0.6 : 1 }]}>
          {showLeftBar && <View style={[s.leftBar, { backgroundColor: isDone ? theme.done : taskColor }]} />}
          <View style={{ flex: 1, paddingVertical: paddingV, paddingHorizontal: paddingH }}>
            <View style={s.titleRow}>
              {renderCheckbox()}
              <ThemedText style={{
                color: isDone ? completedColor : theme.textPrimary, fontSize: fontSizes.title,
                lineHeight: fontSizes.title * lineHeight, textDecorationLine: isDone ? completedDecoration as 'line-through' : 'none',
                marginLeft: checkboxStyle === 'text' ? 4 : 8, fontWeight: '500', flex: 1,
              }} numberOfLines={1}>{task.title}</ThemedText>
            </View>
            {task.note ? (
              <ThemedText style={{ color: theme.textSecondary, fontSize: fontSizes.subtitle, lineHeight: fontSizes.subtitle * lineHeight, marginTop: 2, marginLeft: checkboxStyle === 'text' ? 24 : checkboxSize + 8 }} numberOfLines={1}>{task.note}</ThemedText>
            ) : null}
            <View style={{ marginLeft: checkboxStyle === 'text' ? 24 : checkboxSize + 8 }}>{renderProgress()}</View>
            {hasSteps && (
              <View style={{ marginTop: 4, gap: 2, marginLeft: checkboxStyle === 'text' ? 20 : checkboxSize + 8 }}>
                {steps.map((step) => {
                  const isStepDone = step.status === 'completed';
                  return (
                    <TouchableOpacity key={step.id} style={s.stepRow} onPress={() => handleStepPress(step.id)} activeOpacity={0.6}>
                      <View style={{ width: 14, height: 14, borderRadius: 3, borderWidth: 1.5, borderColor: isStepDone ? theme.done : theme.textTertiary, backgroundColor: isStepDone ? theme.done : 'transparent', justifyContent: 'center', alignItems: 'center' }}>
                        {isStepDone && <Icon name="check" size={10} color="#FFFFFF" />}
                      </View>
                      <ThemedText style={{ flex: 1, color: isStepDone ? completedColor : theme.textSecondary, fontSize: fontSizes.subtitle, textDecorationLine: isStepDone ? completedDecoration as 'line-through' : 'none' }} numberOfLines={1}>{step.title}</ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            <View style={[s.metaRow, { marginLeft: checkboxStyle === 'text' ? 24 : checkboxSize + 8 }]}>
              <ThemedText style={{ color: isOverdue ? theme.overdue || theme.danger : theme.textTertiary, fontSize: fontSizes.subtitle - 1 }}>{formatDateFriendly(task.start_time)}</ThemedText>
              {getRecurrenceLabel() ? (<View style={[s.badge, { backgroundColor: bgColor }]}><ThemedText style={{ color: labelColor, fontSize: 10, fontWeight: '500' }}>↻ {getRecurrenceLabel()}</ThemedText></View>) : null}
              {hasSteps && (<View style={[s.badge, { backgroundColor: bgColor }]}><ThemedText style={{ color: taskColor, fontSize: 10, fontWeight: '500' }}>✓ {completedSteps}/{totalSteps}</ThemedText></View>)}
              {getStatusLabel() ? (<View style={[s.badge, { backgroundColor: (isOverdue ? theme.overdue || theme.danger : taskColor) + '20' }]}><ThemedText style={{ color: isOverdue ? theme.overdue || theme.danger : taskColor, fontSize: 10, fontWeight: '500' }}>{getStatusLabel()}</ThemedText></View>) : null}
            </View>
          </View>
          <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start', paddingRight: 10, paddingTop: 8, gap: 4 }}>
            {showDragHandle && onDragStart && (
              <TouchableOpacity onPressIn={() => onDragStart(task.id)} style={{ padding: 4 }} delayLongPress={300}>
                <Icon name="drag" size={18} color={theme.textTertiary} />
              </TouchableOpacity>
            )}
            {onToggleStar && (<TouchableOpacity onPress={() => onToggleStar(task.id)} style={{ padding: 4 }}><Icon name={task.is_starred ? 'starFilled' : 'star'} size={18} color={task.is_starred ? '#F59E0B' : theme.textTertiary} /></TouchableOpacity>)}
            {task.recurrenceRule?.is_paused ? <Icon name="pause" size={14} color={theme.textTertiary} /> : null}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', overflow: 'hidden' },
  leftBar: { width: 4, alignSelf: 'stretch' },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  stepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2, gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  progressBarContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 },
  progressBarBg: { flex: 1, backgroundColor: '#00000010', borderRadius: 2, overflow: 'hidden' },
  actionBg: { position: 'absolute', top: 0, bottom: 0, justifyContent: 'center' },
  actionLeft: { left: 0, alignItems: 'flex-start', paddingLeft: 24 },
  actionRight: { right: 0, alignItems: 'flex-end', paddingRight: 24 },
  actionContent: { alignItems: 'center', justifyContent: 'center', gap: 4, minWidth: 60 },
  actionContentLeft: { marginLeft: 0 },
  actionContentRight: { marginRight: 0 },
  actionLabel: { fontSize: 12, fontWeight: '600' },
});
