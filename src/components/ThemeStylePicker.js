// 主题风格选择器（8种风格）
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { THEME_STYLES } from '../theme/colors';
import ThemedText from './ThemedText';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

export default function ThemeStylePicker({ visible, onClose }) {
  const { theme, themeStyle, setThemeStyle, availableStyles } = useTheme();

  const handleSelect = (styleId) => {
    setThemeStyle(styleId);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.separator }]}>
          <ThemedText style={[styles.title, { color: theme.textPrimary }]}>选择主题风格</ThemedText>
          <TouchableOpacity onPress={onClose}>
            <ThemedText style={[styles.closeBtn, { color: theme.primary }]}>完成</ThemedText>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.grid}>
          {availableStyles.map((style) => {
            const styleConfig = THEME_STYLES[style.id];
            const isSelected = themeStyle === style.id;
            const lightColors = styleConfig.light;
            return (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.card,
                  { borderColor: isSelected ? theme.primary : theme.separator, backgroundColor: theme.cardBackground },
                  isSelected && { borderWidth: 2 },
                ]}
                onPress={() => handleSelect(style.id)}
              >
                <View style={[styles.preview, { backgroundColor: lightColors.background }]}>
                  <View style={[styles.previewCard, { backgroundColor: lightColors.cardBackground, borderRadius: styleConfig.cardRadius }]}>
                    {styleConfig.leftBarWidth > 0 && (
                      <View style={[styles.previewBar, { backgroundColor: lightColors.primary, width: styleConfig.leftBarWidth }]} />
                    )}
                    <View style={{ flex: 1 }}>
                      <ThemedText style={[styles.previewText, { color: lightColors.textPrimary }]}>示例任务</ThemedText>
                      <ThemedText style={[styles.previewSub, { color: lightColors.textTertiary }]}>今天</ThemedText>
                    </View>
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <ThemedText style={[styles.cardName, { color: theme.textPrimary }]}>{style.icon} {style.name}</ThemedText>
                  {isSelected && <Text style={{ color: theme.primary, fontSize: 16 }}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 48 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '700' },
  closeBtn: { fontSize: 16, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 },
  card: { width: CARD_WIDTH, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  preview: { height: 100, padding: 8 },
  previewCard: { flex: 1, padding: 6, flexDirection: 'row', alignItems: 'center', gap: 6 },
  previewBar: { height: '100%', borderRadius: 2 },
  previewText: { fontSize: 11 },
  previewSub: { fontSize: 9, marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 },
  cardName: { fontSize: 14, fontWeight: '600' },
});
