import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AVATARS, AvatarId } from '@/constants/colors';

interface Props {
  avatarId: AvatarId;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  photoUri?: string | null;
}

const SIZES = {
  sm: { outer: 32, icon: 16 },
  md: { outer: 64, icon: 30 },
  lg: { outer: 88, icon: 42 },
};

export default function AvatarSprite({ avatarId, size = 'md', selected = false, photoUri = null }: Props) {
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
        overflow: photoUri ? 'hidden' : 'visible',
      }
    ]}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} />
      ) : (
        <Ionicons
          name={avatar.icon as any}
          size={s.icon}
          color={avatar.accent}
        />
      )}
      {selected && !photoUri && (
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark" size={10} color="#FFFFFF" />
        </View>
      )}
    </View>
  );
}

// Game character body — used as walking/standing sprite in game scenes.
// If photoUri is set, the head is the player's photo.
interface CharacterProps {
  avatarId: AvatarId;
  photoUri?: string | null;
  facing?: 'left' | 'right';
  scale?: number;
}

export function GameCharacter({ avatarId, photoUri = null, facing = 'right', scale = 1 }: CharacterProps) {
  const avatar = AVATARS.find(a => a.id === avatarId) ?? AVATARS[0];
  const s = (n: number) => n * scale;
  return (
    <View style={{
      alignItems: 'center', width: s(32), height: s(58),
      transform: [{ scaleX: facing === 'left' ? -1 : 1 }],
    }}>
      {/* Head — photo or skin tone with hair */}
      <View style={{
        width: s(22), height: s(22), borderRadius: s(11),
        backgroundColor: '#E8C8A0',
        overflow: 'hidden', zIndex: 2,
        borderWidth: photoUri ? s(1.5) : 0,
        borderColor: avatar.color,
      }}>
        {photoUri && (
          <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} />
        )}
      </View>
      {!photoUri && (
        <View style={{
          position: 'absolute', top: 0,
          width: s(22), height: s(11),
          borderTopLeftRadius: s(11), borderTopRightRadius: s(11),
          backgroundColor: avatar.color,
        }} />
      )}
      {/* Body */}
      <View style={{
        width: s(18), height: s(24), borderRadius: s(5),
        backgroundColor: avatar.color, marginTop: s(-2),
      }}>
        {/* Shirt collar */}
        <View style={{
          alignSelf: 'center', marginTop: s(2),
          width: s(6), height: s(6),
          backgroundColor: '#FFFFFF', opacity: 0.85,
          borderRadius: s(1),
          transform: [{ rotate: '45deg' }],
        }} />
      </View>
      {/* Arms */}
      <View style={{
        position: 'absolute', top: s(28), left: s(2),
        width: s(6), height: s(15), borderRadius: s(3),
        backgroundColor: avatar.accent,
        transform: [{ rotate: '12deg' }],
      }} />
      <View style={{
        position: 'absolute', top: s(28), right: s(2),
        width: s(6), height: s(15), borderRadius: s(3),
        backgroundColor: avatar.accent,
        transform: [{ rotate: '-12deg' }],
      }} />
      {/* Legs */}
      <View style={{ flexDirection: 'row', marginTop: s(1), gap: s(3) }}>
        <View style={{ width: s(6), height: s(14), borderRadius: s(3), backgroundColor: '#3A2A18' }} />
        <View style={{ width: s(6), height: s(14), borderRadius: s(3), backgroundColor: '#3A2A18' }} />
      </View>
      {/* Shadow */}
      <View style={{
        position: 'absolute', bottom: s(-3),
        width: s(24), height: s(6), borderRadius: s(12),
        backgroundColor: '#000', opacity: 0.25,
      }} />
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
});
