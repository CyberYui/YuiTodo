// 主题选择器底部弹窗
// 职责：可视化选择主题模式（浅色/深色/跟随系统/定时）
// 包含时间设置（定时模式下）

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useTheme, ThemeMode, ThemeModeLabels } from '../context/ThemeContext';

/**
 * 主题选择弹窗
 */
export default function ThemePicker({ visible, onClose }) {
  const { theme, themeMode, setThemeMode, darkStartTime, lightStartTime, setDarkStart, setLightStart } = useTheme();
  const styles = createStyles(theme);

  // 时间选项（每30分钟一档）
  const timeOptions = [
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
    '09:00', '17:00', '17:30', '18:00', '18:30', '19:00',
    '19:30', '20:00', '20:30', '21:00', '21:30', '22:00',
  ];

  /**
   * 渲染主题模式按钮
   */
  function renderModeButton(mode, icon, label) {
    const isSelected = themeMode === mode;
    return (
      <TouchableOpacity
        key={mode}
        style={[
          styles.modeButton,
          { backgroundColor: isSelected ? theme.primary : theme.separator + '40' },
        ]}
        onPress={() => setThemeMode(mode)}
        activeOpacity={0.7}
      >
        <Text style={styles.modeIcon}>{icon}</Text>
        <Text style={[styles.modeLabel, { color: isSelected ? '#FFFFFF' : theme.textSecondary }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  /**
   * 渲染时间选择器
   */
  function renderTimePicker(label, value, onChange) {
    return (
      <View style={styles.timePickerContainer}>
        <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>{label}</Text>
        <View style={styles.timeOptions}>
          {timeOptions.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeOption,
                { backgroundColor: time === value ? theme.primary : theme.separator + '40' },
              ]}
              onPress={() => onChange(time)}
            >
              <Text style={[styles.timeText, { color: time === value ? '#FFFFFF' : theme.textSecondary }]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>主题设置</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeText, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 主题模式选择 */}
          <View style={styles.modesGrid}>
            {renderModeButton(ThemeMode.LIGHT, '☀️', '浅色')}
            {renderModeButton(ThemeMode.DARK, '🌙', '深色')}
            {renderModeButton(ThemeMode.AUTO, '🔄', '跟随')}
            {renderModeButton(ThemeMode.SCHEDULED, '⏰', '定时')}
          </View>

          {/* 定时模式下的时间设置 */}
          {themeMode === ThemeMode.SCHEDULED && (
            <View style={styles.scheduledSettings}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>定时设置</Text>
              {renderTimePicker('深色模式开始时间', darkStartTime, setDarkStart)}
              {renderTimePicker('浅色模式开始时间', lightStartTime, setLightStart)}
            </View>
          )}

          {/* 当前状态 */}
          <View style={[styles.statusBar, { backgroundColor: theme.separator + '40' }]}>
            <Text style={[styles.statusText, { color: theme.textSecondary }]}>
              当前：{ThemeModeLabels[themeMode]}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    container: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.separator },
    title: { fontSize: 18, fontWeight: '700' },
    closeText: { fontSize: 20 },
    modesGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 10 },
    modeButton: { width: '47%', paddingVertical: 14, borderRadius: 10, alignItems: 'center', gap: 4 },
    modeIcon: { fontSize: 24 },
    modeLabel: { fontSize: 13, fontWeight: '600' },
    scheduledSettings: { paddingHorizontal: 16, paddingBottom: 12 },
    sectionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
    timePickerContainer: { marginBottom: 12 },
    timeLabel: { fontSize: 12, marginBottom: 6 },
    timeOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    timeOption: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
    timeText: { fontSize: 12, fontWeight: '500' },
    statusBar: { marginHorizontal: 16, padding: 10, borderRadius: 8, alignItems: 'center' },
    statusText: { fontSize: 12 },
  });
}
