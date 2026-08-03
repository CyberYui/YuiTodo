// 字体选择器页面（网格布局 + 实时预览 + 分类筛选）
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFont } from '../context/FontContext';
import { FONT_LIST, FONT_CATEGORIES } from '../theme/fonts';
import ThemedText from './ThemedText';

export default function FontPicker({ navigation }) {
  const { theme } = useTheme();
  const { fontId, setFontId } = useFont();
  const [activeCategory, setActiveCategory] = useState('all');
  const [previewFont, setPreviewFont] = useState(null);

  const filteredFonts = activeCategory === 'all'
    ? FONT_LIST
    : FONT_LIST.filter((f) => f.category === activeCategory);

  const handleSelect = (id) => {
    setFontId(id);
  };

  const handlePreview = (font) => {
    setPreviewFont(font);
  };

  const styles = createStyles(theme);
  const displayFont = previewFont || FONT_LIST.find((f) => f.id === fontId) || FONT_LIST[0];

  return (
    <View style={styles.container}>
      {/* 预览区域 */}
      <View style={[styles.previewSection, { backgroundColor: theme.cardBackground, borderColor: theme.separator }]}>
        <ThemedText style={[styles.previewLabel, { color: theme.textTertiary }]}>预览效果</ThemedText>
        <View style={[styles.previewCard, { backgroundColor: theme.background }]}>
          <ThemedText style={[styles.previewTitle, { color: theme.textPrimary }]}>
            {displayFont.preview}
          </ThemedText>
          <ThemedText style={[styles.previewBody, { color: theme.textSecondary }]}>
            📝 完成项目报告 · 收集数据、撰写初稿、审核修改、提交报告
          </ThemedText>
          <ThemedText style={[styles.previewBody, { color: theme.textTertiary }]}>
            今天 · 已完成 3/5 · 循环任务
          </ThemedText>
        </View>
      </View>

      {/* 分类筛选 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar} contentContainerStyle={styles.categoryContent}>
        {FONT_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryChip, activeCategory === cat.id && { backgroundColor: theme.primary }]}
            onPress={() => setActiveCategory(cat.id)}
          >
            <Text style={[styles.categoryText, { color: activeCategory === cat.id ? '#FFFFFF' : theme.textSecondary }]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 字体网格 */}
      <ScrollView style={styles.gridContainer} contentContainerStyle={styles.gridContent}>
        <View style={styles.grid}>
          {filteredFonts.map((font) => {
            const isActive = fontId === font.id;
            const fontStyle = font.id === 'default' ? undefined : font.id;
            return (
              <TouchableOpacity
                key={font.id}
                style={[
                  styles.fontCard,
                  { backgroundColor: theme.cardBackground, borderColor: isActive ? theme.primary : theme.separator },
                  isActive && { borderWidth: 2 },
                ]}
                onPress={() => handleSelect(font.id)}
                onLongPress={() => handlePreview(font)}
                activeOpacity={0.7}
              >
                <Text style={[styles.fontPreview, { color: theme.textPrimary, fontFamily: fontStyle }]}>
                  {font.preview.slice(0, 4)}
                </Text>
                <Text style={[styles.fontName, { color: isActive ? theme.primary : theme.textSecondary }]} numberOfLines={1}>
                  {font.name}
                </Text>
                {isActive && (
                  <View style={[styles.activeBadge, { backgroundColor: theme.primary }]}>
                    <Text style={styles.activeBadgeText}>✓</Text>
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

function createStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    previewSection: { padding: 16, borderBottomWidth: 1 },
    previewLabel: { fontSize: 11, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' },
    previewCard: { padding: 14, borderRadius: 10 },
    previewTitle: { fontSize: 16, marginBottom: 8 },
    previewBody: { fontSize: 13, marginBottom: 4 },
    categoryBar: { maxHeight: 48, borderBottomWidth: 1, borderBottomColor: theme.separator },
    categoryContent: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
    categoryChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: theme.separator + '40' },
    categoryText: { fontSize: 13, fontWeight: '500' },
    gridContainer: { flex: 1 },
    gridContent: { padding: 12 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    fontCard: {
      width: (Dimensions.get('window').width - 24 - 20) / 3,
      borderRadius: 12,
      borderWidth: 1,
      padding: 12,
      alignItems: 'center',
      position: 'relative',
    },
    fontPreview: { fontSize: 16, marginBottom: 6, textAlign: 'center' },
    fontName: { fontSize: 11, textAlign: 'center' },
    activeBadge: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 18,
      height: 18,
      borderRadius: 9,
      justifyContent: 'center',
      alignItems: 'center',
    },
    activeBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  });
}
