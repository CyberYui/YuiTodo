/**
 * Lightweight SVG chart components — LineChart and BarChart.
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polyline, Line, Rect, Text as SvgText, Circle } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { ChartDataPoint } from '../types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 64;
const CHART_HEIGHT = 180;

function ChartContainer({ title, children }: { title: string; children?: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={{ marginVertical: 8, padding: 12, borderRadius: 12, backgroundColor: theme.cardBackground, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textSecondary, marginBottom: 8 }}>{title}</Text>
      {children}
    </View>
  );
}

function EmptyChart() {
  const { theme } = useTheme();
  return (
    <View style={{ height: CHART_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 13, color: theme.textTertiary }}>暂无数据</Text>
    </View>
  );
}

export function LineChart({ data, title }: { data: ChartDataPoint[]; title: string }) {
  const { theme } = useTheme();

  if (!data || data.length === 0) {
    return <ChartContainer title={title}><EmptyChart /></ChartContainer>;
  }

  const maxValue = Math.max(...data.map((d) => d.completed || 0), 5);
  const plotWidth = CHART_WIDTH;
  const plotHeight = CHART_HEIGHT - 50;

  const points = data.map((item, index) => ({
    x: (index / (data.length - 1 || 1)) * plotWidth,
    y: 20 + plotHeight - ((item.completed || 0) / maxValue) * plotHeight,
    ...item,
  }));

  const linePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({ y: 20 + plotHeight - ratio * plotHeight, value: Math.round(maxValue * ratio) }));

  return (
    <ChartContainer title={title}>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        {yTicks.map((tick, i) => (<Line key={i} x1={0} y1={tick.y} x2={plotWidth} y2={tick.y} stroke={theme.separator} strokeWidth={0.5} strokeDasharray="4,4" />))}
        {yTicks.map((tick, i) => (<SvgText key={`ytick-${i}`} x={plotWidth + 5} y={tick.y + 4} fontSize={10} fill={theme.textTertiary}>{tick.value}</SvgText>))}
        <Polyline points={linePoints} fill="none" stroke={theme.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point, i) => (<Circle key={i} cx={point.x} cy={point.y} r={3} fill={theme.primary} stroke={theme.cardBackground} strokeWidth={1.5} />))}
        {points.map((point, i) => {
          const labelInterval = data.length > 30 ? 30 : data.length > 7 ? 7 : 1;
          if (i % labelInterval !== 0 && i !== data.length - 1) return null;
          return (<SvgText key={`xlabel-${i}`} x={point.x} y={CHART_HEIGHT - 5} fontSize={9} fill={theme.textTertiary} textAnchor="middle">{point.label}</SvgText>);
        })}
      </Svg>
    </ChartContainer>
  );
}

export default function StatChart() { return null; }

export function BarChart({ data, title }: { data: ChartDataPoint[]; title: string }) {
  const { theme } = useTheme();

  if (!data || data.length === 0) {
    return <ChartContainer title={title}><EmptyChart /></ChartContainer>;
  }

  const maxValue = Math.max(...data.map((d) => d.count || 0), 5);
  const plotWidth = CHART_WIDTH;
  const plotHeight = CHART_HEIGHT - 50;
  const barGap = 2;
  const barWidth = Math.max((plotWidth - barGap * (data.length - 1)) / data.length, 2);
  const yTickCount = 5;
  const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) => ({ y: 20 + plotHeight - (i / yTickCount) * plotHeight, value: Math.round((maxValue * i) / yTickCount) }));

  return (
    <ChartContainer title={title}>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        {yTicks.map((tick, i) => (<Line key={i} x1={0} y1={tick.y} x2={plotWidth} y2={tick.y} stroke={theme.separator} strokeWidth={0.5} strokeDasharray="4,4" />))}
        {yTicks.map((tick, i) => (<SvgText key={`ytick-${i}`} x={plotWidth + 5} y={tick.y + 4} fontSize={10} fill={theme.textTertiary}>{tick.value}</SvgText>))}
        {data.map((item, index) => {
          const barHeight = ((item.count || 0) / maxValue) * plotHeight;
          const x = index * (barWidth + barGap);
          const y = 20 + plotHeight - barHeight;
          return (<Rect key={index} x={x} y={y} width={barWidth} height={barHeight} fill={(item.count || 0) > 0 ? theme.primary : theme.separator} rx={barWidth / 4} opacity={(item.count || 0) > 0 ? 1 : 0.3} />);
        })}
        {data.map((item, i) => {
          if (!item.label) return null;
          const labelInterval = data.length > 30 ? 30 : data.length > 7 ? 7 : 1;
          if (i % labelInterval !== 0 && i !== data.length - 1) return null;
          return (<SvgText key={`xlabel-${i}`} x={i * (barWidth + barGap) + barWidth / 2} y={CHART_HEIGHT - 5} fontSize={9} fill={theme.textTertiary} textAnchor="middle">{item.label}</SvgText>);
        })}
      </Svg>
    </ChartContainer>
  );
}
