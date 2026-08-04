/**
 * Statistics card components — single metric display.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'flat';
  subtitle?: string;
}

export default function StatCard({ label, value, unit = '', trend, subtitle }: StatCardProps) {
  const { theme } = useTheme();

  const getTrendInfo = () => {
    switch (trend) {
      case 'up': return { arrow: '↑', color: theme.success };
      case 'down': return { arrow: '↓', color: theme.danger };
      default: return { arrow: '→', color: theme.textTertiary };
    }
  };

  const trendInfo = getTrendInfo();

  return (
    <View style={styles.card}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: theme.textPrimary }]}>{value}</Text>
        {unit ? <Text style={[styles.unit, { color: theme.textSecondary }]}>{unit}</Text> : null}
        {trend ? <Text style={[styles.trend, { color: trendInfo.color }]}>{trendInfo.arrow}</Text> : null}
      </View>
      {subtitle ? <Text style={[styles.subtitle, { color: theme.textTertiary }]}>{subtitle}</Text> : null}
    </View>
  );
}

interface MiniCardProps {
  label: string;
  count: number;
  color: string;
}

export function OverviewMiniCard({ label, count, color }: MiniCardProps) {
  const { theme } = useTheme();
  return (
    <View style={[styles.miniCard, { borderLeftColor: color, borderLeftWidth: 3 }]}>
      <Text style={[styles.miniLabel, { color: theme.textTertiary }]}>{label}</Text>
      <Text style={[styles.miniValue, { color: theme.textPrimary }]}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 12, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 },
  label: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  value: { fontSize: 28, fontWeight: '700' },
  unit: { fontSize: 14, fontWeight: '500' },
  trend: { fontSize: 16, fontWeight: '600', marginLeft: 4 },
  subtitle: { fontSize: 11, marginTop: 4 },
  miniCard: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 },
  miniLabel: { fontSize: 11, marginBottom: 4 },
  miniValue: { fontSize: 22, fontWeight: '700' },
});
