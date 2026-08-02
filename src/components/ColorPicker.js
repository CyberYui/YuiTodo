// 颜色主题选择器组件（网格布局 + 色球预览）
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { TASK_COLORS } from '../utils/constants';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PADDING = 20 * 2;
const GAP = 8;
const CARDS_PER_ROW = 4;
const CARD_WIDTH = (SCREEN_WIDTH - PADDING - GAP * (CARDS_PER_ROW - 1)) / CARDS_PER_ROW;

export default function ColorPicker({ selectedColor, onSelect }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.grid}>
      {TASK_COLORS.map((colorObj) => {
        const isSelected = selectedColor === colorObj.bar;
        return (
          <TouchableOpacity
            key={colorObj.bar}
            style={[
              styles.card,
              { backgroundColor: theme.cardBackground, borderColor: isSelected ? colorObj.bar : theme.separator },
              isSelected && { borderWidth: 2 },
            ]}
            onPress={() => onSelect(colorObj)}
            activeOpacity={0.7}
          >
            {/* 色球预览：显示该主题的4种颜色 */}
            <View style={styles.dotsRow}>
              <View style={[styles.dot, { backgroundColor: colorObj.bar }]} />
              <View style={[styles.dot, { backgroundColor: colorObj.label }]} />
              <View style={[styles.dot, { backgroundColor: colorObj.date }]} />
              <View style={[styles.dot, { backgroundColor: colorObj.bar + '80' }]} />
            </View>
            {/* 主题名 */}
            <Text style={[styles.name, { color: theme.textSecondary }]} numberOfLines={1}>
              {colorObj.name}
            </Text>
            {/* 选中标记 */}
            {isSelected && (
              <View style={[styles.checkBadge, { backgroundColor: colorObj.bar }]}>
                <Text style={styles.checkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: GAP,
    },
    card: {
      width: CARD_WIDTH,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'transparent',
      padding: 8,
      alignItems: 'center',
      position: 'relative',
    },
    dotsRow: {
      flexDirection: 'row',
      gap: 4,
      marginBottom: 6,
    },
    dot: {
      width: 14,
      height: 14,
      borderRadius: 7,
    },
    name: {
      fontSize: 10,
      textAlign: 'center',
      fontWeight: '500',
    },
    checkBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 16,
      height: 16,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
    },
  });
}
