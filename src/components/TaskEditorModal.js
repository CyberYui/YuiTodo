// 新建/编辑任务弹窗组件（完整版）
// 职责：提供完整的任务信息填写表单
//
// 表单内容：
// 1. 任务标题（必填）
// 2. 备注（选填）
// 3. 开始日期（可自定义，支持过去日期）
// 4. 任务颜色（8种预设色）
// 5. 步骤管理（可添加/删除/排序，可勾选）
// 6. 循环规则配置

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import {
  RecurrenceType,
  RecurrenceLabels,
  CYCLE_LIMITS,
  TaskStatus,
  getDefaultStartTime,
  getDefaultEndTime,
  TASK_COLORS,
} from '../utils/constants';
import { formatDateShort } from '../utils/dateHelpers';
import {
  createDailyRule,
  createWeeklyRule,
  createMonthlyRule,
  createYearlyRule,
  createCustomDaysRule,
  createCustomWeeksRule,
} from '../cycle/CycleRules';
import ColorPicker from './ColorPicker';
import CalendarPicker from './CalendarPicker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useReminder } from '../context/ReminderContext';

export default function TaskEditorModal({ visible, task, onClose, onSave }) {
  const { theme } = useTheme();
  const { addTask, editTask, groups } = useTasks();
  const { times: globalTimes } = useReminder();

  // 表单状态
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [startDate, setStartDate] = useState(getDefaultStartTime());
  const [endDate, setEndDate] = useState(getDefaultEndTime());
  const [hasRecurrence, setHasRecurrence] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState(RecurrenceType.DAILY);
  const [interval, setInterval] = useState(1);
  const [daysOfWeek, setDaysOfWeek] = useState([1]);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate_recurrence, setEndDateRecurrence] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  // 颜色主题（使用第一个主题作为默认）
  const [colorTheme, setColorTheme] = useState(TASK_COLORS[0]);
  // 分组选择
  const [groupId, setGroupId] = useState(0);

  // 步骤管理
  const [steps, setSteps] = useState([]);
  const [stepInput, setStepInput] = useState('');

  // 日历选择器
  const [showCalendar, setShowCalendar] = useState(false);

  // 提醒时间选择器
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [reminderTime, setReminderTime] = useState(null);

  const [editingTaskId, setEditingTaskId] = useState(null);
  const styles = createStyles(theme);

  // 星期选项
  const weekDays = [
    { value: 1, label: '一' }, { value: 2, label: '二' },
    { value: 3, label: '三' }, { value: 4, label: '四' },
    { value: 5, label: '五' }, { value: 6, label: '六' },
    { value: 7, label: '日' },
  ];

  // 初始化
  useEffect(() => {
    if (visible) {
      if (task) {
        initEditMode(task);
      } else {
        resetForm();
      }
    }
  }, [visible, task]);

  function initEditMode(t) {
    setEditingTaskId(t.id);
    setTitle(t.title);
    setNote(t.note || '');
    setStartDate(t.start_date || t.start_time);
    setEndDate(t.end_time);
    // 恢复颜色主题
    const foundTheme = TASK_COLORS.find((c) => c.bar === t.color) || TASK_COLORS[0];
    setColorTheme(foundTheme);
    setGroupId(t.group_id || 0);
    if (t.steps && t.steps.length > 0) {
      setSteps(t.steps.map((s) => ({ title: s.title, status: s.status || 'pending' })));
    }
    if (t.recurrenceRule) {
      const rule = t.recurrenceRule;
      setHasRecurrence(true);
      setRecurrenceType(rule.type);
      setInterval(rule.interval || 1);
      setIsPaused(rule.is_paused === 1 || rule.is_paused === true);
      if (rule.days_of_week) setDaysOfWeek(rule.days_of_week);
      if (rule.day_of_month) setDayOfMonth(rule.day_of_month);
      if (rule.end_date) { setHasEndDate(true); setEndDateRecurrence(rule.end_date); }
    }
    setReminderTime(t.reminder_time || null);
  }

  function resetForm() {
    setEditingTaskId(null);
    setTitle('');
    setNote('');
    setStartDate(getDefaultStartTime());
    setEndDate(getDefaultEndTime());
    setHasRecurrence(false);
    setRecurrenceType(RecurrenceType.DAILY);
    setInterval(1);
    setDaysOfWeek([1]);
    setDayOfMonth(1);
    setHasEndDate(false);
    setEndDateRecurrence(null);
    setIsPaused(false);
    setColorTheme(TASK_COLORS[0]);
    setGroupId(0);
    setSteps([]);
    setStepInput('');
    setReminderTime(null);
  }

  // 步骤操作
  function handleAddStep() {
    const trimmed = stepInput.trim();
    if (!trimmed) return;
    setSteps([...steps, { title: trimmed, status: 'pending' }]);
    setStepInput('');
  }
  function handleRemoveStep(index) {
    setSteps(steps.filter((_, i) => i !== index));
  }
  function handleMoveUp(index) {
    if (index === 0) return;
    const arr = [...steps];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    setSteps(arr);
  }
  function handleMoveDown(index) {
    if (index === steps.length - 1) return;
    const arr = [...steps];
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    setSteps(arr);
  }

  // 日期快捷选择
  function setDateQuick(daysOffset) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + daysOffset);
    setStartDate(d.getTime());
  }

  // 提醒时间覆盖
  const handleReminderTimeSet = (time) => {
    setReminderTime(time);
    setShowReminderPicker(false);
  };

  const handleReminderTimeRemove = () => {
    setReminderTime(null);
  };

  // 构建循环规则
  function buildRecurrenceRule() {
    if (!hasRecurrence) return null;
    switch (recurrenceType) {
      case RecurrenceType.DAILY: return createDailyRule();
      case RecurrenceType.WEEKLY: return createWeeklyRule(daysOfWeek);
      case RecurrenceType.MONTHLY: return createMonthlyRule(dayOfMonth);
      case RecurrenceType.YEARLY: return createYearlyRule(1, dayOfMonth);
      case RecurrenceType.CUSTOM_DAYS: return createCustomDaysRule(interval);
      case RecurrenceType.CUSTOM_WEEKS: return createCustomWeeksRule(interval);
      default: return createDailyRule();
    }
  }

  // 保存
  async function handleSave() {
    if (!title.trim()) { Alert.alert('提示', '请输入任务标题'); return; }
    const taskData = {
      title: title.trim(),
      note: note.trim(),
      startTime: startDate,
      endTime: endDate,
      startDate,
      color: colorTheme.bar,  // 使用主题的任务条颜色
      groupId,
      deadline: null,
      recurrenceRule: buildRecurrenceRule(),
      steps: steps.map((s) => s.title),
      reminderTime,
    };
    try {
      if (editingTaskId) {
        await editTask(editingTaskId, { title: taskData.title, note: taskData.note, start_time: taskData.startTime, end_time: taskData.endTime, start_date: taskData.startDate, color: taskData.color, group_id: groupId, reminder_time: reminderTime });
      } else {
        await addTask(taskData);
      }
      onSave();
    } catch (e) {
      Alert.alert('保存失败', e.message || '请重试');
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{editingTaskId ? '编辑任务' : '新建任务'}</Text>
            <TouchableOpacity onPress={onClose}><Text style={[styles.closeText, { color: theme.textSecondary }]}>✕</Text></TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* 1. 标题 */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>任务标题 *</Text>
              <TextInput style={[styles.input, { color: theme.textPrimary, borderColor: theme.separator }]} placeholder="输入任务名称..." placeholderTextColor={theme.textTertiary} value={title} onChangeText={setTitle} maxLength={100} />
            </View>

             {/* 2. 备注（富文本） */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>备注</Text>
              <TextInput style={[styles.input, styles.textArea, { color: theme.textPrimary, borderColor: theme.separator }]} placeholder="添加备注（可选）&#10;支持多行文本..." placeholderTextColor={theme.textTertiary} value={note} onChangeText={setNote} multiline numberOfLines={5} maxLength={1000} textAlignVertical="top" />
            </View>

            {/* 3. 起始日期 */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>开始日期</Text>
              <TouchableOpacity style={[styles.dateButton, { borderColor: theme.separator }]} onPress={() => setShowCalendar(true)}>
                <Text style={[styles.dateButtonText, { color: theme.textPrimary }]}>{formatDateShort(startDate)}</Text>
              </TouchableOpacity>
              <View style={styles.quickDateRow}>
                <TouchableOpacity style={[styles.quickDateBtn, { backgroundColor: theme.separator + '40' }]} onPress={() => setStartDate(new Date().setHours(0, 0, 0, 0))}>
                  <Text style={[styles.quickDateText, { color: theme.textSecondary }]}>今天</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.quickDateBtn, { backgroundColor: theme.separator + '40' }]} onPress={() => setStartDate(Date.now() + 24 * 60 * 60 * 1000)}>
                  <Text style={[styles.quickDateText, { color: theme.textSecondary }]}>明天</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.quickDateBtn, { backgroundColor: theme.separator + '40' }]} onPress={() => setShowCalendar(true)}>
                  <Text style={[styles.quickDateText, { color: theme.textSecondary }]}>更多...</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 4. 颜色主题 */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>颜色主题</Text>
              <ColorPicker selectedColor={colorTheme.bar} onSelect={setColorTheme} />
            </View>

            {/* 5. 分组选择 */}
            {groups.length > 0 && (
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>任务分组</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groupSelector}>
                  <TouchableOpacity
                    style={[styles.groupChip, { backgroundColor: groupId === 0 ? theme.primary : theme.separator + '40' }]}
                    onPress={() => setGroupId(0)}
                  >
                    <Text style={[styles.groupChipText, { color: groupId === 0 ? '#FFFFFF' : theme.textSecondary }]}>无分组</Text>
                  </TouchableOpacity>
                  {groups.map((group) => (
                    <TouchableOpacity
                      key={group.id}
                      style={[styles.groupChip, { backgroundColor: groupId === group.id ? theme.primary : theme.separator + '40' }]}
                      onPress={() => setGroupId(group.id)}
                    >
                      <Text style={[styles.groupChipText, { color: groupId === group.id ? '#FFFFFF' : theme.textSecondary }]}>
                        {group.icon} {group.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* 5. 步骤管理 */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>任务步骤（可选）</Text>
              <View style={styles.stepInputRow}>
                <TextInput style={[styles.input, styles.stepInput, { color: theme.textPrimary, borderColor: theme.separator }]} placeholder="输入步骤名称..." placeholderTextColor={theme.textTertiary} value={stepInput} onChangeText={setStepInput} onSubmitEditing={handleAddStep} returnKeyType="done" maxLength={100} />
                <TouchableOpacity style={[styles.stepAddButton, { backgroundColor: theme.primary }]} onPress={handleAddStep} activeOpacity={0.7}>
                  <Text style={styles.stepAddButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              {steps.length > 0 && (
                <View style={styles.stepList}>
                  {steps.map((step, index) => (
                    <View key={index} style={[styles.stepItem, { borderColor: theme.separator }]}>
                      <Text style={[styles.stepIndex, { color: theme.textTertiary }]}>{index + 1}.</Text>
                      <Text style={[styles.stepTitle, { color: theme.textPrimary }]} numberOfLines={1}>{step.title}</Text>
                      <TouchableOpacity onPress={() => handleMoveUp(index)} style={styles.stepAction}><Text style={[styles.stepActionText, { color: theme.textTertiary }]}>↑</Text></TouchableOpacity>
                      <TouchableOpacity onPress={() => handleMoveDown(index)} style={styles.stepAction}><Text style={[styles.stepActionText, { color: theme.textTertiary }]}>↓</Text></TouchableOpacity>
                      <TouchableOpacity onPress={() => handleRemoveStep(index)} style={styles.stepAction}><Text style={[styles.stepActionText, { color: theme.danger }]}>✕</Text></TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* 6. 循环规则 */}
            <View style={styles.fieldGroup}>
              <View style={styles.switchRow}>
                <View>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>循环任务</Text>
                  <Text style={[styles.switchHint, { color: theme.textTertiary }]}>开启后任务将按计划重复</Text>
                </View>
                <Switch value={hasRecurrence} onValueChange={setHasRecurrence} trackColor={{ false: theme.separator, true: theme.primary + '60' }} thumbColor={hasRecurrence ? theme.primary : '#f4f3f4'} />
              </View>
            </View>

            {hasRecurrence && (
              <View style={[styles.recurrenceConfig, { borderColor: theme.separator }]}>
                <Text style={[styles.subLabel, { color: theme.textSecondary }]}>循环类型</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
                  {Object.entries(RecurrenceLabels).map(([type, label]) => (
                    <TouchableOpacity key={type} style={[styles.typeChip, { backgroundColor: recurrenceType === type ? theme.primary : theme.separator + '40', borderColor: recurrenceType === type ? theme.primary : 'transparent' }]} onPress={() => setRecurrenceType(type)}>
                      <Text style={[styles.typeChipText, { color: recurrenceType === type ? '#FFFFFF' : theme.textSecondary }]}>{label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {recurrenceType === RecurrenceType.WEEKLY && (
                  <View style={styles.subField}>
                    <Text style={[styles.subLabel, { color: theme.textSecondary }]}>选择日期</Text>
                    <View style={styles.weekDayRow}>
                      {weekDays.map(({ value, label }) => (
                        <TouchableOpacity key={value} style={[styles.weekDayChip, { backgroundColor: daysOfWeek.includes(value) ? theme.primary : theme.separator + '40' }]} onPress={() => setDaysOfWeek(daysOfWeek.includes(value) ? daysOfWeek.filter((d) => d !== value) : [...daysOfWeek, value].sort())}>
                          <Text style={[styles.weekDayText, { color: daysOfWeek.includes(value) ? '#FFFFFF' : theme.textSecondary }]}>{label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
                {(recurrenceType === RecurrenceType.CUSTOM_DAYS || recurrenceType === RecurrenceType.CUSTOM_WEEKS) && (
                  <View style={styles.subField}>
                    <Text style={[styles.subLabel, { color: theme.textSecondary }]}>间隔数量（{recurrenceType === RecurrenceType.CUSTOM_DAYS ? '天' : '周'}）</Text>
                    <TextInput style={[styles.input, { color: theme.textPrimary, borderColor: theme.separator, width: 120 }]} value={interval.toString()} onChangeText={(t) => { const n = parseInt(t, 10); if (!isNaN(n) && n >= 1) setInterval(Math.min(n, CYCLE_LIMITS.MAX_INTERVAL)); }} keyboardType="number-pad" maxLength={3} />
                  </View>
                )}
              </View>
            )}

            {/* 提醒时间覆盖 */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>提醒时间</Text>
              <TouchableOpacity
                style={[styles.reminderRow, { backgroundColor: theme.cardBackground, borderColor: theme.separator }]}
                onPress={() => setShowReminderPicker(true)}
              >
                <Text style={[styles.reminderText, { color: theme.textPrimary }]}>
                  {reminderTime
                    ? `自定义: ${reminderTime}`
                    : `跟随全局 (${globalTimes.length > 0 ? globalTimes.join(', ') : '未设置'})`}
                </Text>
                {reminderTime && (
                  <TouchableOpacity onPress={handleReminderTimeRemove}>
                    <Text style={{ color: theme.danger }}>移除覆盖</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>

          <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveButtonText}>保存任务</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 日历选择器 */}
      <CalendarPicker
        visible={showCalendar}
        selectedDate={startDate}
        onSelect={(timestamp) => { setStartDate(timestamp); }}
        onClose={() => setShowCalendar(false)}
      />

      {/* 提醒时间选择器 */}
      {showReminderPicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={true}
          display="spinner"
          onChange={(event, selectedDate) => {
            setShowReminderPicker(false);
            if (event.type === 'dismissed' || !selectedDate) return;
            const hours = String(selectedDate.getHours()).padStart(2, '0');
            const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
            handleReminderTimeSet(`${hours}:${minutes}`);
          }}
        />
      )}
    </Modal>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContainer: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%', paddingBottom: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.separator },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    closeText: { fontSize: 20 },
    form: { paddingHorizontal: 20, paddingVertical: 12 },
    fieldGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
    subLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
    hint: { fontSize: 11, marginTop: 2 },
    input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
    textArea: { minHeight: 70, textAlignVertical: 'top' },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    switchHint: { fontSize: 11, marginTop: 2 },
    // 日期选择
    dateButton: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
    dateButtonText: { fontSize: 15 },
    quickDateRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
    quickDateBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
    quickDateText: { fontSize: 12, fontWeight: '500' },
    // 步骤
    stepInputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    stepInput: { flex: 1 },
    stepAddButton: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    stepAddButtonText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
    stepList: { marginTop: 8, gap: 4 },
    stepItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, gap: 8 },
    stepIndex: { fontSize: 13, fontWeight: '600', width: 20 },
    stepTitle: { flex: 1, fontSize: 14 },
    stepAction: { padding: 4, width: 24, alignItems: 'center' },
    stepActionText: { fontSize: 14, fontWeight: '600' },
    // 循环配置
    recurrenceConfig: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16 },
    typeScroll: { flexDirection: 'row', marginBottom: 12 },
    typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1 },
    typeChipText: { fontSize: 13, fontWeight: '500' },
    subField: { marginBottom: 12 },
    weekDayRow: { flexDirection: 'row', gap: 6 },
    weekDayChip: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    weekDayText: { fontSize: 14, fontWeight: '600' },
    // 保存
    saveButton: { marginHorizontal: 20, marginTop: 12, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
    saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    // 日期弹窗
    groupSelector: { flexDirection: 'row' },
    groupChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, marginRight: 8 },
    groupChipText: { fontSize: 13, fontWeight: '500' },
    datePickerTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
    datePickerRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    datePickerBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    datePickerCancel: { borderWidth: 1, borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
    // 提醒时间
    reminderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderRadius: 10,
      marginBottom: 6,
      borderWidth: 1,
    },
    reminderText: { fontSize: 14, fontWeight: '500', flex: 1 },
    sectionLabel: { fontSize: 12, fontWeight: '600', marginTop: 16, marginBottom: 8, marginLeft: 4 },
  });
}
