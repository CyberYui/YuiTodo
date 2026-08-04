/**
 * Annual completion heatmap (GitHub-style).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getCompletionCount } from '../database/CompletionRepository';
import { getDatabase } from '../database/Database';

export default function AnnualHeatmap() {
  const { theme } = useTheme();
  const [data, setData] = useState<Record<string, number>>({});
  const [totalCompletions, setTotalCompletions] = useState(0);
  const [maxCount, setMaxCount] = useState(1);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const db = getDatabase();
      const result = await db.execAsync(
        [{ sql: "SELECT scheduled_date FROM completion_record WHERE scheduled_date > ?", args: [Date.now() - 365 * 86400000] }],
        true
      );
      const counts: Record<string, number> = {};
      let total = 0;
      let max = 1;
      (result[0] as any).rows.forEach((row: any) => {
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
      console.error('Heatmap load failed:', e);
    }
  }

  const weeks = useMemo(() => {
    const days: Array<{ key: string; count: number; level: number; date: Date }> = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);
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

    const result: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [data]);

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const weekdayLabels = ['一', '', '三', '', '五', ''];

  const getColor = (level: number): string => {
    const bg = theme.background;
    const isDark = bg !== '#FFFFFF' && bg !== '#F8F9FA' && bg !== '#FAFAF8' && bg !== '#F5F5F5';
    if (isDark) {
      return ['#1A1A2E', '#0D47A1', '#1565C0', '#1976D2', '#42A5F5'][level];
    }
    return ['#0000000D', '#22C55E40', '#22C55E70', '#22C55EA0', '#15803D'][level];
  };

  return (
    <View style={{ borderRadius: 12, padding: 14, marginBottom: 12, backgroundColor: theme.cardBackground }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textPrimary }}>年度完成热力图</Text>
        <Text style={{ fontSize: 12, color: theme.textSecondary }}>全年共 {totalCompletions} 次完成</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={{ flexDirection: 'row', height: 16, marginBottom: 2 }}>
            {weeks.map((week, wi) => {
              const firstDay = week[0]?.date;
              const showMonth = firstDay && firstDay.getDate() <= 7;
              return (
                <View key={wi} style={{ width: 13, marginRight: 2 }}>
                  {showMonth && <Text style={{ fontSize: 9, color: theme.textTertiary }}>{months[firstDay.getMonth()]}</Text>}
                </View>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ marginRight: 4, justifyContent: 'space-between' }}>
              {weekdayLabels.map((label, i) => (
                <View key={i} style={{ height: 13, justifyContent: 'center' }}>
                  {label !== '' && <Text style={{ fontSize: 9, color: theme.textTertiary }}>{label}</Text>}
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row' }}>
              {weeks.map((week, wi) => (
                <View key={wi} style={{ marginRight: 2 }}>
                  {week.map((day, di) => (
                    <View key={di} style={{ width: 11, height: 11, borderRadius: 2, marginBottom: 2, backgroundColor: getColor(day.level) }} />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8, gap: 2 }}>
        <Text style={{ fontSize: 11, color: theme.textTertiary }}>少</Text>
        {[0, 1, 2, 3, 4].map((level) => (
          <View key={level} style={{ width: 11, height: 11, borderRadius: 2, backgroundColor: getColor(level) }} />
        ))}
        <Text style={{ fontSize: 11, color: theme.textTertiary }}>多</Text>
      </View>
    </View>
  );
}
