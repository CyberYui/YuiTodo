/**
 * Theme mode picker — light/dark/auto/scheduled selection.
 */

import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useTheme, ThemeMode, ThemeModeLabels } from '../context/ThemeContext';

const timeOptions = ['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ThemePicker({ visible, onClose }: Props) {
  const { theme, themeMode, setThemeMode, darkStartTime, lightStartTime, setDarkStart, setLightStart } = useTheme();

  function renderModeButton(mode: ThemeMode, icon: string, label: string) {
    const isSelected = themeMode === mode;
    return (
      <TouchableOpacity key={mode} style={[s.modeBtn, { backgroundColor: isSelected ? theme.primary : theme.separator + '40' }]}
        onPress={() => setThemeMode(mode)} activeOpacity={0.7}>
        <Text style={{ fontSize: 24 }}>{icon}</Text>
        <Text style={{ fontSize: 13, fontWeight: '600', color: isSelected ? '#FFFFFF' : theme.textSecondary }}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={[s.container, { backgroundColor: theme.cardBackground }]}>
          <View style={s.header}>
            <Text style={[s.title, { color: theme.textPrimary }]}>主题设置</Text>
            <TouchableOpacity onPress={onClose}><Text style={{ fontSize: 20, color: theme.textSecondary }}>✕</Text></TouchableOpacity>
          </View>
          <View style={s.grid}>
            {renderModeButton(ThemeMode.LIGHT, '☀️', '浅色')}
            {renderModeButton(ThemeMode.DARK, '🌙', '深色')}
            {renderModeButton(ThemeMode.AUTO, '🔄', '跟随')}
            {renderModeButton(ThemeMode.SCHEDULED, '⏰', '定时')}
          </View>
          {themeMode === ThemeMode.SCHEDULED && (
            <View style={s.scheduled}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.textSecondary, marginBottom: 8 }}>定时设置</Text>
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 6 }}>深色开始时间</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {timeOptions.map((time) => (
                    <TouchableOpacity key={time} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: time === darkStartTime ? theme.primary : theme.separator + '40' }}
                      onPress={() => setDarkStart(time)}>
                      <Text style={{ fontSize: 12, fontWeight: '500', color: time === darkStartTime ? '#FFFFFF' : theme.textSecondary }}>{time}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View>
                <Text style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 6 }}>浅色开始时间</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {timeOptions.map((time) => (
                    <TouchableOpacity key={time} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: time === lightStartTime ? theme.primary : theme.separator + '40' }}
                      onPress={() => setLightStart(time)}>
                      <Text style={{ fontSize: 12, fontWeight: '500', color: time === lightStartTime ? '#FFFFFF' : theme.textSecondary }}>{time}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}
          <View style={{ marginHorizontal: 16, padding: 10, borderRadius: 8, alignItems: 'center', backgroundColor: theme.separator + '40' }}>
            <Text style={{ fontSize: 12, color: theme.textSecondary }}>当前：{ThemeModeLabels[themeMode]}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 10 },
  modeBtn: { width: '47%', paddingVertical: 14, borderRadius: 10, alignItems: 'center', gap: 4 },
  scheduled: { paddingHorizontal: 16, paddingBottom: 12 },
});
