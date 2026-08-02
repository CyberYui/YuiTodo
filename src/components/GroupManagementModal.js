// 分组管理弹窗组件
// 职责：添加、编辑、删除自定义分组

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const EMOJI_OPTIONS = ['📋', '💼', '📚', '🏠', '🎯', '🛒', '💪', '🎮', '❤️', '🌟', '🔧', '✈️', '🎵', '🍔', '💡', '🎨'];

export default function GroupManagementModal({ visible, groups, onClose, onSave }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [groupList, setGroupList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('📋');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('📋');

  useEffect(() => {
    if (visible) {
      setGroupList([...groups]);
      setShowAdd(false);
      setEditingId(null);
    }
  }, [visible, groups]);

  const handleAdd = async () => {
    if (!newName.trim()) {
      Alert.alert('提示', '请输入分组名称');
      return;
    }
    const newGroup = { name: newName.trim(), icon: editIcon, isNew: true };
    const result = await onSave([...groupList, newGroup]);
    if (result) {
      setGroupList(result);
      setNewName('');
      setNewIcon('📋');
      setShowAdd(false);
    }
  };

  const handleEdit = async (id) => {
    if (!editName.trim()) {
      Alert.alert('提示', '请输入分组名称');
      return;
    }
    const updated = groupList.map((g) =>
      g.id === id ? { ...g, name: editName.trim(), icon: editIcon, isEdited: true } : g
    );
    const result = await onSave(updated);
    if (result) {
      setGroupList(result);
      setEditingId(null);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('删除分组', '删除后该分组下的任务将变为无分组。确定删除吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          const updated = groupList.filter((g) => g.id !== id);
          const result = await onSave(updated, id);
          if (result) {
            setGroupList(result);
          }
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>管理分组</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeText, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {groupList.map((group) => (
              <View key={group.id || 'new'} style={[styles.groupItem, { borderColor: theme.separator }]}>
                {editingId === group.id ? (
                  <View style={styles.editRow}>
                    <TouchableOpacity
                      style={[styles.iconButton, { borderColor: theme.separator }]}
                      onPress={() => {
                        const idx = EMOJI_OPTIONS.indexOf(editIcon);
                        setEditIcon(EMOJI_OPTIONS[(idx + 1) % EMOJI_OPTIONS.length]);
                      }}
                    >
                      <Text style={styles.iconText}>{editIcon}</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={[styles.input, { color: theme.textPrimary, borderColor: theme.separator }]}
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="分组名称"
                      placeholderTextColor={theme.textTertiary}
                      maxLength={10}
                    />
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: theme.primary }]}
                      onPress={() => handleEdit(group.id)}
                    >
                      <Text style={styles.actionBtnText}>保存</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: theme.separator + '40' }]}
                      onPress={() => setEditingId(null)}
                    >
                      <Text style={[styles.actionBtnText, { color: theme.textSecondary }]}>取消</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.displayRow}>
                    <Text style={styles.iconText}>{group.icon}</Text>
                    <Text style={[styles.groupName, { color: theme.textPrimary }]}>{group.name}</Text>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: theme.separator + '40' }]}
                      onPress={() => {
                        setEditingId(group.id);
                        setEditName(group.name);
                        setEditIcon(group.icon);
                      }}
                    >
                      <Text style={[styles.actionBtnText, { color: theme.textSecondary }]}>编辑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: theme.danger + '20' }]}
                      onPress={() => handleDelete(group.id)}
                    >
                      <Text style={[styles.actionBtnText, { color: theme.danger }]}>删除</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}

            {/* 添加新分组 */}
            {showAdd ? (
              <View style={[styles.groupItem, { borderColor: theme.primary }]}>
                <View style={styles.editRow}>
                  <TouchableOpacity
                    style={[styles.iconButton, { borderColor: theme.primary }]}
                    onPress={() => {
                      const idx = EMOJI_OPTIONS.indexOf(newIcon);
                      setNewIcon(EMOJI_OPTIONS[(idx + 1) % EMOJI_OPTIONS.length]);
                    }}
                  >
                    <Text style={styles.iconText}>{newIcon}</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, { color: theme.textPrimary, borderColor: theme.primary }]}
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="新分组名称"
                    placeholderTextColor={theme.textTertiary}
                    maxLength={10}
                    autoFocus
                  />
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.primary }]}
                    onPress={handleAdd}
                  >
                    <Text style={styles.actionBtnText}>添加</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.separator + '40' }]}
                    onPress={() => setShowAdd(false)}
                  >
                    <Text style={[styles.actionBtnText, { color: theme.textSecondary }]}>取消</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.addButton, { borderColor: theme.primary }]}
                onPress={() => setShowAdd(true)}
              >
                <Text style={[styles.addButtonText, { color: theme.primary }]}>+ 添加分组</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    container: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', paddingBottom: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.separator },
    title: { fontSize: 18, fontWeight: '700' },
    closeText: { fontSize: 20 },
    list: { paddingHorizontal: 20, paddingVertical: 12 },
    groupItem: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 8 },
    displayRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    editRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    iconText: { fontSize: 20 },
    groupName: { flex: 1, fontSize: 15, fontWeight: '500' },
    iconButton: { width: 40, height: 40, borderRadius: 8, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    input: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14 },
    actionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
    actionBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
    addButton: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
    addButtonText: { fontSize: 15, fontWeight: '600' },
  });
}
