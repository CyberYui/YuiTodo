// 番茄钟组件 v1.7.0
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ThemedText from './ThemedText';
import Icon from './Icon';

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

export default function PomodoroTimer({ visible, onClose, taskTitle }) {
  const { theme } = useTheme();
  const [seconds, setSeconds] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completed, setCompleted] = useState(0);
  const intervalRef = useRef(null);
  const styles = createStyles(theme);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            // 切换工作/休息
            if (!isBreak) setCompleted((c) => c + 1);
            setIsBreak(!isBreak);
            return isBreak ? WORK_TIME : BREAK_TIME;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, isBreak]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = isBreak ? 1 - seconds / BREAK_TIME : 1 - seconds / WORK_TIME;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.titleRow}>
            <Icon name={isBreak ? 'timerSand' : 'tomato'} size={20} color={theme.primary} />
            <ThemedText style={[styles.title, { color: theme.textPrimary }]}>{isBreak ? '休息时间' : '专注中'}</ThemedText>
          </View>
          {taskTitle && <ThemedText style={[styles.taskName, { color: theme.textSecondary }]} numberOfLines={1}>{taskTitle}</ThemedText>}

          <View style={styles.timerCircle}>
            <Text style={[styles.timeText, { color: theme.primary }]}>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</Text>
            <View style={[styles.progressBar, { backgroundColor: theme.separator }]}>
              <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: isBreak ? theme.success : theme.primary }]} />
            </View>
          </View>

          <Text style={[styles.completedText, { color: theme.textTertiary }]}>已完成 {completed} 个番茄</Text>

          <View style={styles.controls}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: isRunning ? theme.danger : theme.primary }]} onPress={() => setIsRunning(!isRunning)}>
              <Text style={styles.btnText}>{isRunning ? '暂停' : '开始'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: theme.separator }]} onPress={() => { setIsRunning(false); setSeconds(WORK_TIME); setIsBreak(false); }}>
              <Text style={[styles.btnText, { color: theme.textPrimary }]}>重置</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: theme.separator }]} onPress={onClose}>
              <Text style={[styles.btnText, { color: theme.textPrimary }]}>关闭</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    container: { width: '85%', borderRadius: 20, padding: 32, alignItems: 'center', elevation: 10 },
    title: { fontSize: 22, fontWeight: '700' },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    taskName: { fontSize: 14, marginBottom: 24 },
    timerCircle: { alignItems: 'center', marginBottom: 20 },
    timeText: { fontSize: 56, fontWeight: '200', marginBottom: 16 },
    progressBar: { width: '100%', height: 4, borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 2 },
    completedText: { fontSize: 13, marginBottom: 24 },
    controls: { flexDirection: 'row', gap: 12 },
    btn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
    btnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  });
}
