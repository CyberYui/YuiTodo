/**
 * Color theme picker — 4x4 matrix with live preview.
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { TASK_COLORS } from '../utils/constants';
import { TaskColorTheme } from '../types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GAP = 8;
const COLS = 4;
const CELL_SIZE = (SCREEN_WIDTH - 32 - GAP * (COLS - 1)) / COLS;

interface Props {
  selectedColor: string;
  onSelect: (color: TaskColorTheme) => void;
}

export default function ColorPicker({ selectedColor, onSelect }: Props) {
  const { theme } = useTheme();
  const [previewColor, setPreviewColor] = useState<TaskColorTheme | null>(null);
  const displayColor = previewColor || (TASK_COLORS.find(c => c.bar === selectedColor) || TASK_COLORS[0]);

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: theme.separator, backgroundColor: theme.cardBackground, padding: 12, gap: 10 }}>
        <View style={{ width: 4, height: 40, borderRadius: 2, backgroundColor: displayColor.bar }} />
        <View style={{ flex: 1, gap: 6 }}>
          <View style={{ width: '60%', height: 10, borderRadius: 3, backgroundColor: displayColor.bar }} />
          <View style={{ width: '40%', height: 8, borderRadius: 3, backgroundColor: displayColor.label + '40' }} />
          <View style={{ flexDirection: 'row', gap: 4 }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: displayColor.bar }} />
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: displayColor.label }} />
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: displayColor.date }} />
          </View>
        </View>
        <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: displayColor.bg }} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP }}>
        {TASK_COLORS.map((colorObj) => {
          const isSelected = selectedColor === colorObj.bar;
          return (
            <TouchableOpacity key={colorObj.bar}
              style={{ width: CELL_SIZE, height: CELL_SIZE, borderRadius: 8, backgroundColor: colorObj.bar, borderWidth: isSelected ? 2 : 2, borderColor: isSelected ? colorObj.label : 'transparent' }}
              onPress={() => onSelect(colorObj)} onPressIn={() => setPreviewColor(colorObj)} onPressOut={() => setPreviewColor(null)} activeOpacity={0.8}
            />
          );
        })}
      </View>
    </View>
  );
}
