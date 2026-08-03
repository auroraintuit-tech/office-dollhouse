import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGame } from '@/contexts/GameContext';
import OnboardingLayout from '@/components/OnboardingLayout';
import AvatarSprite from '@/components/AvatarSprite';
import { AVATARS, AvatarId } from '@/constants/colors';

export default function AvatarScreen() {
  const { state, updateGame } = useGame();
  const [selected, setSelected] = useState<AvatarId>(state.player?.avatarId ?? 'ceo');

  function handleSelect(id: AvatarId) {
    setSelected(id);
    if (Platform.OS !== 'web') Haptics.selectionAsync();
  }

  function handleContinue() {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateGame({ player: { ...(state.player ?? { name: '', email: '' }), avatarId: selected }, phase: 'style' });
    router.replace('/onboarding/style');
  }

  const selectedAvatar = AVATARS.find(a => a.id === selected)!;

  return (
    <OnboardingLayout step={3}>
      <View style={styles.container}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Choose your{'\n'}avatar</Text>
          <Text style={styles.subtitle}>This is how you'll appear in your office</Text>
        </View>

        {/* Selected avatar preview */}
        <View style={styles.previewCard}>
          <AvatarSprite avatarId={selected} size="lg" selected />
          <View style={{ flex: 1 }}>
            <Text style={styles.previewName}>{selectedAvatar.label}</Text>
            <Text style={styles.previewHint}>Your role in the game</Text>
          </View>
        </View>

        {/* Avatar grid */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          {AVATARS.map(av => (
            <TouchableOpacity
              key={av.id}
              style={[styles.avatarCard, selected === av.id && styles.avatarCardActive]}
              onPress={() => handleSelect(av.id)}
              activeOpacity={0.75}
            >
              <AvatarSprite avatarId={av.id} size="md" selected={selected === av.id} />
              <Text style={[styles.avatarLabel, selected === av.id && styles.avatarLabelActive]}>
                {av.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.btn} onPress={handleContinue} activeOpacity={0.85}>
            <Text style={styles.btnText}>Choose Avatar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 16, gap: 16 },
  titleBlock: { gap: 8 },
  title: { color: '#F5EDD8', fontSize: 34, fontFamily: 'Inter_700Bold', lineHeight: 40 },
  subtitle: { color: '#8C7050', fontSize: 14, fontFamily: 'Inter_400Regular' },
  previewCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20, padding: 16,
    borderWidth: 1.5, borderColor: 'rgba(198,124,18,0.4)',
  },
  previewName: { color: '#F5EDD8', fontSize: 18, fontFamily: 'Inter_700Bold' },
  previewHint: { color: '#8C7050', fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 4 },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
    justifyContent: 'space-between',
  },
  avatarCard: {
    width: '30%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarCardActive: {
    borderColor: '#C67C12',
    backgroundColor: 'rgba(198,124,18,0.12)',
  },
  avatarLabel: {
    color: '#8C7050',
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  avatarLabelActive: { color: '#F0A500' },
  footer: {},
  btn: {
    backgroundColor: '#C67C12', borderRadius: 20, paddingVertical: 18,
    alignItems: 'center', shadowColor: '#C67C12',
    shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  btnText: { color: '#FFFFFF', fontSize: 17, fontFamily: 'Inter_700Bold' },
});
