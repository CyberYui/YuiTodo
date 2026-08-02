// 轻量级SVG图表组件
// 使用react-native-svg原生绘制，不引入第三方图表库
// 包含：折线图（完成率趋势）和柱状图（每日完成数）

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Polyline,
  Line,
  Rect,
  Text as SvgText,
  Circle,
  G,
} from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

// 图表默认宽度（屏幕宽度减去边距）
const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 64; // 左右各32边距
const CHART_HEIGHT = 180;              // 图表高度

/**
 * 折线图组件：展示任务完成率趋势
 *
 * @param {Array<{label: string, completed: number}>} data - 数据点数组
 * @param {string} title - 图表标题
 */
export function LineChart({ data, title }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.textSecondary }]}>{title}</Text>
        <View style={styles.emptyChart}>
          <Text style={[styles.emptyText, { color: theme.textTertiary }]}>暂无数据</Text>
        </View>
      </View>
    );
  }

  // 计算Y轴最大值（用于缩放）
  const maxValue = Math.max(...data.map((d) => d.completed), 5);
  const chartPadding = { top: 20, bottom: 30, left: 0, right: 0 };
  const plotWidth = CHART_WIDTH;
  const plotHeight = CHART_HEIGHT - chartPadding.top - chartPadding.bottom;

  // 计算每个数据点的坐标
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1 || 1)) * plotWidth;
    const y = chartPadding.top + plotHeight - (item.completed / maxValue) * plotHeight;
    return { x, y, ...item };
  });

  // 构建折线路径点字符串
  const linePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Y轴刻度（5等分）
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    y: chartPadding.top + plotHeight - ratio * plotHeight,
    value: Math.round(maxValue * ratio),
  }));

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.textSecondary }]}>{title}</Text>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        {/* Y轴网格线 */}
        {yTicks.map((tick, i) => (
          <Line
            key={i}
            x1={0}
            y1={tick.y}
            x2={plotWidth}
            y2={tick.y}
            stroke={theme.separator}
            strokeWidth={0.5}
            strokeDasharray="4,4"
          />
        ))}

        {/* Y轴刻度文字 */}
        {yTicks.map((tick, i) => (
          <SvgText
            key={`ytick-${i}`}
            x={plotWidth + 5}
            y={tick.y + 4}
            fontSize={10}
            fill={theme.textTertiary}
          >
            {tick.value}
          </SvgText>
        ))}

        {/* 折线 */}
        <Polyline
          points={linePoints}
          fill="none"
          stroke={theme.primary}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 数据点 */}
        {points.map((point, i) => (
          <Circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={3}
            fill={theme.primary}
            stroke={theme.cardBackground}
            strokeWidth={1.5}
          />
        ))}

        {/* X轴标签（只显示部分，避免拥挤） */}
        {points.map((point, i) => {
          // 根据数据量决定标签显示频率
          const labelInterval = data.length > 30 ? 30 : data.length > 7 ? 7 : 1;
          if (i % labelInterval !== 0 && i !== data.length - 1) return null;
          return (
            <SvgText
              key={`xlabel-${i}`}
              x={point.x}
              y={CHART_HEIGHT - 5}
              fontSize={9}
              fill={theme.textTertiary}
              textAnchor="middle"
            >
              {point.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

/**
 * 柱状图组件：展示每日完成任务数量
 *
 * @param {Array<{label: string, count: number}>} data - 数据点数组
 * @param {string} title - 图表标题
 */
export function BarChart({ data, title }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.textSecondary }]}>{title}</Text>
        <View style={styles.emptyChart}>
          <Text style={[styles.emptyText, { color: theme.textTertiary }]}>暂无数据</Text>
        </View>
      </View>
    );
  }

  // 计算Y轴最大值
  const maxValue = Math.max(...data.map((d) => d.count), 5);
  const chartPadding = { top: 20, bottom: 30, left: 0, right: 0 };
  const plotWidth = CHART_WIDTH;
  const plotHeight = CHART_HEIGHT - chartPadding.top - chartPadding.bottom;

  // 计算每个柱形的尺寸
  const barGap = 2; // 柱子间距
  const barWidth = Math.max((plotWidth - barGap * (data.length - 1)) / data.length, 2);

  // Y轴刻度
  const yTickCount = 5;
  const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) => ({
    y: chartPadding.top + plotHeight - (i / yTickCount) * plotHeight,
    value: Math.round((maxValue * i) / yTickCount),
  }));

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.textSecondary }]}>{title}</Text>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        {/* Y轴网格线 */}
        {yTicks.map((tick, i) => (
          <Line
            key={i}
            x1={0}
            y1={tick.y}
            x2={plotWidth}
            y2={tick.y}
            stroke={theme.separator}
            strokeWidth={0.5}
            strokeDasharray="4,4"
          />
        ))}

        {/* Y轴刻度文字 */}
        {yTicks.map((tick, i) => (
          <SvgText
            key={`ytick-${i}`}
            x={plotWidth + 5}
            y={tick.y + 4}
            fontSize={10}
            fill={theme.textTertiary}
          >
            {tick.value}
          </SvgText>
        ))}

        {/* 柱形 */}
        {data.map((item, index) => {
          const barHeight = (item.count / maxValue) * plotHeight;
          const x = index * (barWidth + barGap);
          const y = chartPadding.top + plotHeight - barHeight;

          return (
            <Rect
              key={index}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={item.count > 0 ? theme.primary : theme.separator}
              rx={barWidth / 4} // 顶部圆角
              opacity={item.count > 0 ? 1 : 0.3}
            />
          );
        })}

        {/* X轴标签（根据数据量决定显示频率） */}
        {data.map((item, i) => {
          if (!item.label) return null;
          const labelInterval = data.length > 30 ? 30 : data.length > 7 ? 7 : 1;
          if (i % labelInterval !== 0 && i !== data.length - 1) return null;
          const x = i * (barWidth + barGap) + barWidth / 2;
          return (
            <SvgText
              key={`xlabel-${i}`}
              x={x}
              y={CHART_HEIGHT - 5}
              fontSize={9}
              fill={theme.textTertiary}
              textAnchor="middle"
            >
              {item.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

/**
 * 创建动态样式
 */
function createStyles(theme) {
  return StyleSheet.create({
    container: {
      marginVertical: 8,
      padding: 12,
      borderRadius: 12,
      backgroundColor: theme.cardBackground,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 2,
      elevation: 1,
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
    },
    emptyChart: {
      height: CHART_HEIGHT,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 13,
    },
  });
}
