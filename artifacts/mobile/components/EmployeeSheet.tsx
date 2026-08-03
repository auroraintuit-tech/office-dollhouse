import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  ScrollView, TextInput, Platform, KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useGame, Employee } from '@/contexts/GameContext';
import { EMPLOYEE_VISUALS } from '@/components/OfficeCharacters';

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  idle: { text: 'Available', color: '#7A8A99' },
  working: { text: 'Working', color: '#2ECC71' },
  done: { text: 'Result ready', color: '#F0A500' },
  attention: { text: 'Needs answer', color: '#E67E22' },
  away: { text: 'Away', color: '#7A8A99' },
};

type Tab = 'overview' | 'chat' | 'tasks';

export function EmployeeSheet({ employeeId, onClose }: { employeeId: string | null; onClose: () => void }) {
  const { state, sendEmployeeMessage, assignTask, acknowledgeResult } = useGame();
  const insets = useSafeAreaInsets();
  const bottom = Platform.OS === 'web' ? 34 : insets.bottom;

  const employee = state.employees.find(e => e.id === employeeId) ?? null;
  const [tab, setTab] = useState<Tab>('overview');
  const [chatInput, setChatInput] = useState('');
  const [taskInput, setTaskInput] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Reset tab state when opening a different employee
  useEffect(() => {
    if (employeeId) { setTab('overview'); setShowTaskForm(false); setChatInput(''); setTaskInput(''); }
  }, [employeeId]);

  // Mark "done" results as seen when the card opens
  useEffect(() => {
    if (employee?.status === 'done') {
      const id = setTimeout(() => acknowledgeResult(employee.id), 1500);
      return () => clearTimeout(id);
    }
  }, [employeeId, employee?.status]);

  if (!employee) {
    return <Modal visible={false} transparent><View /></Modal>;
  }

  const v = EMPLOYEE_VISUALS[employee.type];
  const status = STATUS_LABELS[employee.status] ?? STATUS_LABELS.idle;
  const currentTask = state.tasks.find(t => t.id === employee.currentTaskId) ?? null;
  const empTasks = state.tasks.filter(t => t.assignedTo === employee.id);

  function submitTask() {
    if (!taskInput.trim() || !employee) return;
    assignTask(employee.id, taskInput.trim());
    setTaskInput('');
    setShowTaskForm(false);
    setTab('tasks');
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function sendChat() {
    if (!chatInput.trim() || !employee) return;
    sendEmployeeMessage(employee.id, chatInput.trim());
    setChatInput('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }

  return (
    <Modal visible={!!employeeId} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} accessibilityLabel="Close" />
        <View style={[styles.sheet, { paddingBottom: bottom + 10 }]}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.avatar, { backgroundColor: v.color }]}>
              <Ionicons name={v.icon} size={26} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{employee.name}</Text>
              <Text style={styles.role}>{v.role}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: status.color + '22' }]}>
              <View style={[styles.statusDot, { backgroundColor: status.color }]} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close card">
              <Ionicons name="close" size={20} color="#7A8A99" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {([['overview', 'Overview'], ['chat', 'Chat'], ['tasks', 'Tasks']] as const).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                onPress={() => setTab(key)}
                style={[styles.tabBtn, tab === key && styles.tabBtnActive]}
                accessibilityRole="tab"
              >
                <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Body */}
          <View style={{ flex: 1 }}>
            {tab === 'overview' && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Current task</Text>
                  <Text style={styles.infoValue}>
                    {currentTask ? currentTask.title : 'No active task'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Last result</Text>
                  <Text style={styles.infoValue}>
                    {employee.lastResult ?? 'No results yet'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Hired</Text>
                  <Text style={styles.infoValue}>{new Date(employee.hiredAt).toLocaleDateString()}</Text>
                </View>
              </ScrollView>
            )}

            {tab === 'chat' && (
              <>
                <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                  {employee.messages.length === 0 && (
                    <Text style={styles.empty}>Say hello to {employee.name.split(' ')[0]}!</Text>
                  )}
                  {employee.messages.map(msg => (
                    <View key={msg.id} style={[styles.msgRow, msg.role === 'user' && styles.msgRowUser]}>
                      <View style={[styles.msgBubble, msg.role === 'user' && styles.msgBubbleUser]}>
                        <Text style={[styles.msgText, msg.role === 'user' && styles.msgTextUser]}>{msg.content}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    value={chatInput}
                    onChangeText={setChatInput}
                    placeholder={`Message ${employee.name.split(' ')[0]}...`}
                    placeholderTextColor="#9AA7B2"
                    returnKeyType="send"
                    onSubmitEditing={sendChat}
                  />
                  <TouchableOpacity onPress={sendChat} style={styles.sendBtn} accessibilityLabel="Send message">
                    <Ionicons name="send" size={17} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </>
            )}

            {tab === 'tasks' && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {empTasks.length === 0 && <Text style={styles.empty}>No tasks assigned yet.</Text>}
                {empTasks.map(task => (
                  <View key={task.id} style={styles.taskRow}>
                    <Ionicons
                      name={task.status === 'done' ? 'checkmark-circle' : 'time'}
                      size={18}
                      color={task.status === 'done' ? '#2E7D5B' : '#F0A500'}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.taskTitle, task.status === 'done' && styles.taskTitleDone]}>{task.title}</Text>
                      {task.result && <Text style={styles.taskResult}>{task.result}</Text>}
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Assign task */}
          {showTaskForm ? (
            <View style={styles.taskForm}>
              <TextInput
                style={styles.input}
                value={taskInput}
                onChangeText={setTaskInput}
                placeholder="Describe the task..."
                placeholderTextColor="#9AA7B2"
                autoFocus
                returnKeyType="send"
                onSubmitEditing={submitTask}
              />
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <TouchableOpacity onPress={() => setShowTaskForm(false)} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={submitTask} style={[styles.assignBtn, { flex: 1 }]}>
                  <Text style={styles.assignText}>Send task</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => employee.status !== 'working' && setShowTaskForm(true)}
              style={[styles.assignBtn, employee.status === 'working' && { opacity: 0.5 }]}
              activeOpacity={0.85}
              disabled={employee.status === 'working'}
              accessibilityLabel={employee.status === 'working' ? 'Busy with a task' : 'Assign a task'}
            >
              <Ionicons name={employee.status === 'working' ? 'hourglass' : 'add-circle'} size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.assignText}>{employee.status === 'working' ? 'Working on a task...' : 'Assign task'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(20,30,40,0.45)' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 8, paddingHorizontal: 20,
    height: 520,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: -4 },
    elevation: 20,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#D5DDE3', marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 17, fontFamily: 'Inter_700Bold', color: '#1E2A36' },
  role: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#7A8A99', marginTop: 1 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  closeBtn: { padding: 6 },
  tabs: { flexDirection: 'row', backgroundColor: '#EEF2F5', borderRadius: 12, padding: 3, marginBottom: 12 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 9 },
  tabBtnActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  tabText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#7A8A99' },
  tabTextActive: { color: '#1E2A36' },
  infoCard: { backgroundColor: '#F5F8FA', borderRadius: 14, padding: 14, marginBottom: 10 },
  infoLabel: { fontSize: 10.5, fontFamily: 'Inter_600SemiBold', color: '#7A8A99', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  infoValue: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#1E2A36', lineHeight: 20 },
  empty: { color: '#7A8A99', fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 24 },
  msgRow: { marginBottom: 10, alignItems: 'flex-start' },
  msgRowUser: { alignItems: 'flex-end' },
  msgBubble: { maxWidth: '80%', backgroundColor: '#F0F4F7', borderRadius: 14, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 9 },
  msgBubbleUser: { backgroundColor: '#C67C12', borderBottomLeftRadius: 14, borderBottomRightRadius: 4 },
  msgText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#1E2A36', lineHeight: 20 },
  msgTextUser: { color: '#FFFFFF' },
  inputRow: { flexDirection: 'row', gap: 10, marginTop: 10, alignItems: 'center' },
  input: {
    flex: 1, backgroundColor: '#F5F8FA', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 15, fontFamily: 'Inter_400Regular', color: '#1E2A36',
    borderWidth: 1, borderColor: '#E0E7EC',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#C67C12',
    alignItems: 'center', justifyContent: 'center',
  },
  taskRow: { flexDirection: 'row', gap: 10, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#EEF2F5', alignItems: 'flex-start' },
  taskTitle: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#1E2A36' },
  taskTitleDone: { color: '#7A8A99' },
  taskResult: { fontSize: 12.5, fontFamily: 'Inter_400Regular', color: '#2E7D5B', marginTop: 3, lineHeight: 17 },
  taskForm: { marginTop: 10 },
  assignBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#C67C12', borderRadius: 16, paddingVertical: 14, marginTop: 10,
    minHeight: 48,
  },
  assignText: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_700Bold' },
  cancelBtn: { paddingHorizontal: 18, justifyContent: 'center', borderRadius: 16, backgroundColor: '#EEF2F5', minHeight: 48 },
  cancelText: { color: '#7A8A99', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
