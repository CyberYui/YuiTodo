/**
 * Font picker screen — grid layout with live preview and category filter.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFont } from '../context/FontContext';
import { FONT_LIST, FONT_CATEGORIES } from '../theme/fonts';
import ThemedText from './ThemedText';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FontPicker({ navigation }: any) {
  const { theme } = useTheme();
  const { fontId, setFontId } = useFont();
  const [activeCategory, setActiveCategory] = useState('all');
  const [previewFont, setPreviewFont] = useState<any>(null);

  const filteredFonts = activeCategory === 'all' ? FONT_LIST : FONT_LIST.filter((f) => f.category === activeCategory);
  const displayFont = previewFont || FONT_LIST.find((f) => f.id === fontId) || FONT_LIST[0];

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: theme.separator, backgroundColor: theme.cardBackground }}>
        <ThemedText style={{ fontSize: 11, fontWeight: '600', color: theme.textTertiary, marginBottom: 8, textTransform: 'uppercase' }}>预览效果</ThemedText>
        <View style={{ padding: 14, borderRadius: 10, backgroundColor: theme.background }}>
          <ThemedText style={{ fontSize: 16, color: theme.textPrimary, marginBottom: 8 }}>{displayFont.preview}</ThemedText>
          <ThemedText style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 4 }}>📝 完成项目报告 · 收集数据、撰写初稿</ThemedText>
          <ThemedText style={{ fontSize: 13, color: theme.textTertiary }}>今天 · 已完成 3/5 · 循环任务</ThemedText>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 48, borderBottomWidth: 1, borderBottomColor: theme.separator }}
        contentContainerStyle={{ flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 8 }}>
        {FONT_CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat.id} style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: activeCategory === cat.id ? theme.primary : theme.separator + '40' }}
            onPress={() => setActiveCategory(cat.id)}>
            <Text style={{ fontSize: 13, fontWeight: '500', color: activeCategory === cat.id ? '#FFFFFF' : theme.textSecondary }}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {filteredFonts.map((font) => {
            const isActive = fontId === font.id;
            return (
              <TouchableOpacity key={font.id}
                style={{ width: (SCREEN_WIDTH - 24 - 20) / 3, borderRadius: 12, borderWidth: isActive ? 2 : 1, borderColor: isActive ? theme.primary : theme.separator, backgroundColor: theme.cardBackground, padding: 12, alignItems: 'center', position: 'relative' }}
                onPress={() => setFontId(font.id)} onLongPress={() => setPreviewFont(font)} activeOpacity={0.7}>
                <Text style={{ fontSize: 16, color: theme.textPrimary, marginBottom: 6, textAlign: 'center', fontFamily: font.id === 'default' ? undefined : font.id }}>
                  {font.preview.slice(0, 4)}
                </Text>
                <Text style={{ fontSize: 11, color: isActive ? theme.primary : theme.textSecondary, textAlign: 'center' }} numberOfLines={1}>{font.name}</Text>
                {isActive && (
                  <View style={{ position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
