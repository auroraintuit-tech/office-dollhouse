import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGame } from '@/contexts/GameContext';
import { OfficeStyle } from '@/contexts/GameContext';
import OnboardingLayout from '@/components/OnboardingLayout';

const STYLES: Array<{
  id: OfficeStyle;
  name: string;
  tagline: string;
  desc: string;
  palette: string[];
  accent: string;
}> = [
  {
    id: 'hitech',
    name: 'Hi-Tech',
    tagline: 'Futuristic & Sleek',
    desc: 'Dark command-center aesthetic with cyan glows and metallic surfaces. Perfect for the digital-first founder.',
    palette: ['#0C1525', '#1A2240', '#00AAFF', '#00E8FF'],
    accent: '#00AAFF',
  },
  {
    id: 'classic',
    name: 'Executive Classic',
    tagline: 'Elegant & Timeless',
    desc: 'Mahogany wood, warm lighting, gold accents. The office of someone who means serious business.',
    palette: ['#2C1A0E', '#4A2A15', '#C4A040', '#8A6820'],
    accent: '#C4A040',
  },
  {
    id: 'loft',
    name: 'Modern Loft',
    tagline: 'Industrial & Warm',
    desc: 'Exposed concrete, light wood, copper fixtures. Creative, grounded, distinctly modern.',
    palette: ['#282828', '#C0B098', '#D47340', '#C09870'],
    accent: '#D47340',
  },
];

export default function StyleScreen() {
  const { state, updateGame } = useGame();
  const [selected, setSelected] = useState<OfficeStyle>(state.officeStyle);

  function handleSelect(id: OfficeStyle) {
    setSelected(id);
    if (Platform.OS !== 'web') Haptics.selectionAsync();
  }

  function handleContinue() {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    updateGame({ officeStyle: selected, phase: 'entrance' });
    router.replace('/game/entrance');
  }

  return (
    <OnboardingLayout step={4}>
      <View style={styles.container}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Choose your{'\n'}office style</Text>
          <Text style={styles.subtitle}>You can always redecorate later</Text>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
          {STYLES.map(s => (
            <TouchableOpacity
              key={s.id}
              style={[styles.card, selected === s.id && { borderColor: s.accent, borderWidth: 2.5 }]}
              onPress={() => handleSelect(s.id)}
              activeOpacity={0.8}
            >
              {/* Palette preview */}
              <View style={styles.palette}>
                {s.palette.map((c, i) => (
                  <View key={i} style={[styles.paletteSwatch, {
                    backgroundColor: c,
                    flex: i === 0 ? 2 : 1,
                    borderTopLeftRadius: i === 0 ? 10 : 0,
                    borderBottomLeftRadius: i === 0 ? 10 : 0,
                    borderTopRightRadius: i === s.palette.length - 1 ? 10 : 0,
                    borderBottomRightRadius: i === s.palette.length - 1 ? 10 : 0,
                  }]} />
                ))}
              </View>

              {/* Info */}
              <View style={styles.cardInfo}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardName}>{s.name}</Text>
                  <Text style={[styles.cardTagline, { color: s.accent }]}>{s.tagline}</Text>
                </View>
                <Text style={styles.cardDesc}>{s.desc}</Text>
              </View>

              {/* Selected indicator */}
              {selected === s.id && (
                <View style={[styles.selectedBadge, { backgroundColor: s.accent }]}>
                  <Text style={styles.selectedBadgeText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.btn} onPress={handleContinue} activeOpacity={0.85}>
            <Text style={styles.btnText}>Open My Office</Text>
          </TouchableOpacity>
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 12, gap: 16 },
  titleBlock: { gap: 8 },
  title: { color: '#F5EDD8', fontSize: 34, fontFamily: 'Inter_700Bold', lineHeight: 40 },
  subtitle: { color: '#8C7050', fontSize: 14, fontFamily: 'Inter_400Regular' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  palette: {
    flexDirection: 'row',
    height: 56,
  },
  paletteSwatch: {
    height: '100%',
  },
  cardInfo: {
    padding: 16,
    gap: 6,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardName: {
    color: '#F5EDD8',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  cardTagline: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  cardDesc: {
    color: '#8C7050',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  footer: {},
  btn: {
    backgroundColor: '#C67C12', borderRadius: 20, paddingVertical: 18,
    alignItems: 'center', shadowColor: '#C67C12',
    shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  btnText: { color: '#FFFFFF', fontSize: 17, fontFamily: 'Inter_700Bold' },
});
