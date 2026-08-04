/**
 * Background settings — image selection, preview, opacity control.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../context/ThemeContext';
import { useBackground } from '../context/BackgroundContext';
import { useFont } from '../context/FontContext';
import { ThemedText } from '../components';

export default function BackgroundSettingsScreen() {
  const { theme, styleConfig } = useTheme();
  const { lightImageUri, darkImageUri, lightOpacity, darkOpacity, hasBackground, selectImage, setOpacity, removeBackground, permissionStatus, requestPermission } = useBackground();
  const { currentFont } = useFont();
  const [activeMode, setActiveMode] = useState<'light' | 'dark'>('light');

  const currentImage = activeMode === 'light' ? lightImageUri : darkImageUri;
  const currentOpacity = activeMode === 'light' ? lightOpacity : darkOpacity;
  const isGranted = permissionStatus === 'granted';
  const isDenied = permissionStatus === 'denied';
  const fontFamily = currentFont?.id === 'default' ? undefined : currentFont?.id;

  useEffect(() => {
    if (permissionStatus === 'undetermined') requestPermission();
  }, [permissionStatus, requestPermission]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, marginTop: 16, marginBottom: 8, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: isGranted ? theme.success : theme.danger, backgroundColor: isGranted ? theme.success + '15' : theme.danger + '15' }}>
        <ThemedText style={{ fontSize: 13, fontWeight: '500', color: isGranted ? theme.success : theme.danger }}>
          {isGranted ? '✓ 相册权限已授权' : '⚠ 相册权限未授权，无法选择图片'}
        </ThemedText>
        {!isGranted && (
          <TouchableOpacity onPress={requestPermission} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: theme.danger }}>
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>授权</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={{ flexDirection: 'row', marginHorizontal: 16, marginTop: 8, marginBottom: 8, backgroundColor: theme.separator + '40', borderRadius: 8, padding: 3 }}>
        <TouchableOpacity style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6, backgroundColor: activeMode === 'light' ? theme.cardBackground : 'transparent' }} onPress={() => setActiveMode('light')}>
          <ThemedText style={{ fontSize: 14, fontWeight: '500', color: activeMode === 'light' ? theme.primary : theme.textSecondary }}>☀️ 浅色</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6, backgroundColor: activeMode === 'dark' ? theme.cardBackground : 'transparent' }} onPress={() => setActiveMode('dark')}>
          <ThemedText style={{ fontSize: 14, fontWeight: '500', color: activeMode === 'dark' ? theme.primary : theme.textSecondary }}>🌙 深色</ThemedText>
        </TouchableOpacity>
      </View>
      <View style={{ height: 320, margin: 16, borderRadius: 12, overflow: 'hidden' }}>
        {hasBackground ? (
          <ImageBackground source={{ uri: currentImage! }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} imageStyle={{ opacity: currentOpacity }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
              <View style={{ width: '100%', paddingHorizontal: 16, paddingVertical: 12 }}>
                {[{ color: theme.primary, title: '完成项目报告', meta: '今天 · 已完成 3/5' }, { color: '#EF4444', title: '运动 30 分钟', meta: '今天 · 循环任务' }, { color: '#22C55E', title: '阅读 1 小时', meta: '明天' }].map((item, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, overflow: 'hidden', backgroundColor: theme.cardBackground, borderRadius: styleConfig?.cardRadius || 10 }}>
                    <View style={{ width: 4, alignSelf: 'stretch', minHeight: 56, backgroundColor: item.color }} />
                    <View style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 12 }}>
                      <ThemedText style={{ fontSize: 15, fontWeight: '500', color: theme.textPrimary, marginBottom: 2, fontFamily }}>{item.title}</ThemedText>
                      <ThemedText style={{ fontSize: 12, color: theme.textTertiary, fontFamily }}>{item.meta}</ThemedText>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ImageBackground>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.cardBackground }}>
            <ThemedText style={{ fontSize: 16, fontWeight: '600', marginBottom: 4, color: theme.textPrimary }}>未设置背景</ThemedText>
            <ThemedText style={{ fontSize: 13, color: theme.textSecondary }}>点击下方按钮选择图片</ThemedText>
          </View>
        )}
      </View>
      <View style={{ paddingHorizontal: 16, gap: 8 }}>
        <TouchableOpacity style={{ paddingVertical: 14, borderRadius: 10, alignItems: 'center', backgroundColor: isDenied ? theme.textTertiary : theme.primary }}
          onPress={() => selectImage(activeMode)}>
          <ThemedText style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>{isDenied ? '请先授权' : (hasBackground ? '更换图片' : '选择图片')}</ThemedText>
        </TouchableOpacity>
        {hasBackground && (
          <TouchableOpacity style={{ paddingVertical: 14, borderRadius: 10, alignItems: 'center', backgroundColor: theme.danger }} onPress={removeBackground}>
            <ThemedText style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>移除背景</ThemedText>
          </TouchableOpacity>
        )}
      </View>
      {hasBackground && (
        <View style={{ margin: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.separator, backgroundColor: theme.cardBackground }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <ThemedText style={{ fontSize: 15, fontWeight: '600', color: theme.textPrimary }}>透明度</ThemedText>
            <ThemedText style={{ fontSize: 15, fontWeight: '700', color: theme.textSecondary }}>{Math.round(currentOpacity * 100)}%</ThemedText>
          </View>
          <Slider style={{ width: '100%', height: 40 }} minimumValue={0} maximumValue={1} step={0.05} value={currentOpacity}
            onValueChange={(v) => setOpacity(v, activeMode)} minimumTrackTintColor={theme.primary} maximumTrackTintColor={theme.separator} thumbTintColor={theme.primary} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ThemedText style={{ fontSize: 12, color: theme.textTertiary }}>透明</ThemedText>
            <ThemedText style={{ fontSize: 12, color: theme.textTertiary }}>不透明</ThemedText>
          </View>
        </View>
      )}
    </View>
  );
}
