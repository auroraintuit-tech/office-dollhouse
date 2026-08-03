import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AVATARS, AvatarId } from '@/constants/colors';

interface Props {
  avatarId: AvatarId;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
}

const SIZES = {
  sm: { outer: 32, icon: 16 },
  md: { outer: 64, icon: 30 },
  lg: { outer: 88, icon: 42 },
};

export default function AvatarSprite({ avatarId, size = 'md', selected = false }: Props) {
  const avatar = AVATARS.find(a => a.id === avatarId) ?? AVATARS[0];
  const s = SIZES[size];

  return (
    <View style={[
      styles.container,
      {
        width: s.outer,
        height: s.outer,
        borderRadius: s.outer / 2,
        backgroundColor: avatar.color,
        borderWidth: selected ? 3 : 0,
        borderColor: '#C67C12',
      }
    ]}>
      <Ionicons
        name={avatar.icon as any}
        size={s.icon}
        color={avatar.accent}
      />
      {selected && (
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark" size={10} color="#FFFFFF" />
        </View>
      )}
    </View>
  );
}

// Small game character body (used in game screens as walking sprite)
interface CharacterProps {
  avatarId: AvatarId;
  facing?: 'left' | 'right';
}

export function GameCharacter({ avatarId, facing = 'right' }: CharacterProps) {
  const avatar = AVATARS.find(a => a.id === avatarId) ?? AVATARS[0];
  return (
    <View style={[styles.character, { transform: [{ scaleX: facing === 'left' ? -1 : 1 }] }]}>
      {/* Head */}
      <View style={[styles.head, { backgroundColor: '#E8C8A0' }]} />
      {/* Hair */}
      <View style={[styles.hair, { backgroundColor: avatar.color }]} />
      {/* Body */}
      <View style={[styles.body, { backgroundColor: avatar.color }]} />
      {/* Left arm */}
      <View style={[styles.armLeft, { backgroundColor: avatar.accent }]} />
      {/* Right arm */}
      <View style={[styles.armRight, { backgroundColor: avatar.accent }]} />
      {/* Legs */}
      <View style={styles.legsRow}>
        <View style={[styles.leg, { backgroundColor: '#4A3A28' }]} />
        <View style={[styles.leg, { backgroundColor: '#4A3A28', marginLeft: 2 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#C67C12',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  // Game character styles
  character: {
    alignItems: 'center',
    width: 24,
    height: 44,
  },
  head: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginBottom: -4,
    zIndex: 2,
  },
  hair: {
    position: 'absolute',
    top: 0,
    width: 14,
    height: 7,
    borderRadius: 7,
  },
  body: {
    width: 12,
    height: 16,
    borderRadius: 3,
    marginTop: 4,
  },
  armLeft: {
    position: 'absolute',
    top: 20,
    left: 1,
    width: 5,
    height: 10,
    borderRadius: 2,
    transform: [{ rotate: '15deg' }],
  },
  armRight: {
    position: 'absolute',
    top: 20,
    right: 1,
    width: 5,
    height: 10,
    borderRadius: 2,
    transform: [{ rotate: '-15deg' }],
  },
  legsRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  leg: {
    width: 5,
    height: 12,
    borderRadius: 2,
  },
});
