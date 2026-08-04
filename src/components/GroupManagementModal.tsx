/**
 * Group management modal — add, edit, delete custom task groups.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { TaskGroup } from '../types';

const EMOJI_OPTIONS = ['📋', '💼', '📚', '🏠', '🎯', '🛒', '💪', '🎮', '❤️', '🌟', '🔧', '✈️', '🎵', '🍔', '💡', '🎨'];

interface Props {
  visible: boolean;
  groups: TaskGroup[];
  onClose: () => void;
  onSave: (updatedList: any[], deletedId?: number) => Promise<any[] | null>;
}

export default function GroupManagementModal({ visible, groups, onClose, onSave }: Props) {
  const { theme } = useTheme();
  const [groupList, setGroupList] = useState<TaskGroup[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
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

  const handleAdd = useCallback(async () => {
    if (!newName.trim()) { Alert.alert('提示', '请输入分组名称'); return; }
    const result = await onSave([...groupList, { name: newName.trim(), icon: editIcon, isNew: true }]);
    if (result) { setGroupList(result); setNewName(''); setNewIcon('📋'); setShowAdd(false); }
  }, [newName, editIcon, groupList, onSave]);

  const handleEdit = useCallback(async (id: number) => {
    if (!editName.trim()) { Alert.alert('提示', '请输入分组名称'); return; }
    const updated = groupList.map((g) => g.id === id ? { ...g, name: editName.trim(), icon: editIcon, isEdited: true } : g);
    const result = await onSave(updated);
    if (result) { setGroupList(result); setEditingId(null); }
  }, [editName, editIcon, groupList, onSave]);

  const handleDelete = useCallback((id: number) => {
    Alert.alert('删除分组', '删除后该分组下的任务将变为无分组。确定删除吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: async () => {
        const updated = groupList.filter((g) => g.id !== id);
        const result = await onSave(updated, id);
        if (result) setGroupList(result);
      }},
    ]);
  }, [groupList, onSave]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={[s.container, { backgroundColor: theme.cardBackground }]}>
          <View style={s.header}>
            <Text style={[s.title, { color: theme.textPrimary }]}>管理分组</Text>
            <TouchableOpacity onPress={onClose}><Text style={{ fontSize: 20, color: theme.textSecondary }}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView style={{ paddingHorizontal: 20, paddingVertical: 12 }} showsVerticalScrollIndicator={false}>
            {groupList.map((group) => (
              <View key={group.id} style={[s.item, { borderColor: theme.separator }]}>
                {editingId === group.id ? (
                  <View style={s.editRow}>
                    <TouchableOpacity style={[s.iconBtn, { borderColor: theme.separator }]}
                      onPress={() => { const idx = EMOJI_OPTIONS.indexOf(editIcon); setEditIcon(EMOJI_OPTIONS[(idx + 1) % EMOJI_OPTIONS.length]); }}>
                      <Text style={{ fontSize: 20 }}>{editIcon}</Text>
                    </TouchableOpacity>
                    <TextInput style={[s.input, { color: theme.textPrimary, borderColor: theme.separator }]} value={editName} onChangeText={setEditName} placeholder="分组名称" placeholderTextColor={theme.textTertiary} maxLength={10} />
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: theme.primary }]} onPress={() => handleEdit(group.id)}>
                      <Text style={s.actionText}>保存</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: theme.separator + '40' }]} onPress={() => setEditingId(null)}>
                      <Text style={[s.actionText, { color: theme.textSecondary }]}>取消</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={s.displayRow}>
                    <Text style={{ fontSize: 20 }}>{group.icon}</Text>
                    <Text style={{ flex: 1, fontSize: 15, fontWeight: '500', color: theme.textPrimary }}>{group.name}</Text>
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: theme.separator + '40' }]}
                      onPress={() => { setEditingId(group.id); setEditName(group.name); setEditIcon(group.icon); }}>
                      <Text style={[s.actionText, { color: theme.textSecondary }]}>编辑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: theme.danger + '20' }]} onPress={() => handleDelete(group.id)}>
                      <Text style={[s.actionText, { color: theme.danger }]}>删除</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
            {showAdd ? (
              <View style={[s.item, { borderColor: theme.primary }]}>
                <View style={s.editRow}>
                  <TouchableOpacity style={[s.iconBtn, { borderColor: theme.primary }]}
                    onPress={() => { const idx = EMOJI_OPTIONS.indexOf(newIcon); setNewIcon(EMOJI_OPTIONS[(idx + 1) % EMOJI_OPTIONS.length]); }}>
                    <Text style={{ fontSize: 20 }}>{newIcon}</Text>
                  </TouchableOpacity>
                  <TextInput style={[s.input, { color: theme.textPrimary, borderColor: theme.primary }]} value={newName} onChangeText={setNewName} placeholder="新分组名称" placeholderTextColor={theme.textTertiary} maxLength={10} autoFocus />
                  <TouchableOpacity style={[s.actionBtn, { backgroundColor: theme.primary }]} onPress={handleAdd}>
                    <Text style={s.actionText}>添加</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.actionBtn, { backgroundColor: theme.separator + '40' }]} onPress={() => setShowAdd(false)}>
                    <Text style={[s.actionText, { color: theme.textSecondary }]}>取消</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={[s.addBtn, { borderColor: theme.primary }]} onPress={() => setShowAdd(true)}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: theme.primary }}>+ 添加分组</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', paddingBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '700' },
  item: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 8 },
  displayRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 8, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  actionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  addBtn: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
});
