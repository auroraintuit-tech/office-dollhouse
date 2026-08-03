import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, Platform, Image,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
  withRepeat, withSequence, cancelAnimation, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OFFICE_THEMES } from '@/constants/colors';
import { OfficeStyle } from '@/contexts/GameContext';
import { AvatarId, AVATARS } from '@/constants/colors';
import { GameCharacter } from '@/components/AvatarSprite';

const { width: SW, height: SH } = Dimensions.get('window');

interface Props {
  companyName: string;
  logoUri: string | null;
  avatarId: AvatarId;
  photoUri?: string | null;
  officeStyle: OfficeStyle;
  onEntered: () => void;
}

const BUILDING_W = SW * 0.74;
const GROUND_Y = SH * 0.78;
const BUILDING_H = SH * 0.44;
const BUILDING_X = (SW - BUILDING_W) / 2;
const BUILDING_TOP = GROUND_Y - BUILDING_H;
const DOOR_W = 52;
const DOOR_H = 82;
const DOOR_X = BUILDING_X + BUILDING_W / 2 - DOOR_W / 2;
const DOOR_Y = GROUND_Y - DOOR_H;
const SIGN_W = 140;
const SIGN_H = 38;
const SIGN_X = BUILDING_X + BUILDING_W / 2 - SIGN_W / 2;
const SIGN_Y_TARGET = DOOR_Y - 48;
const AVATAR_Y = GROUND_Y - 60;
const AVATAR_START_X = SW - 10;
const AVATAR_END_X = DOOR_X + DOOR_W / 2 - 16;

export default function ExteriorScene({ companyName, logoUri, avatarId, photoUri, officeStyle, onEntered }: Props) {
  const insets = useSafeAreaInsets();
  const t = OFFICE_THEMES[officeStyle];
  const avatar = AVATARS.find(a => a.id === avatarId) ?? AVATARS[0];

  // Shared values
  const avatarX = useSharedValue(AVATAR_START_X);
  const avatarBob = useSharedValue(0);
  const signY = useSharedValue(SIGN_Y_TARGET - 180);
  const signOpacity = useSharedValue(0);
  const signScale = useSharedValue(0.5);
  const doorAngle = useSharedValue(0);
  const avatarOpacity = useSharedValue(1);
  const avatarScale = useSharedValue(1);
  const sceneFade = useSharedValue(1);

  useEffect(() => {
    // Step 1: Start walking (400ms delay)
    setTimeout(() => {
      avatarX.value = withTiming(AVATAR_END_X, { duration: 1900, easing: Easing.inOut(Easing.quad) });
      avatarBob.value = withRepeat(
        withSequence(withTiming(-6, { duration: 280 }), withTiming(0, { duration: 280 })),
        -1,
        false,
      );
    }, 400);

    // Step 2: Avatar arrives at door, sign appears
    setTimeout(() => {
      cancelAnimation(avatarBob);
      avatarBob.value = withTiming(0, { duration: 200 });
      signOpacity.value = withTiming(1, { duration: 250 });
      signY.value = withSpring(SIGN_Y_TARGET, { damping: 10, stiffness: 140 });
      signScale.value = withSpring(1, { damping: 10, stiffness: 140 });
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 2400);

    // Step 3: Door swings open
    setTimeout(() => {
      doorAngle.value = withTiming(-72, { duration: 650, easing: Easing.out(Easing.cubic) });
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 3100);

    // Step 4: Avatar walks into door
    setTimeout(() => {
      avatarX.value = withTiming(DOOR_X + DOOR_W / 2 - 12, { duration: 500 });
      avatarScale.value = withTiming(0.7, { duration: 600 });
      avatarOpacity.value = withTiming(0, { duration: 600 });
    }, 3800);

    // Step 5: Fade to transition
    setTimeout(() => {
      sceneFade.value = withTiming(0, { duration: 700 });
    }, 4300);

    // Step 6: Navigate
    setTimeout(() => {
      onEntered();
    }, 4900);
  }, []);

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: avatarX.value },
      { translateY: avatarBob.value },
      { scale: avatarScale.value },
    ],
    opacity: avatarOpacity.value,
  }));

  const signStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: SIGN_X,
    top: signY.value,
    width: SIGN_W,
    opacity: signOpacity.value,
    transform: [{ scale: signScale.value }],
  }));

  const doorStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 450 },
      { rotateY: `${doorAngle.value}deg` },
    ],
  }));

  const sceneStyle = useAnimatedStyle(() => ({
    opacity: sceneFade.value,
  }));

  // Building window positions
  const windows = [
    // Row 1 (top floor)
    { x: BUILDING_X + BUILDING_W * 0.12, y: BUILDING_TOP + BUILDING_H * 0.12 },
    { x: BUILDING_X + BUILDING_W * 0.35, y: BUILDING_TOP + BUILDING_H * 0.12 },
    { x: BUILDING_X + BUILDING_W * 0.58, y: BUILDING_TOP + BUILDING_H * 0.12 },
    { x: BUILDING_X + BUILDING_W * 0.81, y: BUILDING_TOP + BUILDING_H * 0.12 },
    // Row 2 (second floor)
    { x: BUILDING_X + BUILDING_W * 0.12, y: BUILDING_TOP + BUILDING_H * 0.38 },
    { x: BUILDING_X + BUILDING_W * 0.35, y: BUILDING_TOP + BUILDING_H * 0.38 },
    { x: BUILDING_X + BUILDING_W * 0.58, y: BUILDING_TOP + BUILDING_H * 0.38 },
    { x: BUILDING_X + BUILDING_W * 0.81, y: BUILDING_TOP + BUILDING_H * 0.38 },
  ];

  const W_W = BUILDING_W * 0.16;
  const W_H = BUILDING_H * 0.16;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, sceneStyle]}>
      {/* Sky gradient */}
      <LinearGradient
        colors={[t.extSky1, t.extSky2] as [string, string]}
        style={StyleSheet.absoluteFill}
      />

      {/* Stars / ambient dots */}
      {officeStyle === 'hitech' && (
        <>
          {[...Array(18)].map((_, i) => (
            <View key={i} style={[styles.star, {
              left: (i * 79 + 20) % (SW - 10),
              top: (i * 53 + 30) % (GROUND_Y * 0.6),
              opacity: 0.4 + (i % 3) * 0.2,
            }]} />
          ))}
        </>
      )}

      {/* Ground */}
      <View style={{
        position: 'absolute', left: 0, top: GROUND_Y,
        width: SW, height: SH - GROUND_Y, backgroundColor: t.extGround,
      }} />
      {/* Ground line */}
      <View style={{
        position: 'absolute', left: 0, top: GROUND_Y,
        width: SW, height: 2, backgroundColor: t.extGroundLine,
      }} />

      {/* Building body */}
      <View style={{
        position: 'absolute',
        left: BUILDING_X, top: BUILDING_TOP,
        width: BUILDING_W, height: BUILDING_H,
        backgroundColor: t.extBuildingBody,
        borderTopLeftRadius: officeStyle === 'classic' ? 8 : 4,
        borderTopRightRadius: officeStyle === 'classic' ? 8 : 4,
      }}>
        {/* Building accent / facade overlay */}
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: BUILDING_H * 0.06,
          backgroundColor: t.extBuildingAccent,
          borderTopLeftRadius: officeStyle === 'classic' ? 8 : 4,
          borderTopRightRadius: officeStyle === 'classic' ? 8 : 4,
        }} />
        {/* Bottom trim */}
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 4, backgroundColor: t.extDoorTrim, opacity: 0.5,
        }} />
      </View>

      {/* Windows */}
      {windows.map((w, i) => (
        <View key={i} style={{
          position: 'absolute',
          left: w.x, top: w.y,
          width: W_W, height: W_H,
          backgroundColor: t.extWindowGlow,
          borderRadius: officeStyle === 'classic' ? W_W / 2 : 3,
          shadowColor: t.extWindowGlow,
          shadowOpacity: 0.7,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 0 },
          opacity: 0.85,
        }} />
      ))}

      {/* Door frame */}
      <View style={{
        position: 'absolute',
        left: DOOR_X - 6, top: DOOR_Y - 6,
        width: DOOR_W + 12, height: DOOR_H + 6,
        backgroundColor: t.extDoorTrim,
        borderRadius: 4,
      }} />

      {/* Door (animated) — use perspective container at hinge position */}
      <View style={{ position: 'absolute', left: DOOR_X + DOOR_W / 2, top: DOOR_Y, overflow: 'visible' }}>
        <Animated.View style={[doorStyle, { marginLeft: -DOOR_W / 2, width: DOOR_W, height: DOOR_H }]}>
          <View style={{
            width: DOOR_W, height: DOOR_H,
            backgroundColor: t.extDoor,
            borderRadius: 3,
            overflow: 'hidden',
          }}>
            {/* Door panels */}
            <View style={{
              margin: 6, flex: 1,
              borderWidth: 1.5, borderColor: t.extDoorTrim,
              borderRadius: 2, opacity: 0.6,
            }} />
            {/* Door knob */}
            <View style={{
              position: 'absolute', right: 9, top: DOOR_H / 2,
              width: 8, height: 8, borderRadius: 4,
              backgroundColor: t.extDoorTrim,
            }} />
          </View>
        </Animated.View>
      </View>

      {/* Company sign (animates in) */}
      <Animated.View style={[styles.signContainer, signStyle, { backgroundColor: t.extDoorTrim }]}>
        <View style={styles.signInner}>
          {logoUri ? (
            <Image source={{ uri: logoUri }} style={styles.signLogo} resizeMode="contain" />
          ) : (
            <View style={[styles.signLogoPlaceholder, { backgroundColor: t.extBuildingAccent }]} />
          )}
          <Text style={styles.signText} numberOfLines={1}>{companyName}</Text>
        </View>
      </Animated.View>

      {/* Avatar character */}
      <Animated.View style={[styles.avatarWrapper, { top: AVATAR_Y }, avatarStyle]}>
        <GameCharacter avatarId={avatarId} photoUri={photoUri} facing="left" />
      </Animated.View>

      {/* Top padding for status bar */}
      <View style={{ position: 'absolute', top: insets.top + 16, left: 0, right: 0, alignItems: 'center' }}>
        <Text style={styles.sceneLabel}>Welcome to</Text>
        <Text style={styles.sceneName}>{companyName}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },
  signContainer: {
    borderRadius: 6,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 8,
    overflow: 'hidden',
  },
  signInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  signLogo: {
    width: 22,
    height: 22,
    borderRadius: 4,
  },
  signLogoPlaceholder: {
    width: 22,
    height: 22,
    borderRadius: 4,
    opacity: 0.5,
  },
  signText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    flex: 1,
  },
  avatarWrapper: {
    position: 'absolute',
    width: 32,
    alignItems: 'center',
  },
  charHead: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: -3,
    zIndex: 2,
  },
  charHair: {
    position: 'absolute',
    top: 0,
    width: 20,
    height: 10,
    borderRadius: 10,
  },
  charBody: {
    width: 16,
    height: 22,
    borderRadius: 4,
    marginTop: 4,
  },
  charArmL: {
    position: 'absolute',
    top: 26,
    left: 1,
    width: 6,
    height: 14,
    borderRadius: 3,
    transform: [{ rotate: '10deg' }],
  },
  charArmR: {
    position: 'absolute',
    top: 26,
    right: 1,
    width: 6,
    height: 14,
    borderRadius: 3,
    transform: [{ rotate: '-10deg' }],
  },
  charLegsRow: {
    flexDirection: 'row',
    marginTop: 3,
  },
  charLeg: {
    width: 6,
    height: 16,
    borderRadius: 3,
  },
  sceneLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    opacity: 0.7,
    letterSpacing: 1.5,
  },
  sceneName: {
    color: '#F0A500',
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    marginTop: 2,
    textShadowColor: '#F0A500',
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 0 },
  },
});
