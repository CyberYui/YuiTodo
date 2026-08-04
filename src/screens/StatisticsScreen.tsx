/**
 * Statistics dashboard — overview, charts, heatmap, trends.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { StatPeriod } from '../types';
import { getDailyCompletionCounts, getTotalCompletions, getAverageCompletions } from '../statistics/DailyCount';
import { calculateOverviewCounts, calculateRecurrenceFulfillment, getTodayProgress } from '../statistics/OverviewCards';
import { LineChart, BarChart, StatCard, OverviewMiniCard, AnnualHeatmap } from '../components';

const PeriodLabels: Record<StatPeriod, string> = {
  [StatPeriod.WEEK]: '近7天',
  [StatPeriod.MONTH]: '近30天',
  [StatPeriod.YEAR]: '近一年',
};

export default function StatisticsScreen() {
  const { theme } = useTheme();
  const { tasks } = useTasks();
  const [selectedPeriod, setSelectedPeriod] = useState(StatPeriod.WEEK);
  const [dailyData, setDailyData] = useState<Array<{ date: number; count: number; label: string }>>([]);
  const [totalCompletions, setTotalCompletions] = useState(0);
  const [averageCompletions, setAverageCompletions] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const overviewCounts = useMemo(() => calculateOverviewCounts(tasks), [tasks]);
  const todayProgress = useMemo(() => getTodayProgress(tasks), [tasks]);

  useEffect(() => { loadStatistics(); }, [selectedPeriod]);

  async function loadStatistics() {
    setIsLoadingStats(true);
    try {
      const [daily, total, avg] = await Promise.all([
        getDailyCompletionCounts(selectedPeriod),
        getTotalCompletions(selectedPeriod),
        getAverageCompletions(selectedPeriod),
      ]);
      setDailyData(daily);
      setTotalCompletions(total);
      setAverageCompletions(avg);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }

  const lineChartData = dailyData.map((d) => ({ label: d.label, completed: d.count }));
  const recurrenceFulfillment = useMemo(() => calculateRecurrenceFulfillment(tasks, []), [tasks]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
      <View style={styles.periodBar}>
        {Object.entries(PeriodLabels).map(([period, label]) => (
          <TouchableOpacity key={period} style={{ flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: selectedPeriod === period ? theme.primary : theme.separator + '40' }}
            onPress={() => setSelectedPeriod(period as StatPeriod)} activeOpacity={0.7}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: selectedPeriod === period ? '#FFFFFF' : theme.textSecondary }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={[styles.todayCard, { backgroundColor: theme.cardBackground }]}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: theme.textSecondary, marginBottom: 6 }}>今日进度</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: theme.primary }}>{todayProgress.percentage}%</Text>
          <Text style={{ fontSize: 12, color: theme.textTertiary }}>{todayProgress.completed}/{todayProgress.total} 已完成</Text>
        </View>
        <View style={{ height: 6, borderRadius: 3, overflow: 'hidden', backgroundColor: theme.separator }}>
          <View style={{ width: `${todayProgress.percentage}%`, height: '100%', borderRadius: 3, backgroundColor: theme.primary }} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <OverviewMiniCard label="待办" count={overviewCounts.pending} color={theme.warning} />
        <OverviewMiniCard label="逾期" count={overviewCounts.overdue} color={theme.danger} />
        <OverviewMiniCard label="已完成" count={overviewCounts.completed} color={theme.done} />
        <OverviewMiniCard label="延后" count={overviewCounts.postponed} color={theme.textTertiary} />
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
        <View style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: theme.cardBackground, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 }}>
          <Text style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 4 }}>完成总数</Text>
          <Text style={{ fontSize: 22, fontWeight: '700', color: theme.textPrimary }}>{totalCompletions}<Text style={{ fontSize: 13, fontWeight: '400', color: theme.textSecondary }}> 次</Text></Text>
        </View>
        <View style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: theme.cardBackground, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 }}>
          <Text style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 4 }}>日均完成</Text>
          <Text style={{ fontSize: 22, fontWeight: '700', color: theme.textPrimary }}>{averageCompletions}<Text style={{ fontSize: 13, fontWeight: '400', color: theme.textSecondary }}> 次</Text></Text>
        </View>
      </View>
      <AnnualHeatmap />
      <View style={{ padding: 14, borderRadius: 12, marginBottom: 12, backgroundColor: theme.cardBackground, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textSecondary }}>循环任务履约率</Text>
          <Text style={{ fontSize: 24, fontWeight: '700', color: theme.primary }}>{recurrenceFulfillment.rate}%</Text>
        </View>
        <View style={{ height: 6, borderRadius: 3, overflow: 'hidden', backgroundColor: theme.separator }}>
          <View style={{ width: `${recurrenceFulfillment.rate}%`, height: '100%', borderRadius: 3, backgroundColor: theme.primary }} />
        </View>
        <Text style={{ fontSize: 11, marginTop: 8, color: theme.textTertiary }}>已完成 {recurrenceFulfillment.totalCompleted} / 应执行 {recurrenceFulfillment.totalScheduled} 次</Text>
      </View>
      {isLoadingStats ? (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <Text style={{ color: theme.textTertiary }}>加载统计数据中...</Text>
        </View>
      ) : (
        <>
          <LineChart data={lineChartData} title="完成率趋势" />
          <BarChart data={dailyData.map((d) => ({ label: d.label, count: d.count }))} title="每日完成任务数" />
        </>
      )}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  periodBar: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  todayCard: { padding: 14, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 },
});
