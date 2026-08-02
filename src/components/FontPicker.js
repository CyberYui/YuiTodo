// 字体选择器弹窗组件
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFont, FontStyle, FontStyleLabels, FontFamilyMap, FontStyleMap } from '../context/FontContext';

export default function FontPicker({ visible, onClose }) {
  const { theme } = useTheme();
  const { fontStyle, setFontStyle } = useFont();
  const styles = createStyles(theme);

  const handleSelect = (style) => {
    setFontStyle(style);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>选择字体风格</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeText, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>
          {Object.entries(FontStyleLabels).map(([style, label]) => (
            <TouchableOpacity
              key={style}
              style={[styles.item, fontStyle === style && { backgroundColor: theme.primary + '15', borderColor: theme.primary }]}
              onPress={() => handleSelect(style)}
            >
              <View style={styles.itemLeft}>
                <Text style={[styles.itemLabel, { color: theme.textPrimary, fontFamily: FontFamilyMap[style] }]}>
                  {label}
                </Text>
                <Text style={[styles.itemPreview, { color: theme.textTertiary, fontFamily: FontFamilyMap[style], fontSize: 20, fontStyle: FontStyleMap[style]?.fontStyle || 'normal', fontWeight: FontStyleMap[style]?.fontWeight || 'normal' }]}>
                  Aa 你好 任务
                </Text>
              </View>
              {fontStyle === style && (
                <Text style={[styles.check, { color: theme.primary }]}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    container: { width: 280, borderRadius: 16, padding: 16 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 16, fontWeight: '700' },
    closeText: { fontSize: 20 },
    item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1 },
    itemLeft: { flex: 1 },
    itemLabel: { fontSize: 15, fontWeight: '500', marginBottom: 4 },
    itemPreview: { fontSize: 13 },
    check: { fontSize: 18, fontWeight: '700', marginLeft: 12 },
  });
}
