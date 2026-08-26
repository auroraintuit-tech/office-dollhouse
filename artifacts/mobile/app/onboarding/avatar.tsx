import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '@/contexts/GameContext';
import OnboardingLayout from '@/components/OnboardingLayout';
import AvatarSprite from '@/components/AvatarSprite';
import { AVATARS, AvatarId } from '@/constants/colors';

export default function AvatarScreen() {
  const { state, updateGame } = useGame();
  const [selected, setSelected] = useState<AvatarId>(state.player?.avatarId ?? 'ceo');
  const [photoUri, setPhotoUri] = useState<string | null>(state.player?.photoUri ?? null);

  function handleSelect(id: AvatarId) {
    setSelected(id);
    if (Platform.OS !== 'web') Haptics.selectionAsync();
  }

  async function pickPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      let uri = result.assets[0].uri;
      // Copy into permanent app storage — the picker URI is a temp cache
      // file the OS may delete, which would blank the avatar after reload.
      if (Platform.OS !== 'web' && FileSystem.documentDirectory) {
        try {
          const dest = `${FileSystem.documentDirectory}player-photo.jpg`;
          await FileSystem.copyAsync({ from: uri, to: dest });
          uri = `${dest}?v=${Date.now()}`; // cache-bust Image after re-pick
        } catch {
          // fall back to the picker URI
        }
      }
      setPhotoUri(uri);
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  function handleContinue() {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateGame({
      player: { ...(state.player ?? { name: '', email: '' }), avatarId: selected, photoUri },
      phase: 'style',
    });
    router.replace('/onboarding/style');
  }

  const selectedAvatar = AVATARS.find(a => a.id === selected)!;

  return (
    <OnboardingLayout step={3}>
      <View style={styles.container}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Создайте своего{'\n'}персонажа</Text>
          <Text style={styles.subtitle}>Добавьте фото или выберите готового персонажа</Text>
        </View>

        {/* Photo + preview row */}
        <View style={styles.previewCard}>
          <TouchableOpacity onPress={pickPhoto} activeOpacity={0.8} style={styles.photoWrap}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            ) : (
              <AvatarSprite avatarId={selected} size="lg" selected />
            )}
            <View style={styles.photoBadge}>
              <Ionicons name={photoUri ? 'camera-reverse' : 'camera'} size={13} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.previewName}>{photoUri ? (state.player?.name ?? 'Вы') : selectedAvatar.label}</Text>
            <Text style={styles.previewHint}>
              {photoUri ? 'Нажмите, чтобы заменить фотографию' : 'Нажмите, чтобы добавить своё фото'}
            </Text>
            {photoUri && (
              <TouchableOpacity onPress={() => setPhotoUri(null)} style={styles.removePhoto}>
                <Text style={styles.removePhotoText}>Удалить фото</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.gridLabel}>{photoUri ? 'Стиль одежды' : 'Или выберите персонажа'}</Text>

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
              <AvatarSprite avatarId={av.id} size="md" selected={selected === av.id} photoUri={photoUri} />
              <Text style={[styles.avatarLabel, selected === av.id && styles.avatarLabelActive]}>
                {av.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.btn} onPress={handleContinue} activeOpacity={0.85}>
            <Text style={styles.btnText}>Продолжить</Text>
          </TouchableOpacity>
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 16, gap: 14 },
  titleBlock: { gap: 8 },
  title: { color: '#33261A', fontSize: 32, fontFamily: 'Inter_700Bold', lineHeight: 38 },
  subtitle: { color: '#8A7358', fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  previewCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20, padding: 16,
    borderWidth: 1.5, borderColor: 'rgba(198,124,18,0.4)',
  },
  photoWrap: { position: 'relative' },
  photo: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderColor: '#C67C12',
  },
  photoBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#C67C12',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FFFFFF',
  },
  previewName: { color: '#33261A', fontSize: 18, fontFamily: 'Inter_700Bold' },
  previewHint: { color: '#8A7358', fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 4 },
  removePhoto: { marginTop: 6 },
  removePhotoText: { color: '#C43020', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  gridLabel: {
    color: '#8A7358', fontSize: 11, fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.2, textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
    justifyContent: 'space-between',
  },
  avatarCard: {
    width: '30%',
    backgroundColor: '#FFFFFF',
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
    color: '#8A7358',
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
