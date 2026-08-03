import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useGame, Employee } from '@/contexts/GameContext';
import IsometricRoom from '@/components/IsometricRoom';
import {
  TaskModal, SafeModal, FolderModal, HireModal, ChatModal, EventFeed,
} from '@/components/GameModals';
import AvatarSprite from '@/components/AvatarSprite';
import { OFFICE_THEMES } from '@/constants/colors';

type ActiveModal = 'tasks' | 'safe' | 'folder' | 'hire' | null;

export default function OfficeScreen() {
  const { state, advanceTutorial } = useGame();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [chatEmployee, setChatEmployee] = useState<Employee | null>(null);

  const t = OFFICE_THEMES[state.officeStyle];

  function handleObjectTap(obj: 'board' | 'safe' | 'desk' | 'folder' | 'hire') {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Advance tutorial when tapping highlighted object
    if (state.tutorialStep === 1 && obj === 'board') advanceTutorial();
    if (state.tutorialStep === 2 && obj === 'safe') advanceTutorial();
    if (state.tutorialStep === 3 && (obj === 'desk' || obj === 'folder')) advanceTutorial();

    if (obj === 'board' || obj === 'desk') {
      setActiveModal('tasks');
    } else if (obj === 'safe') {
      setActiveModal('safe');
    } else if (obj === 'folder') {
      setActiveModal('folder');
    } else if (obj === 'hire') {
      setActiveModal('hire');
    }
  }

  const companyName = state.company?.name ?? 'My Company';
  const pendingTasks = state.tasks.filter(t => t.status === 'pending').length;
  const formatBalance = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <View style={[styles.screen, { backgroundColor: t.bg }]}>
      {/* ─── Top toolbar ─── */}
      <View style={[styles.toolbar, { paddingTop: topPad + 4 }]}>
        <View style={styles.toolbarLeft}>
          {state.company?.logoUri ? (
            <Image source={{ uri: state.company.logoUri }} style={styles.toolbarLogo} />
          ) : (
            <View style={[styles.toolbarLogoPlaceholder, { backgroundColor: t.trim }]}>
              <Text style={styles.toolbarLogoText}>
                {companyName.slice(0, 2).toUpperCase()}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.toolbarCompany} numberOfLines={1}>{companyName}</Text>
            <Text style={styles.toolbarDate}>{dateStr}</Text>
          </View>
        </View>

        <View style={styles.toolbarRight}>
          {/* Balance */}
          <TouchableOpacity onPress={() => setActiveModal('safe')} style={styles.toolbarBadge} activeOpacity={0.8}>
            <Ionicons name="lock-closed" size={12} color="#F0A500" />
            <Text style={styles.toolbarBadgeText}>{formatBalance(state.balance)}</Text>
          </TouchableOpacity>
          {/* Tasks badge */}
          {pendingTasks > 0 && (
            <TouchableOpacity onPress={() => setActiveModal('tasks')} style={[styles.toolbarBadge, { backgroundColor: 'rgba(198,124,18,0.15)' }]} activeOpacity={0.8}>
              <Ionicons name="checkmark-circle-outline" size={12} color="#C67C12" />
              <Text style={[styles.toolbarBadgeText, { color: '#C67C12' }]}>{pendingTasks}</Text>
            </TouchableOpacity>
          )}
          {/* Avatar */}
          {state.player && (
            <AvatarSprite avatarId={state.player.avatarId} size="sm" />
          )}
        </View>
      </View>

      {/* ─── Isometric room ─── */}
      <View style={styles.roomContainer}>
        {state.player && (
          <IsometricRoom
            officeStyle={state.officeStyle}
            avatarId={state.player.avatarId}
            tutorialStep={state.tutorialStep}
            employeeCount={state.employees.length}
            onObjectTap={handleObjectTap}
          />
        )}
      </View>

      {/* ─── Employees panel (if any) ─── */}
      {state.employees.length > 0 && (
        <View style={styles.employeeBar}>
          {state.employees.slice(0, 5).map(emp => (
            <TouchableOpacity
              key={emp.id}
              onPress={() => { setChatEmployee(emp); }}
              style={styles.employeeChip}
              activeOpacity={0.8}
            >
              <View style={[styles.empDot, { backgroundColor: emp.status === 'working' ? '#3D8B66' : '#8C7050' }]} />
              <Text style={styles.empName} numberOfLines={1}>{emp.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          ))}
          {state.employees.length === 0 && (
            <TouchableOpacity onPress={() => setActiveModal('hire')} style={styles.hireChip} activeOpacity={0.8}>
              <Ionicons name="add" size={14} color="#C67C12" />
              <Text style={styles.hireChipText}>Hire</Text>
            </TouchableOpacity>
          )}
          {state.employees.length > 0 && (
            <TouchableOpacity onPress={() => setActiveModal('hire')} style={styles.hireChip} activeOpacity={0.8}>
              <Ionicons name="add" size={14} color="#C67C12" />
              <Text style={styles.hireChipText}>Hire</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ─── Bottom event feed ─── */}
      <View style={[styles.bottomBar, { paddingBottom: bottomPad + 8 }]}>
        <View style={styles.eventFeedContainer}>
          <EventFeed visible={state.tutorialStep >= 5 || state.events.length > 0} />
        </View>
        {state.tutorialStep >= 4 && state.employees.length === 0 && (
          <TouchableOpacity
            onPress={() => setActiveModal('hire')}
            style={styles.hireBtn}
            activeOpacity={0.85}
          >
            <Ionicons name="person-add" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.hireBtnText}>Hire First Employee</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ─── Modals ─── */}
      <TaskModal visible={activeModal === 'tasks'} onClose={() => setActiveModal(null)} />
      <SafeModal visible={activeModal === 'safe'} onClose={() => setActiveModal(null)} />
      <FolderModal visible={activeModal === 'folder'} onClose={() => setActiveModal(null)} />
      <HireModal visible={activeModal === 'hire'} onClose={() => setActiveModal(null)} />
      <ChatModal employee={chatEmployee} onClose={() => setChatEmployee(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 10,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  toolbarLogo: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  toolbarLogoPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarLogoText: {
    color: '#F0A500',
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  toolbarCompany: {
    color: '#F5EDD8',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    maxWidth: 160,
  },
  toolbarDate: {
    color: '#8C7050',
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolbarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(240,165,0,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  toolbarBadgeText: {
    color: '#F0A500',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  roomContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  employeeBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  employeeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  empDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  empName: {
    color: '#F5EDD8',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    maxWidth: 60,
  },
  hireChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(198,124,18,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(198,124,18,0.3)',
  },
  hireChipText: {
    color: '#C67C12',
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 10,
  },
  eventFeedContainer: {
    alignItems: 'flex-start',
  },
  hireBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C67C12',
    borderRadius: 20,
    paddingVertical: 14,
    shadowColor: '#C67C12',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  hireBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
});
