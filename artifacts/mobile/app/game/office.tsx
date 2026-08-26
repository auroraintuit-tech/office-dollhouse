import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, Platform, ScrollView, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useGame } from '@/contexts/GameContext';
import IsometricRoom from '@/components/IsometricRoom';
import { TaskModal, SafeModal, FolderModal, HireModal } from '@/components/GameModals';
import { EmployeeSheet } from '@/components/EmployeeSheet';
import { ToastStack, JournalModal } from '@/components/Toasts';
import { EMPLOYEE_VISUALS } from '@/components/OfficeCharacters';
import AvatarSprite from '@/components/AvatarSprite';
import { OFFICE_THEMES } from '@/constants/colors';

type ActiveModal = 'tasks' | 'safe' | 'folder' | 'hire' | 'journal' | null;
type NavTab = 'office' | 'team' | 'tasks' | 'docs';

const TOP_BAR_H = 52;
const NAV_H = 58;

export default function OfficeScreen() {
  const { state, advanceTutorial, addTask, completeTask } = useGame();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 47 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 20 : Math.max(insets.bottom, 8);

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [navTab, setNavTab] = useState<NavTab>('office');
  const [taskInput, setTaskInput] = useState('');

  const t = OFFICE_THEMES[state.officeStyle];

  const level = 1 + Math.floor(state.xp / 100);
  const companyName = state.company?.name ?? 'Моя компания';
  const pendingTasks = state.tasks.filter(tk => tk.status !== 'done').length;
  const formatBalance = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : `$${n}`;

  function haptic() {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function handleObjectTap(obj: 'board' | 'safe' | 'desk' | 'folder' | 'hire') {
    haptic();
    if (state.tutorialStep === 1 && obj === 'board') advanceTutorial();
    if (state.tutorialStep === 2 && obj === 'safe') advanceTutorial();
    if (state.tutorialStep === 3 && (obj === 'desk' || obj === 'folder')) advanceTutorial();

    if (obj === 'board' || obj === 'desk') setActiveModal('tasks');
    else if (obj === 'safe') setActiveModal('safe');
    else if (obj === 'folder') setActiveModal('folder');
    else if (obj === 'hire') setActiveModal('hire');
  }

  function handleAddTask() {
    if (!taskInput.trim()) return;
    addTask(taskInput.trim());
    setTaskInput('');
    haptic();
  }

  // Objective banner text
  const objective = (() => {
    if (state.tutorialStep === 1) return 'Нажмите на подсвеченную доску задач';
    if (state.tutorialStep === 2) return 'Откройте сейф и проверьте финансы';
    if (state.tutorialStep === 3) return 'Изучите рабочий стол — ваш центр управления';
    if (state.employees.length === 0) return 'Наймите первого AI-сотрудника';
    if (state.xp < 100) return `До новой зоны офиса: ${100 - state.xp} XP`;
    return null;
  })();

  const roomHeight = navTab === 'office' ? undefined : 0;

  return (
    <View style={[styles.screen, { backgroundColor: t.bg }]}>
      {/* ─── Compact top bar ─── */}
      <View style={[styles.topBar, { paddingTop: topPad, height: topPad + TOP_BAR_H }]}>
        <View style={styles.topLeft}>
          {state.company?.logoUri ? (
            <Image source={{ uri: state.company.logoUri }} style={styles.logo} />
          ) : (
            <View style={[styles.logoPlaceholder, { backgroundColor: '#C67C12' }]}>
              <Text style={styles.logoText}>{companyName.slice(0, 2).toUpperCase()}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.companyName} numberOfLines={1}>{companyName}</Text>
            <Text style={styles.levelText}>Уровень {level} · {state.xp % 100}/100 XP</Text>
          </View>
        </View>
        <View style={styles.topRight}>
          <TouchableOpacity onPress={() => { haptic(); setActiveModal('safe'); }} style={styles.balancePill} accessibilityLabel="Company balance">
            <Ionicons name="wallet" size={13} color="#B8780A" />
            <Text style={styles.balanceText}>{formatBalance(state.balance)}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { haptic(); setActiveModal('journal'); }} style={styles.iconBtn} accessibilityLabel="Event journal">
            <Ionicons name="notifications-outline" size={19} color="#4A5A68" />
            {state.events.length > 0 && <View style={styles.journalDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Objective strip ─── */}
      {navTab === 'office' && objective && (
        <View style={styles.objectiveStrip}>
          <Ionicons name="flag" size={12} color="#B8780A" />
          <Text style={styles.objectiveText} numberOfLines={1}>{objective}</Text>
        </View>
      )}

      {/* ─── Main content ─── */}
      <View style={{ flex: 1 }}>
        {navTab === 'office' && (
          <View style={styles.roomWrap}>
            <RoomAutoSize
              render={(h) => state.player ? (
                <IsometricRoom
                  officeStyle={state.officeStyle}
                  avatarId={state.player.avatarId}
                  photoUri={state.player.photoUri}
                  tutorialStep={state.tutorialStep}
                  employees={state.employees}
                  height={h}
                  onObjectTap={handleObjectTap}
                  onEmployeeTap={(emp) => { haptic(); setSelectedEmployeeId(emp.id); }}
                />
              ) : null}
            />
            {/* Hire FAB */}
            {state.tutorialStep >= 4 && (
              <TouchableOpacity
                onPress={() => { haptic(); setActiveModal('hire'); }}
                style={styles.hireFab}
                activeOpacity={0.85}
                accessibilityLabel="Hire employee"
              >
                <Ionicons name="person-add" size={17} color="#FFFFFF" />
                <Text style={styles.hireFabText}>Нанять</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {navTab === 'team' && (
          <ScrollView contentContainerStyle={styles.listPad} showsVerticalScrollIndicator={false}>
            {state.employees.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={40} color="#9AA7B2" />
                <Text style={styles.emptyTitle}>Команды пока нет</Text>
                <Text style={styles.emptyDesc}>Наймите AI-сотрудника — он появится в вашем офисе.</Text>
                <TouchableOpacity onPress={() => setActiveModal('hire')} style={styles.emptyBtn}>
                  <Text style={styles.emptyBtnText}>Нанять сотрудника</Text>
                </TouchableOpacity>
              </View>
            )}
            {state.employees.map(emp => {
              const v = EMPLOYEE_VISUALS[emp.type];
              return (
                <TouchableOpacity key={emp.id} style={styles.teamRow} onPress={() => setSelectedEmployeeId(emp.id)} activeOpacity={0.75}>
                  <View style={[styles.teamAvatar, { backgroundColor: v.color }]}>
                    <Ionicons name={v.icon} size={20} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.teamName}>{emp.name}</Text>
                    <Text style={styles.teamRole}>{v.role}</Text>
                  </View>
                  <View style={[styles.teamStatus, {
                    backgroundColor: emp.status === 'working' ? '#2ECC7122' : emp.status === 'done' ? '#F0A50022' : '#7A8A9922',
                  }]}>
                    <Text style={[styles.teamStatusText, {
                      color: emp.status === 'working' ? '#22A05A' : emp.status === 'done' ? '#B8780A' : '#7A8A99',
                    }]}>
                      {emp.status === 'working' ? 'Работает' : emp.status === 'done' ? 'Готово' : emp.status === 'attention' ? 'Внимание' : 'Свободен'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            {state.employees.length > 0 && (
              <TouchableOpacity onPress={() => setActiveModal('hire')} style={styles.teamHireBtn} activeOpacity={0.8}>
                <Ionicons name="add" size={18} color="#C67C12" />
                <Text style={styles.teamHireText}>Нанять ещё сотрудника</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}

        {navTab === 'tasks' && (
          <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.listPad} showsVerticalScrollIndicator={false}>
              {state.tasks.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="checkbox-outline" size={40} color="#9AA7B2" />
                  <Text style={styles.emptyTitle}>Задач пока нет</Text>
                  <Text style={styles.emptyDesc}>Добавьте задачу или назначьте её сотруднику.</Text>
                </View>
              )}
              {state.tasks.map(task => {
                const assignee = state.employees.find(e => e.id === task.assignedTo);
                return (
                  <TouchableOpacity
                    key={task.id}
                    style={styles.taskCard}
                    onPress={() => task.status === 'pending' && completeTask(task.id)}
                    activeOpacity={task.status === 'pending' ? 0.75 : 1}
                  >
                    <Ionicons
                      name={task.status === 'done' ? 'checkmark-circle' : task.status === 'in_progress' ? 'sync-circle' : task.status === 'failed' ? 'alert-circle' : 'ellipse-outline'}
                      size={20}
                      color={task.status === 'done' ? '#2E7D5B' : task.status === 'in_progress' ? '#F0A500' : task.status === 'failed' ? '#C43020' : '#C67C12'}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.taskCardTitle, task.status === 'done' && { color: '#9AA7B2', textDecorationLine: 'line-through' }]}>
                        {task.title}
                      </Text>
                      {assignee && <Text style={styles.taskCardMeta}>{assignee.name}{task.status === 'in_progress' ? ' · выполняет' : ''}</Text>}
                      {task.result && <Text style={styles.taskCardResult}>{task.result}</Text>}
                      {task.error && <Text style={[styles.taskCardResult, { color: '#C43020' }]}>{task.error}</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={[styles.taskInputRow]}>
              <TextInput
                style={styles.taskInput}
                value={taskInput}
                onChangeText={setTaskInput}
                placeholder="Новая задача..."
                placeholderTextColor="#9AA7B2"
                returnKeyType="done"
                onSubmitEditing={handleAddTask}
              />
              <TouchableOpacity onPress={handleAddTask} style={styles.taskAddBtn} accessibilityLabel="Add task">
                <Ionicons name="add" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {navTab === 'docs' && (
          <ScrollView contentContainerStyle={styles.listPad} showsVerticalScrollIndicator={false}>
            {state.documents.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="folder-open-outline" size={40} color="#9AA7B2" />
                  <Text style={styles.emptyTitle}>Документов пока нет</Text>
                  <Text style={styles.emptyDesc}>Результаты выполненных AI-задач появятся здесь.</Text>
              </View>
            )}
            {state.documents.map(doc => (
              <TouchableOpacity key={doc.id} style={styles.docRow} onPress={() => setActiveModal('folder')} activeOpacity={0.75}>
                <View style={styles.docIcon}>
                  <Ionicons name={doc.type === 'contract' ? 'document-text' : doc.type === 'report' ? 'bar-chart' : doc.type === 'invoice' ? 'receipt' : 'mail'} size={17} color="#2E6DA4" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.docTitle}>{doc.title}</Text>
                  <Text style={styles.docMeta}>{doc.type === 'report' ? 'Отчёт' : doc.type === 'contract' ? 'Документ' : doc.type === 'invoice' ? 'Счёт' : 'Заметка'} · {new Date(doc.createdAt).toLocaleDateString()}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* ─── Bottom navigation ─── */}
      <View style={[styles.nav, { paddingBottom: bottomPad, height: NAV_H + bottomPad }]}>
        {([
          ['office', 'business', 'Офис'],
          ['team', 'people', 'Команда'],
          ['tasks', 'checkbox', 'Задачи'],
          ['docs', 'folder', 'Файлы'],
        ] as const).map(([key, icon, label]) => {
          const active = navTab === key;
          const badge = key === 'tasks' && pendingTasks > 0 ? pendingTasks : null;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => { haptic(); setNavTab(key); }}
              style={styles.navItem}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={label}
            >
              <View>
                <Ionicons name={active ? icon : `${icon}-outline` as any} size={22} color={active ? '#C67C12' : '#8A97A3'} />
                {badge != null && (
                  <View style={styles.navBadge}><Text style={styles.navBadgeText}>{badge}</Text></View>
                )}
              </View>
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ─── Toasts ─── */}
      <ToastStack topOffset={topPad + TOP_BAR_H + 6} />

      {/* ─── Modals ─── */}
      <TaskModal visible={activeModal === 'tasks'} onClose={() => setActiveModal(null)} />
      <SafeModal visible={activeModal === 'safe'} onClose={() => setActiveModal(null)} />
      <FolderModal visible={activeModal === 'folder'} onClose={() => setActiveModal(null)} />
      <HireModal visible={activeModal === 'hire'} onClose={() => setActiveModal(null)} />
      <JournalModal visible={activeModal === 'journal'} onClose={() => setActiveModal(null)} />
      <EmployeeSheet employeeId={selectedEmployeeId} onClose={() => setSelectedEmployeeId(null)} />
    </View>
  );
}

/** Measures available space and passes height to the room. */
function RoomAutoSize({ render }: { render: (height: number) => React.ReactNode }) {
  const [h, setH] = useState(0);
  return (
    <View style={{ flex: 1, justifyContent: 'center' }} onLayout={e => setH(e.nativeEvent.layout.height)}>
      {h > 0 ? render(h) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.07)',
    zIndex: 10,
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1, marginRight: 10 },
  logo: { width: 32, height: 32, borderRadius: 9 },
  logoPlaceholder: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#FFFFFF', fontSize: 12, fontFamily: 'Inter_700Bold' },
  companyName: { color: '#1E2A36', fontSize: 14.5, fontFamily: 'Inter_700Bold' },
  levelText: { color: '#8A97A3', fontSize: 10.5, fontFamily: 'Inter_500Medium', marginTop: 0.5 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  balancePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F0A50018',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12,
    minHeight: 32,
  },
  balanceText: { color: '#B8780A', fontSize: 12.5, fontFamily: 'Inter_700Bold' },
  iconBtn: { padding: 8, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  journalDot: {
    position: 'absolute', top: 8, right: 9,
    width: 7, height: 7, borderRadius: 4, backgroundColor: '#E67E22',
    borderWidth: 1, borderColor: '#FFFFFF',
  },
  objectiveStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    marginHorizontal: 14, marginTop: 8,
    paddingHorizontal: 11, paddingVertical: 8,
    borderRadius: 11,
    backgroundColor: '#F0A50014',
    borderWidth: 1, borderColor: '#F0A50030',
  },
  objectiveText: { flex: 1, color: '#6B4E2E', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  roomWrap: { flex: 1 },
  hireFab: {
    position: 'absolute', right: 14, bottom: 12,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#C67C12',
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 24, minHeight: 44,
    shadowColor: '#C67C12', shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  hireFabText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter_700Bold' },
  // Lists
  listPad: { padding: 14, paddingBottom: 20 },
  emptyState: { alignItems: 'center', paddingVertical: 44, gap: 8 },
  emptyTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#4A5A68' },
  emptyDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#8A97A3', textAlign: 'center', maxWidth: 240, lineHeight: 18 },
  emptyBtn: { marginTop: 8, backgroundColor: '#C67C12', paddingHorizontal: 20, paddingVertical: 11, borderRadius: 14, minHeight: 44, justifyContent: 'center' },
  emptyBtnText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter_700Bold' },
  teamRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFFFFF', borderRadius: 15, padding: 13, marginBottom: 9,
    shadowColor: '#1E2A36', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  teamAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  teamName: { fontSize: 14.5, fontFamily: 'Inter_600SemiBold', color: '#1E2A36' },
  teamRole: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#8A97A3', marginTop: 1 },
  teamStatus: { paddingHorizontal: 9, paddingVertical: 4.5, borderRadius: 10 },
  teamStatusText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  teamHireBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderColor: '#C67C1250', borderStyle: 'dashed',
    borderRadius: 15, paddingVertical: 14, marginTop: 4, minHeight: 48,
  },
  teamHireText: { color: '#C67C12', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  taskCard: {
    flexDirection: 'row', gap: 11, alignItems: 'flex-start',
    backgroundColor: '#FFFFFF', borderRadius: 15, padding: 13, marginBottom: 9,
    shadowColor: '#1E2A36', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  taskCardTitle: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#1E2A36' },
  taskCardMeta: { fontSize: 11.5, fontFamily: 'Inter_400Regular', color: '#8A97A3', marginTop: 2 },
  taskCardResult: { fontSize: 12.5, fontFamily: 'Inter_400Regular', color: '#2E7D5B', marginTop: 4, lineHeight: 17 },
  taskInputRow: {
    flexDirection: 'row', gap: 9, paddingHorizontal: 14, paddingVertical: 9, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.07)',
  },
  taskInput: {
    flex: 1, backgroundColor: '#F1F5F8', borderRadius: 12, paddingHorizontal: 13, paddingVertical: 10,
    fontSize: 14.5, fontFamily: 'Inter_400Regular', color: '#1E2A36',
    borderWidth: 1, borderColor: '#E0E7EC',
  },
  taskAddBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#C67C12', alignItems: 'center', justifyContent: 'center' },
  docRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFFFFF', borderRadius: 15, padding: 13, marginBottom: 9,
    shadowColor: '#1E2A36', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  docIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: '#2E6DA418', alignItems: 'center', justifyContent: 'center' },
  docTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#1E2A36' },
  docMeta: { fontSize: 11.5, fontFamily: 'Inter_400Regular', color: '#8A97A3', marginTop: 2 },
  // Bottom nav
  nav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.08)',
    paddingTop: 7,
  },
  navItem: { flex: 1, alignItems: 'center', gap: 2, minHeight: 44 },
  navLabel: { fontSize: 10, fontFamily: 'Inter_600SemiBold', color: '#8A97A3' },
  navLabelActive: { color: '#C67C12' },
  navBadge: {
    position: 'absolute', top: -4, right: -10,
    backgroundColor: '#E23E3E', borderRadius: 8, minWidth: 15, height: 15,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  navBadgeText: { color: '#FFFFFF', fontSize: 9, fontFamily: 'Inter_700Bold' },
});
