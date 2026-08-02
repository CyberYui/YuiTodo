// 数据统计面板页面（异步加载版）
// 职责：展示任务完成情况的全方位统计

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { StatPeriod } from '../statistics/CompletionRate';
import { getDailyCompletionCounts, getTotalCompletions, getAverageCompletions } from '../statistics/DailyCount';
import { calculateOverviewCounts, calculateRecurrenceFulfillment, getTodayProgress } from '../statistics/OverviewCards';
import { LineChart, BarChart } from '../components/StatChart';
import StatCard, { OverviewMiniCard } from '../components/StatCard';

const PeriodLabels = {
  [StatPeriod.WEEK]: '近7天',
  [StatPeriod.MONTH]: '近30天',
  [StatPeriod.YEAR]: '近一年',
};

/**
 * 统计面板主页面
 */
export default function StatisticsScreen() {
  const { theme } = useTheme();
  const { tasks } = useTasks();

  const [selectedPeriod, setSelectedPeriod] = useState(StatPeriod.WEEK);
  const [dailyData, setDailyData] = useState([]);
  const [totalCompletions, setTotalCompletions] = useState(0);
  const [averageCompletions, setAverageCompletions] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const styles = createStyles(theme);

  // 概览计数（同步计算）
  const overviewCounts = useMemo(() => calculateOverviewCounts(tasks), [tasks]);
  const todayProgress = useMemo(() => getTodayProgress(tasks), [tasks]);

  // 异步加载统计数据
  useEffect(() => {
    loadStatistics();
  }, [selectedPeriod]);

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
      console.error('加载统计失败:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }

  // 折线图数据
  const lineChartData = dailyData.map((d) => ({ label: d.label, completed: d.count }));

  // 循环任务履约率
  const recurrenceFulfillment = useMemo(
    () => calculateRecurrenceFulfillment(tasks, []),
    [tasks]
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 时间维度切换栏 */}
      <View style={styles.periodBar}>
        {Object.entries(PeriodLabels).map(([period, label]) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              {
                backgroundColor:
                  selectedPeriod === period ? theme.primary : theme.separator + '40',
              },
            ]}
            onPress={() => setSelectedPeriod(period)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.periodText,
                { color: selectedPeriod === period ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 今日进度卡片 */}
      <View style={[styles.todayCard, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.todayLabel, { color: theme.textSecondary }]}>今日进度</Text>
        <View style={styles.todayRow}>
          <Text style={[styles.todayPercent, { color: theme.primary }]}>
            {todayProgress.percentage}%
          </Text>
          <Text style={[styles.todayDetail, { color: theme.textTertiary }]}>
            {todayProgress.completed}/{todayProgress.total} 已完成
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: theme.separator }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${todayProgress.percentage}%`,
                backgroundColor: theme.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* 概览卡片行 */}
      <View style={styles.overviewRow}>
        <OverviewMiniCard label="待办" count={overviewCounts.pending} color={theme.pending} />
        <OverviewMiniCard label="逾期" count={overviewCounts.overdue} color={theme.danger} />
        <OverviewMiniCard label="已完成" count={overviewCounts.completed} color={theme.done} />
        <OverviewMiniCard label="延后" count={overviewCounts.postponed} color={theme.postponed} />
      </View>

      {/* 完成总数 + 平均 */}
      <View style={styles.statRow}>
        <View style={[styles.statCardFlex, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>完成总数</Text>
          <Text style={[styles.statValue, { color: theme.textPrimary }]}>
            {totalCompletions}
            <Text style={[styles.statUnit, { color: theme.textSecondary }]}> 次</Text>
          </Text>
        </View>
        <View style={[styles.statCardFlex, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>日均完成</Text>
          <Text style={[styles.statValue, { color: theme.textPrimary }]}>
            {averageCompletions}
            <Text style={[styles.statUnit, { color: theme.textSecondary }]}> 次</Text>
          </Text>
        </View>
      </View>

      {/* 循环任务履约达成率 */}
      <View style={[styles.fulfillmentCard, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.fulfillmentHeader}>
          <Text style={[styles.fulfillmentLabel, { color: theme.textSecondary }]}>
            循环任务履约率
          </Text>
          <Text style={[styles.fulfillmentRate, { color: theme.primary }]}>
            {recurrenceFulfillment.rate}%
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: theme.separator }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${recurrenceFulfillment.rate}%`,
                backgroundColor: theme.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.fulfillmentDetail, { color: theme.textTertiary }]}>
          已完成 {recurrenceFulfillment.totalCompleted} / 应执行 {recurrenceFulfillment.totalScheduled} 次
        </Text>
      </View>

      {/* 图表区域 */}
      {isLoadingStats ? (
        <View style={styles.loadingContainer}>
          <Text style={{ color: theme.textTertiary }}>加载统计数据中...</Text>
        </View>
      ) : (
        <>
          <LineChart data={lineChartData} title="完成率趋势" />
          <BarChart data={dailyData} title="每日完成任务数" />
        </>
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      padding: 16,
    },
    periodBar: {
      flexDirection: 'row',
      marginBottom: 16,
      gap: 8,
    },
    periodButton: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: 'center',
    },
    periodText: {
      fontSize: 13,
      fontWeight: '600',
    },
    todayCard: {
      padding: 14,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 2,
      elevation: 1,
    },
    todayLabel: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 6,
    },
    todayRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    todayPercent: {
      fontSize: 28,
      fontWeight: '700',
    },
    todayDetail: {
      fontSize: 12,
    },
    progressBar: {
      height: 6,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },
    overviewRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
    },
    statRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 12,
    },
    statCardFlex: {
      flex: 1,
      padding: 14,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 2,
      elevation: 1,
    },
    statLabel: {
      fontSize: 12,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 22,
      fontWeight: '700',
    },
    statUnit: {
      fontSize: 13,
      fontWeight: '400',
    },
    fulfillmentCard: {
      padding: 14,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 2,
      elevation: 1,
    },
    fulfillmentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    fulfillmentLabel: {
      fontSize: 14,
      fontWeight: '600',
    },
    fulfillmentRate: {
      fontSize: 24,
      fontWeight: '700',
    },
    fulfillmentDetail: {
      fontSize: 11,
      marginTop: 8,
    },
    loadingContainer: {
      padding: 40,
      alignItems: 'center',
    },
  });
}
