import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, AccessibilityInfo, Platform } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat,
  withSequence, withSpring, withDelay,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Employee, EmployeeType } from '@/contexts/GameContext';
import { GameCharacter } from '@/components/AvatarSprite';
import { AvatarId } from '@/constants/colors';

// Visual identity per employee type
export const EMPLOYEE_VISUALS: Record<EmployeeType, { color: string; accent: string; role: string; icon: any }> = {
  assistant:  { color: '#7C5CBF', accent: '#9F84D6', role: 'Бизнес-ассистент', icon: 'person' },
  accountant: { color: '#2E6DA4', accent: '#5B93C6', role: 'Бухгалтер', icon: 'calculator' },
  lawyer:     { color: '#2E7D5B', accent: '#57A583', role: 'Юрист', icon: 'shield-checkmark' },
  marketer:   { color: '#C2622A', accent: '#DE8A52', role: 'Маркетолог', icon: 'megaphone' },
  it:         { color: '#31838A', accent: '#5BAAB0', role: 'IT-специалист', icon: 'hardware-chip' },
  warehouse:  { color: '#8A6D3B', accent: '#AD9160', role: 'Заведующий складом', icon: 'cube' },
};

const STATUS_META: Record<string, { color: string; icon: any } | null> = {
  idle: null,
  away: null,
  working: { color: '#2ECC71', icon: 'sync' },
  done: { color: '#F0A500', icon: 'checkmark' },
  attention: { color: '#E67E22', icon: 'alert' },
};

// Employee-type character body (simple full-figure sprite, no photo)
function EmployeeBody({ type, scale = 0.75 }: { type: EmployeeType; scale?: number }) {
  const v = EMPLOYEE_VISUALS[type];
  const s = (n: number) => n * scale;
  return (
    <View style={{ alignItems: 'center', width: s(32), height: s(58) }}>
      <View style={{ width: s(20), height: s(20), borderRadius: s(10), backgroundColor: '#EDCDA6', zIndex: 2 }} />
      <View style={{
        position: 'absolute', top: 0, width: s(20), height: s(10),
        borderTopLeftRadius: s(10), borderTopRightRadius: s(10), backgroundColor: v.color,
      }} />
      <View style={{ width: s(17), height: s(22), borderRadius: s(5), backgroundColor: v.color, marginTop: s(-2) }} />
      <View style={{ position: 'absolute', top: s(25), left: s(3), width: s(5), height: s(14), borderRadius: s(3), backgroundColor: v.accent, transform: [{ rotate: '10deg' }] }} />
      <View style={{ position: 'absolute', top: s(25), right: s(3), width: s(5), height: s(14), borderRadius: s(3), backgroundColor: v.accent, transform: [{ rotate: '-10deg' }] }} />
      <View style={{ flexDirection: 'row', marginTop: s(1), gap: s(3) }}>
        <View style={{ width: s(5), height: s(12), borderRadius: s(3), backgroundColor: '#4A3A28' }} />
        <View style={{ width: s(5), height: s(12), borderRadius: s(3), backgroundColor: '#4A3A28' }} />
      </View>
      <View style={{ position: 'absolute', bottom: s(-3), width: s(22), height: s(5), borderRadius: s(11), backgroundColor: '#000', opacity: 0.18 }} />
    </View>
  );
}

interface OfficeEmployeeProps {
  employee: Employee;
  x: number; // absolute px within room container
  y: number;
  justHired: boolean;
  reducedMotion: boolean;
  onPress: () => void;
}

export function OfficeEmployee({ employee, x, y, justHired, reducedMotion, onPress }: OfficeEmployeeProps) {
  const v = EMPLOYEE_VISUALS[employee.type];
  const spawn = useSharedValue(justHired ? 0 : 1);
  const bob = useSharedValue(0);

  useEffect(() => {
    if (justHired) {
      spawn.value = withDelay(150, withSpring(1, { damping: 12 }));
    }
  }, [justHired]);

  useEffect(() => {
    if (employee.status === 'working' && !reducedMotion) {
      bob.value = withRepeat(
        withSequence(withTiming(-2.5, { duration: 450 }), withTiming(0, { duration: 450 })),
        -1, false,
      );
    } else {
      bob.value = withTiming(0, { duration: 200 });
    }
  }, [employee.status, reducedMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: spawn.value,
    transform: [{ scale: spawn.value }, { translateY: bob.value }],
  }));

  const badge = STATUS_META[employee.status];

  return (
    <Animated.View style={[{ position: 'absolute', left: x, top: y, alignItems: 'center' }, style]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`${employee.name}, ${v.role}, ${employee.status}`}
        style={{ alignItems: 'center', minWidth: 44, minHeight: 56, justifyContent: 'flex-end' }}
      >
        {badge && (
          <View style={[styles.statusBadge, { backgroundColor: badge.color }]}>
            <Ionicons name={badge.icon} size={8} color="#FFFFFF" />
          </View>
        )}
        <EmployeeBody type={employee.type} />
        <View style={styles.nameTag}>
          <Text style={styles.nameText} numberOfLines={1}>{employee.name.split(' ')[0]}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Director character with idle breathing animation
export function Director({ avatarId, photoUri, x, y, scale = 0.9, reducedMotion }: {
  avatarId: AvatarId; photoUri?: string | null; x: number; y: number; scale?: number; reducedMotion: boolean;
}) {
  const breathe = useSharedValue(0);
  useEffect(() => {
    if (!reducedMotion) {
      breathe.value = withRepeat(
        withSequence(withTiming(-1.5, { duration: 1400 }), withTiming(0, { duration: 1400 })),
        -1, false,
      );
    }
  }, [reducedMotion]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: breathe.value }] }));
  return (
    <Animated.View style={[{ position: 'absolute', left: x, top: y }, style]}>
      <GameCharacter avatarId={avatarId} photoUri={photoUri} scale={scale} />
    </Animated.View>
  );
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  useEffect(() => {
    if (Platform.OS === 'web') return;
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => sub?.remove();
  }, []);
  return reduced;
}

const styles = StyleSheet.create({
  statusBadge: {
    width: 15, height: 15, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 2,
    borderWidth: 1.5, borderColor: '#FFFFFF',
    zIndex: 3,
  },
  nameTag: {
    marginTop: 3,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 6, paddingVertical: 1.5,
    borderRadius: 7,
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)',
  },
  nameText: {
    fontSize: 8.5, fontFamily: 'Inter_600SemiBold', color: '#33261A', maxWidth: 56,
  },
});
