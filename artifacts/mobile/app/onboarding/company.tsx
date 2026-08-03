import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Image, Platform, KeyboardAvoidingView,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '@/contexts/GameContext';
import OnboardingLayout from '@/components/OnboardingLayout';

export default function CompanyScreen() {
  const { state, setCompany, setPhase } = useGame();
  const [companyName, setCompanyName] = useState(state.company?.name ?? '');
  const [logoUri, setLogoUri] = useState<string | null>(state.company?.logoUri ?? null);
  const [nameError, setNameError] = useState('');

  async function pickLogo() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setLogoUri(result.assets[0].uri);
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  function handleContinue() {
    if (!companyName.trim()) {
      setNameError('Please enter a company name');
      return;
    }
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCompany({ name: companyName.trim(), logoUri });
    setPhase('avatar');
    router.replace('/onboarding/avatar');
  }

  const initials = companyName.trim().slice(0, 2).toUpperCase() || '?';

  return (
    <OnboardingLayout step={2}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Name your{'\n'}company</Text>
            <Text style={styles.subtitle}>This will appear on your office sign</Text>
          </View>

          {/* Logo picker */}
          <View style={styles.logoRow}>
            <TouchableOpacity onPress={pickLogo} style={styles.logoPicker} activeOpacity={0.8}>
              {logoUri ? (
                <Image source={{ uri: logoUri }} style={styles.logoImg} />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Text style={styles.logoInitials}>{initials}</Text>
                </View>
              )}
              <View style={styles.logoCameraBtn}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.logoLabel}>Company Logo</Text>
              <Text style={styles.logoHint}>Tap to upload from your library (optional)</Text>
            </View>
          </View>

          {/* Company name input */}
          <View style={styles.inputBlock}>
            <View style={[styles.inputWrapper, nameError ? styles.inputError : {}]}>
              <TextInput
                style={styles.input}
                value={companyName}
                onChangeText={t => { setCompanyName(t); setNameError(''); }}
                placeholder="e.g. Apex Ventures"
                placeholderTextColor="#6A4A28"
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleContinue}
                autoFocus
              />
            </View>
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.btn, !companyName.trim() && styles.btnDisabled]}
              onPress={handleContinue}
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', paddingVertical: 24 },
  titleBlock: { gap: 12, marginTop: 24 },
  title: { color: '#F5EDD8', fontSize: 38, fontFamily: 'Inter_700Bold', lineHeight: 44 },
  subtitle: { color: '#8C7050', fontSize: 15, fontFamily: 'Inter_400Regular' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  logoPicker: { position: 'relative' },
  logoImg: { width: 68, height: 68, borderRadius: 16 },
  logoPlaceholder: {
    width: 68, height: 68, borderRadius: 16,
    backgroundColor: 'rgba(198,124,18,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(198,124,18,0.4)',
    borderStyle: 'dashed',
  },
  logoInitials: { color: '#C67C12', fontSize: 24, fontFamily: 'Inter_700Bold' },
  logoCameraBtn: {
    position: 'absolute', bottom: -4, right: -4,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#C67C12', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#1A0D06',
  },
  logoLabel: { color: '#F5EDD8', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  logoHint: { color: '#8C7050', fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 4 },
  inputBlock: { gap: 8 },
  inputWrapper: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16,
    borderWidth: 1.5, borderColor: 'rgba(198,124,18,0.3)',
    paddingHorizontal: 20, paddingVertical: 18,
  },
  inputError: { borderColor: '#C43020' },
  input: { color: '#F5EDD8', fontSize: 22, fontFamily: 'Inter_500Medium' },
  errorText: { color: '#C43020', fontSize: 13, fontFamily: 'Inter_400Regular', paddingLeft: 4 },
  footer: { gap: 12 },
  btn: {
    backgroundColor: '#C67C12', borderRadius: 20, paddingVertical: 18,
    alignItems: 'center', shadowColor: '#C67C12',
    shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  btnDisabled: { opacity: 0.5, shadowOpacity: 0, elevation: 0 },
  btnText: { color: '#FFFFFF', fontSize: 17, fontFamily: 'Inter_700Bold' },
});
