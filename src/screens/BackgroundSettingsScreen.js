// 背景设置页面
// 职责：选图、预览、透明度调节

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Dimensions, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../context/ThemeContext';
import { useBackground } from '../context/BackgroundContext';
import ThemedText from '../components/ThemedText';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BackgroundSettingsScreen({ navigation }) {
  const { theme } = useTheme();
  const { lightImageUri, darkImageUri, lightOpacity, darkOpacity, hasBackground, selectImage, setOpacity, removeBackground } = useBackground();
  const [activeMode, setActiveMode] = useState('light');
  const styles = createStyles(theme);

  const currentImage = activeMode === 'light' ? lightImageUri : darkImageUri;
  const currentOpacity = activeMode === 'light' ? lightOpacity : darkOpacity;

  const handleRemove = () => {
    Alert.alert('移除背景', '确定要移除当前背景图片吗？', [
      { text: '取消', style: 'cancel' },
      { text: '移除', style: 'destructive', onPress: removeBackground },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeMode === 'light' && styles.tabActive, { borderColor: theme.separator }]}
          onPress={() => setActiveMode('light')}
        >
          <ThemedText style={[styles.tabText, activeMode === 'light' && { color: theme.primary }]}>☀️ 浅色</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeMode === 'dark' && styles.tabActive, { borderColor: theme.separator }]}
          onPress={() => setActiveMode('dark')}
        >
          <ThemedText style={[styles.tabText, activeMode === 'dark' && { color: theme.primary }]}>🌙 深色</ThemedText>
        </TouchableOpacity>
      </View>
      <View style={styles.previewSection}>
        {hasBackground ? (
          <ImageBackground
            source={{ uri: currentImage }}
            style={styles.previewImage}
            imageStyle={[styles.previewImageStyle, { opacity: currentOpacity }]}
          >
            <View style={styles.previewOverlay}>
              <View style={styles.previewCard}>
                <ThemedText style={styles.previewCardTitle}>今天</ThemedText>
                <ThemedText style={styles.previewCardItem}>☑ 写周报</ThemedText>
                <ThemedText style={styles.previewCardItem}>☐ 运动 30 分钟</ThemedText>
                <ThemedText style={styles.previewCardItem}>☐ 阅读 1 小时</ThemedText>
              </View>
            </View>
          </ImageBackground>
        ) : (
          <View style={styles.emptyPreview}>
            <ThemedText style={styles.emptyText}>未设置背景</ThemedText>
            <ThemedText style={styles.emptySub}>点击下方按钮选择图片</ThemedText>
          </View>
        )}
      </View>

      <View style={styles.buttonSection}>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => selectImage(activeMode)}>
          <ThemedText style={styles.buttonText}>
            {hasBackground ? '更换图片' : '选择图片'}
          </ThemedText>
        </TouchableOpacity>
        {hasBackground && (
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.danger }]} onPress={handleRemove}>
            <ThemedText style={styles.buttonText}>移除背景</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {hasBackground && (
        <View style={[styles.opacitySection, { backgroundColor: theme.cardBackground, borderColor: theme.separator }]}>
          <View style={styles.opacityHeader}>
            <ThemedText style={[styles.opacityLabel, { color: theme.textPrimary }]}>透明度</ThemedText>
            <ThemedText style={[styles.opacityValue, { color: theme.textSecondary }]}>
              {Math.round(currentOpacity * 100)}%
            </ThemedText>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            step={0.05}
            value={currentOpacity}
            onValueChange={(v) => setOpacity(v, activeMode)}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.separator}
            thumbTintColor={theme.primary}
          />
          <View style={styles.opacityLabels}>
            <ThemedText style={[styles.opacityExtreme, { color: theme.textTertiary }]}>透明</ThemedText>
            <ThemedText style={[styles.opacityExtreme, { color: theme.textTertiary }]}>不透明</ThemedText>
          </View>
        </View>
      )}
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    tabBar: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, marginBottom: 8, backgroundColor: theme.separator + '40', borderRadius: 8, padding: 3 },
    tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
    tabActive: { backgroundColor: theme.cardBackground },
    tabText: { fontSize: 14, fontWeight: '500' },
    previewSection: { height: 280, margin: 16, borderRadius: 12, overflow: 'hidden' },
    previewImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    previewImageStyle: { borderRadius: 0 },
    previewOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
    previewCard: {
      backgroundColor: 'rgba(255,255,255,0.92)',
      borderRadius: 12,
      padding: 16,
      width: SCREEN_WIDTH - 80,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    previewCardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
    previewCardItem: { fontSize: 14, marginBottom: 4 },
    emptyPreview: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.cardBackground },
    emptyText: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    emptySub: { fontSize: 13 },
    buttonSection: { paddingHorizontal: 16, gap: 8 },
    button: { paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
    buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
    opacitySection: { margin: 16, padding: 16, borderRadius: 12, borderWidth: 1 },
    opacityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    opacityLabel: { fontSize: 15, fontWeight: '600' },
    opacityValue: { fontSize: 15, fontWeight: '700' },
    slider: { width: '100%', height: 40 },
    opacityLabels: { flexDirection: 'row', justifyContent: 'space-between' },
    opacityExtreme: { fontSize: 12 },
  });
}
