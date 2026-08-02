// 统计卡片组件
// 负责：展示单个统计指标（数字 + 标签 + 可选趋势）

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * 统计卡片
 * @param {string} label - 标签文字
 * @param {string|number} value - 显示的数值
 * @param {string} [unit=''] - 单位文字
 * @param {string} [trend] - 趋势方向 'up'|'down'|'flat'
 * @param {string} [subtitle] - 副标题
 */
export default function StatCard({ label, value, unit = '', trend, subtitle }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  // 趋势箭头和颜色
  const getTrendInfo = () => {
    switch (trend) {
      case 'up':
        return { arrow: '↑', color: theme.success };
      case 'down':
        return { arrow: '↓', color: theme.danger };
      case 'flat':
      default:
        return { arrow: '→', color: theme.textTertiary };
    }
  };

  const trendInfo = getTrendInfo();

  return (
    <View style={styles.card}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: theme.textPrimary }]}>{value}</Text>
        {unit ? (
          <Text style={[styles.unit, { color: theme.textSecondary }]}>{unit}</Text>
        ) : null}
        {trend ? (
          <Text style={[styles.trend, { color: trendInfo.color }]}>{trendInfo.arrow}</Text>
        ) : null}
      </View>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: theme.textTertiary }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

/**
 * 小型概览卡片（用于待办/逾期/已完成数量展示）
 * @param {string} label - 标签
 * @param {number} count - 数量
 * @param {string} color - 主题色
 */
export function OverviewMiniCard({ label, count, color }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.miniCard, { borderLeftColor: color, borderLeftWidth: 3 }]}>
      <Text style={[styles.miniLabel, { color: theme.textTertiary }]}>{label}</Text>
      <Text style={[styles.miniValue, { color: theme.textPrimary }]}>{count}</Text>
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    card: {
      padding: 14,
      borderRadius: 12,
      backgroundColor: theme.cardBackground,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 2,
      elevation: 1,
    },
    label: {
      fontSize: 12,
      fontWeight: '500',
      marginBottom: 4,
    },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 2,
    },
    value: {
      fontSize: 28,
      fontWeight: '700',
    },
    unit: {
      fontSize: 14,
      fontWeight: '500',
    },
    trend: {
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 4,
    },
    subtitle: {
      fontSize: 11,
      marginTop: 4,
    },
    // 小型卡片样式
    miniCard: {
      flex: 1,
      padding: 12,
      borderRadius: 10,
      backgroundColor: theme.cardBackground,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 2,
      elevation: 1,
    },
    miniLabel: {
      fontSize: 11,
      marginBottom: 4,
    },
    miniValue: {
      fontSize: 22,
      fontWeight: '700',
    },
  });
}
