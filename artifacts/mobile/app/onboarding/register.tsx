import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGame } from '@/contexts/GameContext';
import OnboardingLayout from '@/components/OnboardingLayout';

export default function RegisterScreen() {
  const { updateGame } = useGame();
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  function handleContinue() {
    if (!name.trim()) {
      setNameError('Please enter your name');
      return;
    }
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateGame({ player: { name: name.trim(), email: '', avatarId: 'ceo' }, phase: 'company' });
    router.replace('/onboarding/company');
  }

  return (
    <OnboardingLayout step={1}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Title */}
          <View style={styles.titleBlock}>
            <Text style={styles.titleLabel}>OFFICEOS</Text>
            <Text style={styles.title}>What's your{'\n'}name?</Text>
            <Text style={styles.subtitle}>You'll be the founder & CEO of your company</Text>
          </View>

          {/* Input */}
          <View style={styles.inputBlock}>
            <View style={[styles.inputWrapper, nameError ? styles.inputError : {}]}>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={t => { setName(t); setNameError(''); }}
                placeholder="Your full name"
                placeholderTextColor="#6A4A28"
                autoCapitalize="words"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
            </View>
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
          </View>

          {/* Continue button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.btn, !name.trim() && styles.btnDisabled]}
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
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  titleBlock: {
    gap: 12,
    marginTop: 24,
  },
  titleLabel: {
    color: '#C67C12',
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 3,
  },
  title: {
    color: '#F5EDD8',
    fontSize: 38,
    fontFamily: 'Inter_700Bold',
    lineHeight: 44,
  },
  subtitle: {
    color: '#8C7050',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
  },
  inputBlock: {
    gap: 8,
  },
  inputWrapper: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(198,124,18,0.3)',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  inputError: {
    borderColor: '#C43020',
  },
  input: {
    color: '#F5EDD8',
    fontSize: 22,
    fontFamily: 'Inter_500Medium',
  },
  errorText: {
    color: '#C43020',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    paddingLeft: 4,
  },
  footer: {
    gap: 12,
  },
  btn: {
    backgroundColor: '#C67C12',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#C67C12',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  btnDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
  },
});
