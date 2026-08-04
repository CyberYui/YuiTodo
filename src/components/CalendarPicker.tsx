/**
 * Calendar date picker — custom-drawn, supports any date (past/future).
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, addYears, subYears, isToday } from 'date-fns';

const CELL = 40;
const COLS = 7;
const WIDTH = CELL * COLS;
const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];
const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

interface Props {
  visible: boolean;
  selectedDate: number;
  onSelect: (timestamp: number) => void;
  onClose: () => void;
}

export default function CalendarPicker({ visible, selectedDate, onSelect, onClose }: Props) {
  const { theme } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(() => selectedDate ? new Date(selectedDate) : new Date());
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false);

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    const startDay = start.getDay() === 0 ? 6 : start.getDay() - 1;
    const prevDays: Date[] = [];
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(start); d.setDate(d.getDate() - (i + 1)); prevDays.push(d);
    }
    const totalCells = 42;
    const remaining = totalCells - prevDays.length - days.length;
    const nextDays: Date[] = [];
    for (let i = 0; i < remaining; i++) {
      const d = new Date(end); d.setDate(d.getDate() + (i + 1)); nextDays.push(d);
    }
    return [...prevDays, ...days, ...nextDays];
  }, [currentMonth]);

  const yearList = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 21 }, (_, i) => current - 10 + i);
  }, []);

  const handleSelectDate = useCallback((date: Date) => {
    onSelect(date.getTime());
    onClose();
  }, [onSelect, onClose]);

  const handleSelectYearMonth = useCallback((year: number, month: number) => {
    const d = new Date(currentMonth); d.setFullYear(year); d.setMonth(month);
    setCurrentMonth(d); setShowYearMonthPicker(false);
  }, [currentMonth]);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
          {!showYearMonthPicker ? (
            <>
              <View style={styles.header}>
                <TouchableOpacity onPress={() => setCurrentMonth(subYears(currentMonth, 1))}><Text style={[styles.navText, { color: theme.primary }]}>«</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}><Text style={[styles.navText, { color: theme.primary }]}>‹</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setShowYearMonthPicker(true)} style={styles.monthTitleBtn}>
                  <Text style={[styles.monthTitle, { color: theme.textPrimary }]}>{format(currentMonth, 'yyyy年M月')}</Text>
                  <Text style={{ fontSize: 10, color: theme.textTertiary }}>▼</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}><Text style={[styles.navText, { color: theme.primary }]}>›</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setCurrentMonth(addYears(currentMonth, 1))}><Text style={[styles.navText, { color: theme.primary }]}>»</Text></TouchableOpacity>
              </View>
              <View style={styles.weekRow}>
                {WEEKDAYS.map((d) => <View key={d} style={styles.weekCell}><Text style={[styles.weekText, { color: theme.textTertiary }]}>{d}</Text></View>)}
              </View>
              <View style={styles.daysGrid}>
                {calendarDays.map((date, i) => {
                  const isCurrentMonth = isSameMonth(date, currentMonth);
                  const isSelected = selectedDate && isSameDay(date, new Date(selectedDate));
                  const isTodayDate = isToday(date);
                  return (
                    <TouchableOpacity key={i} style={[styles.dayCell, !!isSelected && { backgroundColor: theme.primary, borderRadius: 20 }]}
                      onPress={() => handleSelectDate(date)} activeOpacity={0.7}>
                      <Text style={[styles.dayText, { color: !isCurrentMonth ? theme.textTertiary + '60' : theme.textPrimary }, !!isSelected && { color: '#FFFFFF', fontWeight: '700' }, isTodayDate && !isSelected && { color: theme.primary, fontWeight: '700' }]}>
                        {date.getDate()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.quickRow}>
                <TouchableOpacity style={[styles.quickBtn, { backgroundColor: theme.primary + '20' }]} onPress={() => handleSelectDate(new Date())}>
                  <Text style={[styles.quickText, { color: theme.primary }]}>今天</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.quickBtn, { backgroundColor: theme.primary + '20' }]} onPress={() => handleSelectDate(new Date(Date.now() + 86400000))}>
                  <Text style={[styles.quickText, { color: theme.primary }]}>明天</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.quickBtn, { backgroundColor: theme.separator + '40' }]} onPress={onClose}>
                  <Text style={[styles.quickText, { color: theme.textSecondary }]}>取消</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.pickerTitle, { color: theme.textPrimary }]}>选择年份和月份</Text>
              <View style={styles.yearMonthPicker}>
                <View style={styles.pickerCol}>
                  <Text style={[styles.colTitle, { color: theme.textSecondary }]}>年份</Text>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {yearList.map((y) => (
                      <TouchableOpacity key={y} style={[styles.yearItem, y === currentMonth.getFullYear() && { backgroundColor: theme.primary + '20' }]}
                        onPress={() => handleSelectYearMonth(y, currentMonth.getMonth())}>
                        <Text style={{ fontSize: 14, textAlign: 'center', color: y === currentMonth.getFullYear() ? theme.primary : theme.textPrimary }}>{y}年</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <View style={styles.pickerCol}>
                  <Text style={[styles.colTitle, { color: theme.textSecondary }]}>月份</Text>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {MONTHS.map((m, idx) => (
                      <TouchableOpacity key={idx} style={[styles.monthItem, idx === currentMonth.getMonth() && { backgroundColor: theme.primary + '20' }]}
                        onPress={() => handleSelectYearMonth(currentMonth.getFullYear(), idx)}>
                        <Text style={{ fontSize: 14, textAlign: 'center', color: idx === currentMonth.getMonth() ? theme.primary : theme.textPrimary }}>{m}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: theme.separator + '40', alignSelf: 'center', marginTop: 8 }]} onPress={() => setShowYearMonthPicker(false)}>
                <Text style={[styles.quickText, { color: theme.textSecondary }]}>返回日历</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  container: { width: WIDTH + 32, borderRadius: 16, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  navText: { fontSize: 20, fontWeight: '700', padding: 6 },
  monthTitleBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8 },
  monthTitle: { fontSize: 16, fontWeight: '700' },
  weekRow: { flexDirection: 'row', marginBottom: 8 },
  weekCell: { width: CELL, alignItems: 'center' },
  weekText: { fontSize: 12, fontWeight: '600' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: CELL, height: CELL, justifyContent: 'center', alignItems: 'center' },
  dayText: { fontSize: 14 },
  quickRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 16 },
  quickBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  quickText: { fontSize: 13, fontWeight: '600' },
  pickerTitle: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  yearMonthPicker: { flexDirection: 'row', gap: 12, height: 200 },
  pickerCol: { flex: 1 },
  colTitle: { fontSize: 13, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  yearItem: { paddingVertical: 8, paddingHorizontal: 4, borderRadius: 6, marginBottom: 2 },
  monthItem: { paddingVertical: 8, paddingHorizontal: 4, borderRadius: 6, marginBottom: 2 },
});
