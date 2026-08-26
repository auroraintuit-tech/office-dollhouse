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
    tagline: 'Технологичный',
    desc: 'Современный цифровой офис с холодными оттенками, подсветкой и металлическими поверхностями.',
    palette: ['#0C1525', '#1A2240', '#00AAFF', '#00E8FF'],
    accent: '#00AAFF',
  },
  {
    id: 'classic',
    name: 'Деловая классика',
    tagline: 'Солидный',
    desc: 'Тёплое дерево, мягкое освещение и золотистые акценты для серьёзного делового офиса.',
    palette: ['#2C1A0E', '#4A2A15', '#C4A040', '#8A6820'],
    accent: '#C4A040',
  },
  {
    id: 'loft',
    name: 'Современный лофт',
    tagline: 'Креативный',
    desc: 'Бетон, светлое дерево и медные детали — современное пространство для растущей команды.',
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
          <Text style={styles.title}>Выберите стиль{'\n'}офиса</Text>
          <Text style={styles.subtitle}>Позже оформление можно будет изменить</Text>
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
            <Text style={styles.btnText}>Открыть мой офис</Text>
          </TouchableOpacity>
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 12, gap: 16 },
  titleBlock: { gap: 8 },
  title: { color: '#33261A', fontSize: 34, fontFamily: 'Inter_700Bold', lineHeight: 40 },
  subtitle: { color: '#8A7358', fontSize: 14, fontFamily: 'Inter_400Regular' },
  card: {
    backgroundColor: '#FFFFFF',
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
    color: '#33261A',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  cardTagline: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  cardDesc: {
    color: '#8A7358',
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
