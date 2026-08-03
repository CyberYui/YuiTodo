// 颜色主题选择器组件（4x4矩阵 + 实时预览 + 边框高亮）
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { TASK_COLORS } from '../utils/constants';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PADDING = 32;
const GAP = 8;
const COLS = 4;
const CELL_SIZE = (SCREEN_WIDTH - PADDING - GAP * (COLS - 1)) / COLS;

export default function ColorPicker({ selectedColor, onSelect }) {
  const { theme } = useTheme();
  const [previewColor, setPreviewColor] = useState(null);
  const styles = createStyles(theme);

  // 实时预览：当前选中或悬停的颜色
  const displayColor = previewColor || (TASK_COLORS.find(c => c.bar === selectedColor) || TASK_COLORS[0]);

  return (
    <View style={styles.wrapper}>
      {/* 实时预览窗口 */}
      <View style={[styles.previewCard, { backgroundColor: theme.cardBackground, borderColor: theme.separator }]}>
        <View style={[styles.previewLeftBar, { backgroundColor: displayColor.bar }]} />
        <View style={styles.previewContent}>
          <View style={[styles.previewTitle, { backgroundColor: displayColor.bar }]} />
          <View style={[styles.previewSubtitle, { backgroundColor: displayColor.label + '40' }]} />
          <View style={styles.previewDots}>
            <View style={[styles.previewDot, { backgroundColor: displayColor.bar }]} />
            <View style={[styles.previewDot, { backgroundColor: displayColor.label }]} />
            <View style={[styles.previewDot, { backgroundColor: displayColor.date }]} />
          </View>
        </View>
        <View style={[styles.previewBadge, { backgroundColor: displayColor.bg }]} />
      </View>

      {/* 4x4 色块矩阵 */}
      <View style={styles.grid}>
        {TASK_COLORS.map((colorObj) => {
          const isSelected = selectedColor === colorObj.bar;
          return (
            <TouchableOpacity
              key={colorObj.bar}
              style={[
                styles.cell,
                { backgroundColor: colorObj.bar },
                isSelected && { borderWidth: 2, borderColor: colorObj.label },
              ]}
              onPress={() => onSelect(colorObj)}
              onPressIn={() => setPreviewColor(colorObj)}
              onPressOut={() => setPreviewColor(null)}
              activeOpacity={0.8}
            />
          );
        })}
      </View>
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    wrapper: { gap: 12 },
    previewCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 1,
      padding: 12,
      gap: 10,
    },
    previewLeftBar: { width: 4, height: 40, borderRadius: 2 },
    previewContent: { flex: 1, gap: 6 },
    previewTitle: { width: '60%', height: 10, borderRadius: 3 },
    previewSubtitle: { width: '40%', height: 8, borderRadius: 3 },
    previewDots: { flexDirection: 'row', gap: 4 },
    previewDot: { width: 12, height: 12, borderRadius: 6 },
    previewBadge: { width: 16, height: 16, borderRadius: 8 },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: GAP,
    },
    cell: {
      width: CELL_SIZE,
      height: CELL_SIZE,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: 'transparent',
    },
  });
}
