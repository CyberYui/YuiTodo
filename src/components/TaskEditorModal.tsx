/**
 * Create/Edit task modal — full task form with recurrence, steps, color, group.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { useReminder } from '../context/ReminderContext';
import { RecurrenceType, RecurrenceLabels, CYCLE_LIMITS, TaskStatus, TASK_COLORS } from '../utils/constants';
import { formatDateShort } from '../utils/dateHelpers';
import { createDailyRule, createWeeklyRule, createMonthlyRule, createYearlyRule, createCustomDaysRule, createCustomWeeksRule } from '../cycle/CycleRules';
import ColorPicker from './ColorPicker';
import CalendarPicker from './CalendarPicker';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Props {
  visible: boolean;
  task: any;
  onClose: () => void;
  onSave: () => void;
}

export default function TaskEditorModal({ visible, task, onClose, onSave }: Props) {
  const { theme } = useTheme();
  const { addTask, editTask, groups } = useTasks();
  const { times: globalTimes } = useReminder();

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [startDate, setStartDate] = useState(Date.now());
  const [endDate, setEndDate] = useState(Date.now() + 86400000);
  const [hasRecurrence, setHasRecurrence] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState(RecurrenceType.DAILY);
  const [interval, setInterval] = useState(1);
  const [daysOfWeek, setDaysOfWeek] = useState([1]);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [colorTheme, setColorTheme] = useState(TASK_COLORS[0]);
  const [groupId, setGroupId] = useState(0);
  const [steps, setSteps] = useState<Array<{ title: string; status: string }>>([]);
  const [stepInput, setStepInput] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [reminderTime, setReminderTime] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  const weekDays = [
    { value: 1, label: '一' }, { value: 2, label: '二' }, { value: 3, label: '三' },
    { value: 4, label: '四' }, { value: 5, label: '五' }, { value: 6, label: '六' }, { value: 7, label: '日' },
  ];

  useEffect(() => {
    if (visible) {
      if (task) initEditMode(task);
      else resetForm();
    }
  }, [visible, task]);

  function initEditMode(t: any) {
    setEditingTaskId(t.id);
    setTitle(t.title); setNote(t.note || '');
    setStartDate(t.start_date || t.start_time); setEndDate(t.end_time);
    const found = TASK_COLORS.find((c) => c.bar === t.color) || TASK_COLORS[0];
    setColorTheme(found); setGroupId(t.group_id || 0);
    if (t.steps?.length > 0) setSteps(t.steps.map((s: any) => ({ title: s.title, status: s.status || 'pending' })));
    if (t.recurrenceRule) {
      const rule = t.recurrenceRule;
      setHasRecurrence(true); setRecurrenceType(rule.type); setInterval(rule.interval || 1);
      if (rule.days_of_week) setDaysOfWeek(rule.days_of_week);
      if (rule.day_of_month) setDayOfMonth(rule.day_of_month);
    }
    setReminderTime(t.reminder_time || null);
  }

  function resetForm() {
    setEditingTaskId(null); setTitle(''); setNote('');
    setStartDate(Date.now()); setEndDate(Date.now() + 86400000);
    setHasRecurrence(false); setRecurrenceType(RecurrenceType.DAILY); setInterval(1);
    setDaysOfWeek([1]); setDayOfMonth(1); setColorTheme(TASK_COLORS[0]);
    setGroupId(0); setSteps([]); setStepInput(''); setReminderTime(null);
  }

  const handleAddStep = useCallback(() => {
    const trimmed = stepInput.trim();
    if (!trimmed) return;
    setSteps(prev => [...prev, { title: trimmed, status: 'pending' }]);
    setStepInput('');
  }, [stepInput]);

  const handleRemoveStep = useCallback((index: number) => {
    setSteps(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    setSteps(prev => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  }, []);

  const handleMoveDown = useCallback((index: number) => {
    setSteps(prev => {
      if (index === prev.length - 1) return prev;
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
  }, []);

  const buildRecurrenceRule = useCallback(() => {
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
  }, [hasRecurrence, recurrenceType, daysOfWeek, dayOfMonth, interval]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) { Alert.alert('提示', '请输入任务标题'); return; }
    const taskData = {
      title: title.trim(), note: note.trim(), startTime: startDate, endTime: endDate,
      startDate, color: colorTheme.bar, groupId, deadline: null,
      recurrenceRule: buildRecurrenceRule(), steps: steps.map((s) => s.title), reminderTime,
    };
    try {
      if (editingTaskId) {
        await editTask(editingTaskId, { title: taskData.title, note: taskData.note, start_time: taskData.startTime, end_time: taskData.endTime, start_date: taskData.startDate, color: taskData.color, group_id: groupId, reminder_time: reminderTime });
      } else {
        await addTask(taskData);
      }
      onSave();
    } catch (e: any) {
      Alert.alert('保存失败', e.message || '请重试');
    }
  }, [title, note, startDate, endDate, colorTheme, groupId, buildRecurrenceRule, steps, reminderTime, editingTaskId, addTask, editTask, onSave]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={[s.container, { backgroundColor: theme.cardBackground }]}>
          <View style={s.header}>
            <Text style={[s.headerTitle, { color: theme.textPrimary }]}>{editingTaskId ? '编辑任务' : '新建任务'}</Text>
            <TouchableOpacity onPress={onClose}><Text style={{ fontSize: 20, color: theme.textSecondary }}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView style={s.form} showsVerticalScrollIndicator={false}>
            <View style={s.field}>
              <Text style={[s.label, { color: theme.textSecondary }]}>任务标题 *</Text>
              <TextInput style={[s.input, { color: theme.textPrimary, borderColor: theme.separator }]} placeholder="输入任务名称..." placeholderTextColor={theme.textTertiary} value={title} onChangeText={setTitle} maxLength={100} />
            </View>
            <View style={s.field}>
              <Text style={[s.label, { color: theme.textSecondary }]}>备注</Text>
              <TextInput style={[s.input, s.textArea, { color: theme.textPrimary, borderColor: theme.separator }]} placeholder="添加备注（可选）" placeholderTextColor={theme.textTertiary} value={note} onChangeText={setNote} multiline numberOfLines={5} maxLength={1000} textAlignVertical="top" />
            </View>
            <View style={s.field}>
              <Text style={[s.label, { color: theme.textSecondary }]}>开始日期</Text>
              <TouchableOpacity style={[s.dateBtn, { borderColor: theme.separator }]} onPress={() => setShowCalendar(true)}>
                <Text style={{ color: theme.textPrimary, fontSize: 15 }}>{formatDateShort(startDate)}</Text>
              </TouchableOpacity>
              <View style={s.quickRow}>
                <TouchableOpacity style={[s.quickBtn, { backgroundColor: theme.separator + '40' }]} onPress={() => setStartDate(new Date().setHours(0, 0, 0, 0))}>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '500' }}>今天</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.quickBtn, { backgroundColor: theme.separator + '40' }]} onPress={() => setStartDate(Date.now() + 86400000)}>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '500' }}>明天</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.quickBtn, { backgroundColor: theme.separator + '40' }]} onPress={() => setShowCalendar(true)}>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '500' }}>更多...</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={s.field}>
              <Text style={[s.label, { color: theme.textSecondary }]}>颜色主题</Text>
              <ColorPicker selectedColor={colorTheme.bar} onSelect={setColorTheme} />
            </View>
            {groups.length > 0 && (
              <View style={s.field}>
                <Text style={[s.label, { color: theme.textSecondary }]}>任务分组</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity style={[s.groupChip, { backgroundColor: groupId === 0 ? theme.primary : theme.separator + '40' }]} onPress={() => setGroupId(0)}>
                    <Text style={{ color: groupId === 0 ? '#FFFFFF' : theme.textSecondary, fontSize: 13, fontWeight: '500' }}>无分组</Text>
                  </TouchableOpacity>
                  {groups.map((g) => (
                    <TouchableOpacity key={g.id} style={[s.groupChip, { backgroundColor: groupId === g.id ? theme.primary : theme.separator + '40' }]} onPress={() => setGroupId(g.id)}>
                      <Text style={{ color: groupId === g.id ? '#FFFFFF' : theme.textSecondary, fontSize: 13, fontWeight: '500' }}>{g.icon} {g.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            <View style={s.field}>
              <Text style={[s.label, { color: theme.textSecondary }]}>任务步骤（可选）</Text>
              <View style={s.stepInputRow}>
                <TextInput style={[s.input, { flex: 1, color: theme.textPrimary, borderColor: theme.separator }]} placeholder="输入步骤名称..." placeholderTextColor={theme.textTertiary} value={stepInput} onChangeText={setStepInput} onSubmitEditing={handleAddStep} returnKeyType="done" maxLength={100} />
                <TouchableOpacity style={[s.stepAddBtn, { backgroundColor: theme.primary }]} onPress={handleAddStep} activeOpacity={0.7}>
                  <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700' }}>+</Text>
                </TouchableOpacity>
              </View>
              {steps.length > 0 && (
                <View style={{ marginTop: 8, gap: 4 }}>
                  {steps.map((step, index) => (
                    <View key={index} style={[s.stepItem, { borderColor: theme.separator }]}>
                      <Text style={{ color: theme.textTertiary, fontSize: 13, fontWeight: '600', width: 20 }}>{index + 1}.</Text>
                      <Text style={{ flex: 1, color: theme.textPrimary, fontSize: 14 }} numberOfLines={1}>{step.title}</Text>
                      <TouchableOpacity onPress={() => handleMoveUp(index)} style={{ padding: 4, width: 24, alignItems: 'center' }}><Text style={{ color: theme.textTertiary, fontSize: 14, fontWeight: '600' }}>↑</Text></TouchableOpacity>
                      <TouchableOpacity onPress={() => handleMoveDown(index)} style={{ padding: 4, width: 24, alignItems: 'center' }}><Text style={{ color: theme.textTertiary, fontSize: 14, fontWeight: '600' }}>↓</Text></TouchableOpacity>
                      <TouchableOpacity onPress={() => handleRemoveStep(index)} style={{ padding: 4, width: 24, alignItems: 'center' }}><Text style={{ color: theme.danger, fontSize: 14, fontWeight: '600' }}>✕</Text></TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
            <View style={s.field}>
              <View style={s.switchRow}>
                <View><Text style={[s.label, { color: theme.textSecondary }]}>循环任务</Text><Text style={{ fontSize: 11, color: theme.textTertiary, marginTop: 2 }}>开启后任务将按计划重复</Text></View>
                <Switch value={hasRecurrence} onValueChange={setHasRecurrence} trackColor={{ false: theme.separator, true: theme.primary + '60' }} thumbColor={hasRecurrence ? theme.primary : '#f4f3f4'} />
              </View>
            </View>
            {hasRecurrence && (
              <View style={[s.recurrenceConfig, { borderColor: theme.separator }]}>
                <Text style={[s.subLabel, { color: theme.textSecondary }]}>循环类型</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  {Object.entries(RecurrenceLabels).map(([type, label]) => (
                    <TouchableOpacity key={type} style={[s.typeChip, { backgroundColor: recurrenceType === type ? theme.primary : theme.separator + '40', borderColor: recurrenceType === type ? theme.primary : 'transparent' }]} onPress={() => setRecurrenceType(type as RecurrenceType)}>
                      <Text style={{ color: recurrenceType === type ? '#FFFFFF' : theme.textSecondary, fontSize: 13, fontWeight: '500' }}>{label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {recurrenceType === RecurrenceType.WEEKLY && (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={[s.subLabel, { color: theme.textSecondary }]}>选择日期</Text>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {weekDays.map(({ value, label }) => (
                        <TouchableOpacity key={value} style={{ width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', backgroundColor: daysOfWeek.includes(value) ? theme.primary : theme.separator + '40' }}
                          onPress={() => setDaysOfWeek(daysOfWeek.includes(value) ? daysOfWeek.filter((d) => d !== value) : [...daysOfWeek, value].sort())}>
                          <Text style={{ color: daysOfWeek.includes(value) ? '#FFFFFF' : theme.textSecondary, fontSize: 14, fontWeight: '600' }}>{label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
                {(recurrenceType === RecurrenceType.CUSTOM_DAYS || recurrenceType === RecurrenceType.CUSTOM_WEEKS) && (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={[s.subLabel, { color: theme.textSecondary }]}>间隔数量（{recurrenceType === RecurrenceType.CUSTOM_DAYS ? '天' : '周'}）</Text>
                    <TextInput style={[s.input, { color: theme.textPrimary, borderColor: theme.separator, width: 120 }]} value={interval.toString()} onChangeText={(t) => { const n = parseInt(t, 10); if (!isNaN(n) && n >= 1) setInterval(Math.min(n, CYCLE_LIMITS.MAX_INTERVAL)); }} keyboardType="number-pad" maxLength={3} />
                  </View>
                )}
              </View>
            )}
            <View style={s.field}>
              <Text style={[s.label, { color: theme.textSecondary }]}>提醒时间</Text>
              <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: theme.separator }} onPress={() => setShowReminderPicker(true)}>
                <Text style={{ color: theme.textPrimary, fontSize: 14, fontWeight: '500', flex: 1 }}>
                  {reminderTime ? `自定义: ${reminderTime}` : `跟随全局 (${globalTimes.length > 0 ? globalTimes.join(', ') : '未设置'})`}
                </Text>
                {reminderTime && <TouchableOpacity onPress={() => setReminderTime(null)}><Text style={{ color: theme.danger }}>移除</Text></TouchableOpacity>}
              </TouchableOpacity>
            </View>
          </ScrollView>
          <TouchableOpacity style={[s.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSave} activeOpacity={0.8}>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>保存任务</Text>
          </TouchableOpacity>
        </View>
      </View>
      <CalendarPicker visible={showCalendar} selectedDate={startDate} onSelect={(ts) => { setStartDate(ts); }} onClose={() => setShowCalendar(false)} />
      {showReminderPicker && (
        <DateTimePicker value={new Date()} mode="time" is24Hour display="spinner"
          onChange={(event, date) => {
            setShowReminderPicker(false);
            if (event.type === 'dismissed' || !date) return;
            setReminderTime(`${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`);
          }} />
      )}
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%', paddingBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  form: { paddingHorizontal: 20, paddingVertical: 12 },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  subLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  textArea: { minHeight: 70, textAlignVertical: 'top' },
  dateBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  quickRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  quickBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
  stepInputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  stepAddBtn: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  stepItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, gap: 8 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recurrenceConfig: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  groupChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, marginRight: 8 },
  saveBtn: { marginHorizontal: 20, marginTop: 12, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
});
