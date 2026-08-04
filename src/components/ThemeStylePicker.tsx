/**
 * Theme style picker — 10 visual styles selection.
 */

import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { THEME_STYLES } from '../theme/colors';
import ThemedText from './ThemedText';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ThemeStylePicker({ visible, onClose }: Props) {
  const { theme, themeStyle, setThemeStyle, availableStyles } = useTheme();

  const handleSelect = (styleId: string) => {
    setThemeStyle(styleId);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.separator }]}>
          <ThemedText style={{ fontSize: 18, fontWeight: '700', color: theme.textPrimary }}>选择主题风格</ThemedText>
          <TouchableOpacity onPress={onClose}>
            <ThemedText style={{ fontSize: 16, fontWeight: '600', color: theme.primary }}>完成</ThemedText>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.grid}>
          {availableStyles.map((style) => {
            const config = THEME_STYLES[style.id];
            const isSelected = themeStyle === style.id;
            const lc = config.light;
            return (
              <TouchableOpacity key={style.id}
                style={{ width: CARD_WIDTH, borderRadius: 12, borderWidth: isSelected ? 2 : 1, borderColor: isSelected ? theme.primary : theme.separator, backgroundColor: theme.cardBackground, overflow: 'hidden' }}
                onPress={() => handleSelect(style.id)}>
                <View style={{ height: 80, padding: 8, backgroundColor: lc.bg }}>
                  <View style={{ flex: 1, padding: 6, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: lc.card, borderRadius: config.cardRadius }}>
                    {config.leftBar && <View style={{ width: 4, height: '100%', borderRadius: 2, backgroundColor: lc.primary }} />}
                    <View style={{ flex: 1 }}>
                      <View style={{ height: 6, borderRadius: 2, backgroundColor: lc.text, marginBottom: 4 }} />
                      <View style={{ height: 4, borderRadius: 2, width: '60%', backgroundColor: lc.sub }} />
                    </View>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
                  <ThemedText style={{ fontSize: 14, fontWeight: '600', color: theme.textPrimary }}>{style.name}</ThemedText>
                  {isSelected && <Text style={{ color: theme.primary, fontSize: 14 }}>✓</Text>}
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 },
});
