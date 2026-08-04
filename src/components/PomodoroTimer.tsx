/**
 * Pomodoro timer component — work/break cycle with progress.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ThemedText from './ThemedText';
import Icon from './Icon';
import { POMODORO_WORK_SECONDS, POMODORO_BREAK_SECONDS } from '../utils/constants';

interface Props {
  visible: boolean;
  onClose: () => void;
  taskTitle?: string;
}

export default function PomodoroTimer({ visible, onClose, taskTitle }: Props) {
  const { theme } = useTheme();
  const [seconds, setSeconds] = useState(POMODORO_WORK_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completed, setCompleted] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            if (!isBreak) setCompleted((c) => c + 1);
            setIsBreak((prev) => !prev);
            return isBreak ? POMODORO_WORK_SECONDS : POMODORO_BREAK_SECONDS;
          }
          return s - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, isBreak]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = isBreak ? 1 - seconds / POMODORO_BREAK_SECONDS : 1 - seconds / POMODORO_WORK_SECONDS;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={s.overlay}>
        <View style={[s.container, { backgroundColor: theme.cardBackground }]}>
          <View style={s.titleRow}>
            <Icon name={isBreak ? 'timerSand' : 'tomato'} size={20} color={theme.primary} />
            <ThemedText style={{ fontSize: 22, fontWeight: '700', color: theme.textPrimary }}>{isBreak ? '休息时间' : '专注中'}</ThemedText>
          </View>
          {taskTitle && <ThemedText style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 24 }} numberOfLines={1}>{taskTitle}</ThemedText>}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 56, fontWeight: '200', color: theme.primary, marginBottom: 16 }}>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</Text>
            <View style={{ width: '100%', height: 4, borderRadius: 2, overflow: 'hidden', backgroundColor: theme.separator }}>
              <View style={{ width: `${progress * 100}%`, height: '100%', borderRadius: 2, backgroundColor: isBreak ? theme.success : theme.primary }} />
            </View>
          </View>
          <Text style={{ fontSize: 13, color: theme.textTertiary, marginBottom: 24, textAlign: 'center' }}>已完成 {completed} 个番茄</Text>
          <View style={s.controls}>
            <TouchableOpacity style={[s.btn, { backgroundColor: isRunning ? theme.danger : theme.primary }]} onPress={() => setIsRunning(!isRunning)}>
              <Text style={s.btnText}>{isRunning ? '暂停' : '开始'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btn, { backgroundColor: theme.separator }]} onPress={() => { setIsRunning(false); setSeconds(POMODORO_WORK_SECONDS); setIsBreak(false); }}>
              <Text style={[s.btnText, { color: theme.textPrimary }]}>重置</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btn, { backgroundColor: theme.separator }]} onPress={onClose}>
              <Text style={[s.btnText, { color: theme.textPrimary }]}>关闭</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  container: { width: '85%', borderRadius: 20, padding: 32, alignItems: 'center', elevation: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  controls: { flexDirection: 'row', gap: 12 },
  btn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  btnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});
