// 年度完成热力图（GitHub风格）
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getDatabase } from '../database/Database';

export default function AnnualHeatmap() {
  const { theme } = useTheme();
  const [data, setData] = useState({});
  const [totalCompletions, setTotalCompletions] = useState(0);
  const [maxCount, setMaxCount] = useState(1);
  const styles = createStyles(theme);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const db = getDatabase();
      const result = await db.execAsync(
        [{ sql: "SELECT scheduled_date FROM completion_record WHERE scheduled_date > ?", args: [Date.now() - 365 * 86400000] }],
        true
      );
      const counts = {};
      let total = 0;
      let max = 1;
      result[0].rows.forEach((row) => {
        const day = new Date(row.scheduled_date);
        const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
        counts[key] = (counts[key] || 0) + 1;
        if (counts[key] > max) max = counts[key];
        total++;
      });
      setData(counts);
      setTotalCompletions(total);
      setMaxCount(max);
    } catch (e) {
      console.error('加载热力图失败:', e);
    }
  }

  // 生成最近365天的日期网格
  const generateGrid = () => {
    const days = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);

    // 调整到周一开始
    const dayOfWeek = startDate.getDay();
    const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - offset);

    for (let i = 0; i < 364 + offset; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      if (date > today) break;

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const count = data[key] || 0;
      const level = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4;
      days.push({ key, count, level, date });
    }

    // 按周分组
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  };

  const weeks = generateGrid();
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const weekdayLabels = ['一', '', '三', '', '五', ''];

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>年度完成热力图</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>全年共 {totalCompletions} 次完成</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heatmapWrapper}>
          {/* 月份标签 */}
          <View style={styles.monthRow}>
            {weeks.length > 0 && weeks.map((week, wi) => {
              const firstDay = week[0]?.date;
              const showMonth = firstDay && firstDay.getDate() <= 7;
              return (
                <View key={wi} style={styles.monthCell}>
                  {showMonth && (
                    <Text style={[styles.monthLabel, { color: theme.textTertiary }]}>
                      {months[firstDay.getMonth()]}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>

          <View style={styles.gridRow}>
            {/* 星期标签 */}
            <View style={styles.weekdayCol}>
              {weekdayLabels.map((label, i) => (
                <View key={i} style={styles.weekdayCell}>
                  {label !== '' && (
                    <Text style={[styles.weekdayLabel, { color: theme.textTertiary }]}>{label}</Text>
                  )}
                </View>
              ))}
            </View>

            {/* 热力图网格 */}
            <View style={styles.grid}>
              {weeks.map((week, wi) => (
                <View key={wi} style={styles.weekCol}>
                  {week.map((day, di) => (
                    <View
                      key={di}
                      style={[
                        styles.dayCell,
                        {
                          backgroundColor: getColor(day.level, theme),
                        },
                      ]}
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 图例 */}
      <View style={styles.legend}>
        <Text style={[styles.legendText, { color: theme.textTertiary }]}>少</Text>
        {[0, 1, 2, 3, 4].map((level) => (
          <View key={level} style={[styles.legendCell, { backgroundColor: getColor(level, theme) }]} />
        ))}
        <Text style={[styles.legendText, { color: theme.textTertiary }]}>多</Text>
      </View>
    </View>
  );
}

function getColor(level, theme) {
  const isDark = theme.background !== '#FFFFFF' && theme.background !== '#FAFAF9' && theme.background !== '#F5F5F7' && theme.background !== '#F8F8F8' && theme.background !== '#F0F4FF' && theme.background !== '#FFF8F3' && theme.background !== '#F4F9F4' && theme.background !== '#F5F3FF' && theme.background !== '#FFFFFF' && theme.background !== '#F0F0F0' && theme.background !== '#FAF8F5';
  if (isDark) {
    const colors = ['#1A1A2E', '#0D47A1', '#1565C0', '#1976D2', '#42A5F5'];
    return colors[level];
  }
  const colors = ['#0000000D', '#22C55E40', '#22C55E70', '#22C55EA0', '#15803D'];
  return colors[level];
}

function createStyles(theme) {
  return StyleSheet.create({
    container: { borderRadius: 12, padding: 14, marginBottom: 12 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    title: { fontSize: 14, fontWeight: '600' },
    subtitle: { fontSize: 12 },
    scrollContent: { paddingBottom: 4 },
    heatmapWrapper: { flexDirection: 'column' },
    monthRow: { flexDirection: 'row', height: 16, marginBottom: 2 },
    monthCell: { width: 13, marginRight: 2 },
    monthLabel: { fontSize: 9 },
    gridRow: { flexDirection: 'row' },
    weekdayCol: { marginRight: 4, justifyContent: 'space-between' },
    weekdayCell: { height: 13, justifyContent: 'center' },
    weekdayLabel: { fontSize: 9 },
    grid: { flexDirection: 'row' },
    weekCol: { marginRight: 2 },
    dayCell: { width: 11, height: 11, borderRadius: 2, marginBottom: 2 },
    legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8, gap: 2 },
    legendText: { fontSize: 11 },
    legendCell: { width: 11, height: 11, borderRadius: 2 },
  });
}
