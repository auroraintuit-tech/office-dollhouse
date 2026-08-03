import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  children: ReactNode;
  step: number;   // 1-4
  totalSteps?: number;
}

export default function OnboardingLayout({ children, step, totalSteps = 4 }: Props) {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <LinearGradient
      colors={['#1A0D06', '#2C1208', '#3A1A08']}
      locations={[0, 0.5, 1]}
      style={styles.gradient}
    >
      <View style={[styles.inner, { paddingTop: topPad + 16, paddingBottom: bottomPad + 16 }]}>
        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {Array.from({ length: totalSteps }, (_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i + 1 === step && styles.dotActive,
                i + 1 < step && styles.dotDone,
              ]}
            />
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {children}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5A3A20',
  },
  dotActive: {
    backgroundColor: '#C67C12',
    width: 24,
    borderRadius: 4,
  },
  dotDone: {
    backgroundColor: '#8A5A2A',
  },
  content: {
    flex: 1,
  },
});
