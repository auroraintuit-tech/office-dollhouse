import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame, GameEvent } from '@/contexts/GameContext';

const EVENT_ICONS: Record<string, any> = {
  hire: 'person-add', task: 'checkmark-circle', finance: 'card', system: 'information-circle',
};
const EVENT_COLORS: Record<string, string> = {
  hire: '#C67C12', task: '#2E7D5B', finance: '#2E6DA4', system: '#7C5CBF',
};

/**
 * Toast stack — shows new game events as small notifications that
 * auto-dismiss after 4 seconds. Only reacts to events created after mount.
 */
export function ToastStack({ topOffset }: { topOffset: number }) {
  const { state } = useGame();
  const [toasts, setToasts] = useState<GameEvent[]>([]);
  const seenRef = useRef<Set<string>>(new Set());
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    const fresh = state.events.filter(
      ev => ev.timestamp > mountedAt.current && !seenRef.current.has(ev.id),
    );
    if (fresh.length === 0) return;
    fresh.forEach(ev => seenRef.current.add(ev.id));
    setToasts(prev => [...fresh, ...prev].slice(0, 3));
    // Independent dismiss timer per toast so new events don't cancel older ones
    fresh.forEach(ev => {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== ev.id));
      }, 4000);
    });
  }, [state.events]);

  if (toasts.length === 0) return null;

  return (
    <View style={[styles.stack, { top: topOffset }]} pointerEvents="none">
      {toasts.map(ev => (
        <Animated.View key={ev.id} entering={FadeInUp.duration(220)} exiting={FadeOutUp.duration(180)} style={styles.toast}>
          <Ionicons name={EVENT_ICONS[ev.type]} size={15} color={EVENT_COLORS[ev.type]} />
          <Text style={styles.toastText} numberOfLines={2}>{ev.message}</Text>
        </Animated.View>
      ))}
    </View>
  );
}

/** Event journal — full history in a bottom sheet. */
export function JournalModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { state } = useGame();
  const insets = useSafeAreaInsets();
  const bottom = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        <View style={[styles.sheet, { paddingBottom: bottom + 10 }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Event Journal</Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 6 }} accessibilityLabel="Close journal">
              <Ionicons name="close" size={20} color="#7A8A99" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {state.events.length === 0 && (
              <Text style={styles.empty}>Nothing has happened yet.</Text>
            )}
            {state.events.map(ev => (
              <View key={ev.id} style={styles.row}>
                <View style={[styles.iconWrap, { backgroundColor: EVENT_COLORS[ev.type] + '1E' }]}>
                  <Ionicons name={EVENT_ICONS[ev.type]} size={15} color={EVENT_COLORS[ev.type]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowText}>{ev.message}</Text>
                  <Text style={styles.rowTime}>
                    {new Date(ev.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  stack: {
    position: 'absolute', left: 16, right: 16,
    gap: 6, zIndex: 50,
  },
  toast: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.97)',
    paddingHorizontal: 13, paddingVertical: 10,
    borderRadius: 13,
    shadowColor: '#1E2A36', shadowOpacity: 0.14, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)',
  },
  toastText: { flex: 1, fontSize: 12.5, fontFamily: 'Inter_500Medium', color: '#1E2A36' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(20,30,40,0.45)' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 8, paddingHorizontal: 20,
    height: 480,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#D5DDE3', marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 19, fontFamily: 'Inter_700Bold', color: '#1E2A36' },
  empty: { color: '#7A8A99', fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 24 },
  row: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEF2F5', alignItems: 'center' },
  iconWrap: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  rowText: { fontSize: 13.5, fontFamily: 'Inter_500Medium', color: '#1E2A36' },
  rowTime: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#9AA7B2', marginTop: 2 },
});
