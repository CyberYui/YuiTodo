// 日历日期选择器组件（支持年月快速跳转）
// 自绘日历UI，支持选择任意日期（过去/未来）

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, addYears, subYears, isToday } from 'date-fns';

const CALENDAR_CELL_SIZE = 40;
const CALENDAR_COLS = 7;
const CALENDAR_WIDTH = CALENDAR_CELL_SIZE * CALENDAR_COLS;
const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];
const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export default function CalendarPicker({ visible, selectedDate, onSelect, onClose }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = selectedDate ? new Date(selectedDate) : new Date();
    return isNaN(d.getTime()) ? new Date() : d;
  });
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false);

  const calendarYear = currentMonth.getFullYear();
  const calendarMonth = currentMonth.getMonth();

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    const startDay = start.getDay() === 0 ? 6 : start.getDay() - 1;
    const prevDays = [];
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(start);
      d.setDate(d.getDate() - (i + 1));
      prevDays.push(d);
    }

    const totalCells = 42;
    const remaining = totalCells - prevDays.length - days.length;
    const nextDays = [];
    for (let i = 0; i < remaining; i++) {
      const d = new Date(end);
      d.setDate(d.getDate() + (i + 1));
      nextDays.push(d);
    }

    return [...prevDays, ...days, ...nextDays];
  }, [currentMonth]);

  const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToPrevYear = () => setCurrentMonth(subYears(currentMonth, 1));
  const goToNextYear = () => setCurrentMonth(addYears(currentMonth, 1));

  const handleSelectDate = (date) => {
    onSelect(date.getTime());
    onClose();
  };

  const handleSelectYearMonth = (year, month) => {
    const d = new Date(currentMonth);
    d.setFullYear(year);
    d.setMonth(month);
    setCurrentMonth(d);
    setShowYearMonthPicker(false);
  };

  // 年份范围：前后10年
  const yearList = useMemo(() => {
    const current = new Date().getFullYear();
    const years = [];
    for (let y = current - 10; y <= current + 10; y++) {
      years.push(y);
    }
    return years;
  }, []);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
          {!showYearMonthPicker ? (
            <>
              {/* 标题栏：年月 + 切换 */}
              <View style={styles.header}>
                <TouchableOpacity onPress={goToPrevYear} style={styles.navButton}>
                  <Text style={[styles.navText, { color: theme.primary }]}>«</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={goToPrevMonth} style={styles.navButton}>
                  <Text style={[styles.navText, { color: theme.primary }]}>‹</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.monthTitleButton}
                  onPress={() => setShowYearMonthPicker(true)}
                >
                  <Text style={[styles.monthTitle, { color: theme.textPrimary }]}>
                    {format(currentMonth, 'yyyy年M月')}
                  </Text>
                  <Text style={[styles.dropdownIcon, { color: theme.textTertiary }]}>▼</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
                  <Text style={[styles.navText, { color: theme.primary }]}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={goToNextYear} style={styles.navButton}>
                  <Text style={[styles.navText, { color: theme.primary }]}>»</Text>
                </TouchableOpacity>
              </View>

              {/* 星期标题行 */}
              <View style={styles.weekRow}>
                {WEEKDAYS.map((day) => (
                  <View key={day} style={styles.weekCell}>
                    <Text style={[styles.weekText, { color: theme.textTertiary }]}>{day}</Text>
                  </View>
                ))}
              </View>

              {/* 日期网格 */}
              <View style={styles.daysGrid}>
                {calendarDays.map((date, index) => {
                  const isCurrentMonth = isSameMonth(date, currentMonth);
                  const isSelected = selectedDate && isSameDay(date, new Date(selectedDate));
                  const isTodayDate = isToday(date);

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dayCell,
                        isSelected && { backgroundColor: theme.primary, borderRadius: 20 },
                      ]}
                      onPress={() => handleSelectDate(date)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          { color: !isCurrentMonth ? theme.textTertiary + '60' : theme.textPrimary },
                          isSelected && { color: '#FFFFFF', fontWeight: '700' },
                          isTodayDate && !isSelected && { color: theme.primary, fontWeight: '700' },
                        ]}
                      >
                        {date.getDate()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 快捷按钮 */}
              <View style={styles.quickButtons}>
                <TouchableOpacity
                  style={[styles.quickBtn, { backgroundColor: theme.primary + '20' }]}
                  onPress={() => handleSelectDate(new Date())}
                >
                  <Text style={[styles.quickBtnText, { color: theme.primary }]}>今天</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickBtn, { backgroundColor: theme.primary + '20' }]}
                  onPress={() => handleSelectDate(new Date(Date.now() + 24 * 60 * 60 * 1000))}
                >
                  <Text style={[styles.quickBtnText, { color: theme.primary }]}>明天</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickBtn, { backgroundColor: theme.separator + '40' }]}
                  onPress={onClose}
                >
                  <Text style={[styles.quickBtnText, { color: theme.textSecondary }]}>取消</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* 年月快速选择器 */}
              <Text style={[styles.pickerTitle, { color: theme.textPrimary }]}>选择年份和月份</Text>
              <View style={styles.yearMonthPicker}>
                <View style={styles.pickerColumn}>
                  <Text style={[styles.pickerColumnTitle, { color: theme.textSecondary }]}>年份</Text>
                  <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                    {yearList.map((y) => (
                      <TouchableOpacity
                        key={y}
                        style={[styles.yearItem, y === calendarYear && { backgroundColor: theme.primary + '20' }]}
                        onPress={() => handleSelectYearMonth(y, calendarMonth)}
                      >
                        <Text style={[styles.yearText, { color: y === calendarYear ? theme.primary : theme.textPrimary }]}>
                          {y}年
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <View style={styles.pickerColumn}>
                  <Text style={[styles.pickerColumnTitle, { color: theme.textSecondary }]}>月份</Text>
                  <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                    {MONTHS.map((m, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.monthItem, idx === calendarMonth && { backgroundColor: theme.primary + '20' }]}
                        onPress={() => handleSelectYearMonth(calendarYear, idx)}
                      >
                        <Text style={[styles.monthText, { color: idx === calendarMonth ? theme.primary : theme.textPrimary }]}>
                          {m}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.quickBtn, { backgroundColor: theme.separator + '40', alignSelf: 'center', marginTop: 8 }]}
                onPress={() => setShowYearMonthPicker(false)}
              >
                <Text style={[styles.quickBtnText, { color: theme.textSecondary }]}>返回日历</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    container: { width: CALENDAR_WIDTH + 32, borderRadius: 16, padding: 16 },
    header: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    navButton: { padding: 6 },
    navText: { fontSize: 20, fontWeight: '700' },
    monthTitleButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8 },
    monthTitle: { fontSize: 16, fontWeight: '700' },
    dropdownIcon: { fontSize: 10 },
    weekRow: { flexDirection: 'row', marginBottom: 8 },
    weekCell: { width: CALENDAR_CELL_SIZE, alignItems: 'center' },
    weekText: { fontSize: 12, fontWeight: '600' },
    daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayCell: { width: CALENDAR_CELL_SIZE, height: CALENDAR_CELL_SIZE, justifyContent: 'center', alignItems: 'center' },
    dayText: { fontSize: 14 },
    quickButtons: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 16 },
    quickBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    quickBtnText: { fontSize: 13, fontWeight: '600' },
    // 年月选择器样式
    pickerTitle: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
    yearMonthPicker: { flexDirection: 'row', gap: 12, height: 200 },
    pickerColumn: { flex: 1 },
    pickerColumnTitle: { fontSize: 13, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
    pickerScroll: { flex: 1 },
    yearItem: { paddingVertical: 8, paddingHorizontal: 4, borderRadius: 6, marginBottom: 2 },
    yearText: { fontSize: 14, textAlign: 'center' },
    monthItem: { paddingVertical: 8, paddingHorizontal: 4, borderRadius: 6, marginBottom: 2 },
    monthText: { fontSize: 14, textAlign: 'center' },
  });
}
