import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  ScrollView, TextInput, Platform,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useGame, Employee, EmployeeType } from '@/contexts/GameContext';

// ── Bottom sheet wrapper ──────────────────────────────────────────────
interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  height?: number;
}

function Sheet({ visible, onClose, title, children, height = 460 }: SheetProps) {
  const insets = useSafeAreaInsets();
  const bottom = Platform.OS === 'web' ? 34 : insets.bottom;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        <View style={[styles.sheet, { height: height + bottom, paddingBottom: bottom + 8 }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#8C7050" />
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

// ── Task Board ────────────────────────────────────────────────────────
export function TaskModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { state, addTask, completeTask } = useGame();
  const [input, setInput] = useState('');

  function handleAdd() {
    if (!input.trim()) return;
    addTask(input.trim());
    setInput('');
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  const pending = state.tasks.filter(t => t.status !== 'done');
  const done = state.tasks.filter(t => t.status === 'done');

  return (
    <Sheet visible={visible} onClose={onClose} title="Task Board" height={500}>
      <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
        {pending.map(task => (
          <TouchableOpacity
            key={task.id}
            style={styles.taskRow}
            onPress={() => {
              completeTask(task.id);
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
            activeOpacity={0.75}
          >
            <View style={styles.taskCheck} />
            <Text style={styles.taskText}>{task.title}</Text>
          </TouchableOpacity>
        ))}
        {done.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Completed</Text>
            {done.map(task => (
              <View key={task.id} style={[styles.taskRow, styles.taskDone]}>
                <Ionicons name="checkmark-circle" size={18} color="#3D8B66" style={{ marginRight: 10 }} />
                <Text style={[styles.taskText, styles.taskTextDone]}>{task.title}</Text>
              </View>
            ))}
          </>
        )}
        {pending.length === 0 && done.length === 0 && (
          <Text style={styles.emptyText}>No tasks yet. Add one below.</Text>
        )}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.taskInput}
          value={input}
          onChangeText={setInput}
          placeholder="New task..."
          placeholderTextColor="#8C7050"
          returnKeyType="done"
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity onPress={handleAdd} style={styles.addBtn} activeOpacity={0.8}>
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Sheet>
  );
}

// ── Financial Safe ────────────────────────────────────────────────────
export function SafeModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { state } = useGame();
  const financeEvents = state.events.filter(e => e.type === 'finance' || e.type === 'hire');

  return (
    <Sheet visible={visible} onClose={onClose} title="Company Finances" height={440}>
      {/* Balance */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>${state.balance.toLocaleString()}</Text>
        <Text style={styles.balanceSub}>Monthly cost: ${(state.employees.length * 1000).toLocaleString()}/mo</Text>
      </View>
      {/* Recent transactions */}
      <Text style={styles.sectionLabel}>Recent Activity</Text>
      <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
        {financeEvents.length === 0 && (
          <Text style={styles.emptyText}>No transactions yet.</Text>
        )}
        {financeEvents.slice(0, 15).map(ev => (
          <View key={ev.id} style={styles.txRow}>
            <Ionicons
              name={ev.type === 'hire' ? 'person-add' : 'card'}
              size={16}
              color={ev.type === 'hire' ? '#C43020' : '#3D8B66'}
              style={{ marginRight: 10 }}
            />
            <Text style={styles.txText}>{ev.message}</Text>
            <Text style={styles.txTime}>
              {new Date(ev.timestamp).toLocaleDateString()}
            </Text>
          </View>
        ))}
      </ScrollView>
    </Sheet>
  );
}

// ── Document Folder ───────────────────────────────────────────────────
export function FolderModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { state } = useGame();
  const TYPE_ICONS: Record<string, any> = {
    contract: 'document-text',
    report: 'bar-chart',
    invoice: 'receipt',
    memo: 'mail',
  };
  const TYPE_COLORS: Record<string, string> = {
    contract: '#1A3A6A',
    report: '#3A1A5A',
    invoice: '#5A2A0A',
    memo: '#1A3A2A',
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Documents" height={420}>
      <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
        {state.documents.length === 0 && (
          <Text style={styles.emptyText}>No documents yet.</Text>
        )}
        {state.documents.map(doc => (
          <TouchableOpacity key={doc.id} style={styles.docRow} activeOpacity={0.75}>
            <View style={[styles.docIcon, { backgroundColor: TYPE_COLORS[doc.type] }]}>
              <Ionicons name={TYPE_ICONS[doc.type]} size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.docTitle}>{doc.title}</Text>
              <Text style={styles.docType}>{doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#8C7050" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Sheet>
  );
}

// ── Hire Employee ─────────────────────────────────────────────────────
const EMPLOYEE_DEFS: Array<{
  type: EmployeeType; label: string; desc: string; cost: number; icon: any; color: string;
}> = [
  { type: 'assistant', label: 'Assistant', desc: 'Organizes your schedule & tasks', cost: 800, icon: 'person', color: '#3A1A5A' },
  { type: 'accountant', label: 'Accountant', desc: 'Manages finances & reports', cost: 1200, icon: 'calculator', color: '#1A3A6A' },
  { type: 'lawyer', label: 'Lawyer', desc: 'Handles contracts & compliance', cost: 1500, icon: 'shield-checkmark', color: '#1A3A2A' },
  { type: 'marketer', label: 'Marketer', desc: 'Drives growth & campaigns', cost: 1000, icon: 'megaphone', color: '#5A2A0A' },
  { type: 'it', label: 'IT Specialist', desc: 'Tech support & automation', cost: 1100, icon: 'hardware-chip', color: '#0A3A3A' },
  { type: 'warehouse', label: 'Warehouse Mgr', desc: 'Inventory & logistics', cost: 900, icon: 'cube', color: '#3A2A0A' },
];

export function HireModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { state, addEmployee } = useGame();
  const [hiring, setHiring] = useState(false);

  React.useEffect(() => {
    if (visible) setHiring(false);
  }, [visible]);

  function hire(type: EmployeeType) {
    if (hiring) return; // guard against double-tap duplicates
    setHiring(true);
    addEmployee(type);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  }

  return (
    <Sheet visible={visible} onClose={onClose} title="Hire AI Employee" height={520}>
      <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
        {EMPLOYEE_DEFS.map(def => {
          const alreadyHired = state.employees.some(e => e.type === def.type);
          const canAfford = state.balance >= def.cost;
          return (
            <TouchableOpacity
              key={def.type}
              style={[styles.hireRow, alreadyHired && styles.hireRowDisabled]}
              onPress={() => !alreadyHired && canAfford && hire(def.type)}
              activeOpacity={alreadyHired || !canAfford ? 1 : 0.75}
            >
              <View style={[styles.hireIcon, { backgroundColor: def.color }]}>
                <Ionicons name={def.icon} size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.hireLabel}>{def.label}</Text>
                <Text style={styles.hireDesc}>{def.desc}</Text>
              </View>
              <View style={styles.hireCostBadge}>
                {alreadyHired ? (
                  <Ionicons name="checkmark-circle" size={20} color="#3D8B66" />
                ) : (
                  <Text style={[styles.hireCost, !canAfford && styles.hireCostDisabled]}>
                    ${def.cost.toLocaleString()}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Sheet>
  );
}

// ── Employee Chat ─────────────────────────────────────────────────────
export function ChatModal({ employee, onClose }: { employee: Employee | null; onClose: () => void }) {
  const { sendEmployeeMessage } = useGame();
  const [input, setInput] = useState('');

  function send() {
    if (!employee || !input.trim()) return;
    sendEmployeeMessage(employee.id, input.trim());
    setInput('');
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  return (
    <Sheet visible={!!employee} onClose={onClose} title={employee?.name ?? ''} height={500}>
      <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
        {(employee?.messages ?? []).length === 0 && (
          <Text style={styles.emptyText}>Say hello to your new team member!</Text>
        )}
        {(employee?.messages ?? []).map(msg => (
          <View key={msg.id} style={[styles.msgRow, msg.role === 'user' && styles.msgRowUser]}>
            <View style={[styles.msgBubble, msg.role === 'user' && styles.msgBubbleUser]}>
              <Text style={[styles.msgText, msg.role === 'user' && styles.msgTextUser]}>
                {msg.content}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.taskInput}
          value={input}
          onChangeText={setInput}
          placeholder={`Message ${employee?.name ?? ''}...`}
          placeholderTextColor="#8C7050"
          returnKeyType="send"
          onSubmitEditing={send}
        />
        <TouchableOpacity onPress={send} style={styles.addBtn} activeOpacity={0.8}>
          <Ionicons name="send" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Sheet>
  );
}

// ── Event Feed ────────────────────────────────────────────────────────
export function EventFeed({ visible }: { visible: boolean }) {
  const { state } = useGame();
  if (!visible || state.events.length === 0) return null;
  const ev = state.events[0];
  const ICONS: Record<string, any> = { hire: 'person-add', task: 'checkmark-circle', finance: 'card', system: 'information-circle' };
  const COLORS: Record<string, string> = { hire: '#C67C12', task: '#3D8B66', finance: '#1A6A8A', system: '#5A3A8A' };
  return (
    <View style={styles.eventFeed} pointerEvents="none">
      <Ionicons name={ICONS[ev.type]} size={14} color={COLORS[ev.type]} />
      <Text style={styles.eventText} numberOfLines={1}>{ev.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    backgroundColor: '#F5EDD8',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 20,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CEB898',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#1E120A',
  },
  closeBtn: {
    padding: 4,
  },
  listScroll: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#8C7050',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyText: {
    color: '#8C7050',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 24,
  },
  // Tasks
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD0B8',
  },
  taskDone: { opacity: 0.55 },
  taskCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#C67C12',
    marginRight: 12,
  },
  taskText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: '#1E120A',
  },
  taskTextDone: {
    textDecorationLine: 'line-through',
    color: '#8C7050',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    alignItems: 'center',
  },
  taskInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#1E120A',
    borderWidth: 1.5,
    borderColor: '#CEB898',
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#C67C12',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C67C12',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  // Finance
  balanceCard: {
    backgroundColor: '#2C1810',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#8C7050',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  balanceAmount: {
    color: '#F0A500',
    fontSize: 38,
    fontFamily: 'Inter_700Bold',
  },
  balanceSub: {
    color: '#6B4226',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD0B8',
  },
  txText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#1E120A',
  },
  txTime: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#8C7050',
    marginLeft: 8,
  },
  // Documents
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD0B8',
    gap: 12,
  },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#1E120A',
  },
  docType: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#8C7050',
    marginTop: 2,
  },
  // Hire
  hireRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD0B8',
    gap: 12,
  },
  hireRowDisabled: { opacity: 0.5 },
  hireIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hireLabel: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#1E120A',
  },
  hireDesc: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#8C7050',
    marginTop: 2,
  },
  hireCostBadge: {
    alignItems: 'flex-end',
  },
  hireCost: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#C67C12',
  },
  hireCostDisabled: {
    color: '#8C7050',
  },
  // Chat
  msgRow: {
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  msgRowUser: {
    alignItems: 'flex-end',
  },
  msgBubble: {
    maxWidth: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#DDD0B8',
  },
  msgBubbleUser: {
    backgroundColor: '#C67C12',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 4,
    borderColor: 'transparent',
  },
  msgText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#1E120A',
    lineHeight: 20,
  },
  msgTextUser: {
    color: '#FFFFFF',
  },
  // Event feed
  eventFeed: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(44, 24, 16, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    maxWidth: 280,
  },
  eventText: {
    color: '#F5EDD8',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    flex: 1,
  },
});
