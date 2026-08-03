import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Platform } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat,
  withSequence, withSpring, withDelay,
} from 'react-native-reanimated';
import Svg, { G, Polygon, Path, Rect, Circle, Line, Ellipse, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { OFFICE_THEMES, OfficeStyleTheme } from '@/constants/colors';
import { OfficeStyle } from '@/contexts/GameContext';
import { AvatarId, AVATARS } from '@/constants/colors';

const { width: SW } = Dimensions.get('window');
const SCALE = SW / 390;
const ROOM_H = 360 * SCALE;

interface Props {
  officeStyle: OfficeStyle;
  avatarId: AvatarId;
  tutorialStep: number;
  employeeCount: number;
  onObjectTap: (obj: 'board' | 'safe' | 'desk' | 'folder' | 'hire') => void;
  onEmployeeTap?: (employeeId: string) => void;
}

// Tap zone positions in SVG coords (390x360)
const TAP_ZONES = {
  board:  { x: 78,  y: 152, w: 68,  h: 48 },
  safe:   { x: 72,  y: 205, w: 56,  h: 58 },
  desk:   { x: 138, y: 220, w: 102, h: 72 },
  folder: { x: 148, y: 222, w: 50,  h: 36 },
};

const TUTORIAL_HINTS: Record<number, { obj: string; text: string; dx: number; dy: number }> = {
  1: { obj: 'board', text: 'Tap the\ntask board', dx: 148, dy: 140 },
  2: { obj: 'safe',  text: 'Check your\nfinances',  dx: 128, dy: 198 },
  3: { obj: 'desk',  text: 'Your\nworkspace',       dx: 225, dy: 215 },
};

export default function IsometricRoom({ officeStyle, avatarId, tutorialStep, employeeCount, onObjectTap }: Props) {
  const t = OFFICE_THEMES[officeStyle];
  const avatar = AVATARS.find(a => a.id === avatarId) ?? AVATARS[0];

  // Avatar position animation: walk to desk on mount
  const avatarX = useSharedValue(195 * SCALE);
  const avatarY = useSharedValue(310 * SCALE);
  const avatarBob = useSharedValue(0);

  useEffect(() => {
    // Walk to desk position
    avatarX.value = withDelay(400, withTiming(182 * SCALE, { duration: 1400 }));
    avatarY.value = withDelay(400, withTiming(262 * SCALE, { duration: 1400 }));
    // Bob while walking
    avatarBob.value = withDelay(400, withRepeat(
      withSequence(withTiming(-5, { duration: 280 }), withTiming(0, { duration: 280 })),
      5,
      false,
    ));
  }, []);

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: avatarX.value - 12 }, { translateY: avatarY.value + avatarBob.value - 44 }],
  }));

  // Tutorial hint pulse
  const hintPulse = useSharedValue(1);
  useEffect(() => {
    if (tutorialStep >= 1 && tutorialStep <= 3) {
      hintPulse.value = withRepeat(
        withSequence(withTiming(1.12, { duration: 600 }), withTiming(1, { duration: 600 })),
        -1,
        false,
      );
    }
  }, [tutorialStep]);

  const hintStyle = useAnimatedStyle(() => ({ transform: [{ scale: hintPulse.value }] }));

  const hint = TUTORIAL_HINTS[tutorialStep];

  function handleTap(obj: 'board' | 'safe' | 'desk' | 'folder' | 'hire') {
    onObjectTap(obj);
  }

  return (
    <View style={{ width: SW, height: ROOM_H, position: 'relative' }}>
      {/* ─── SVG room background ─── */}
      <Svg width={SW} height={ROOM_H} viewBox="0 0 390 360">
        <Defs>
          <SvgLinearGradient id="ambientLeft" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={t.leftWall} stopOpacity="1" />
            <Stop offset="1" stopColor={t.leftWall} stopOpacity="0.7" />
          </SvgLinearGradient>
          <SvgLinearGradient id="ambientRight" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={t.rightWall} stopOpacity="0.7" />
            <Stop offset="1" stopColor={t.rightWall} stopOpacity="1" />
          </SvgLinearGradient>
          <SvgLinearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={t.floor} stopOpacity="1" />
            <Stop offset="1" stopColor={t.floor} stopOpacity="0.85" />
          </SvgLinearGradient>
        </Defs>

        {/* Sky / backdrop */}
        <Rect x={0} y={0} width={390} height={360} fill={t.bg} />

        {/* Left wall */}
        <Polygon points="195,165 35,255 35,145 195,55" fill="url(#ambientLeft)" />
        {/* Left wall panel lines */}
        <Line x1="75" y1="145" x2="155" y2="82" stroke={t.trim} strokeWidth="0.5" opacity="0.3" />
        <Line x1="115" y1="145" x2="175" y2="96" stroke={t.trim} strokeWidth="0.5" opacity="0.3" />

        {/* Right wall */}
        <Polygon points="195,165 355,255 355,145 195,55" fill="url(#ambientRight)" />
        {/* Right wall panel lines */}
        <Line x1="315" y1="145" x2="235" y2="82" stroke={t.trim} strokeWidth="0.5" opacity="0.3" />
        <Line x1="275" y1="145" x2="215" y2="96" stroke={t.trim} strokeWidth="0.5" opacity="0.3" />

        {/* Floor */}
        <Polygon points="195,165 355,255 195,345 35,255" fill="url(#floorGrad)" />
        {/* Floor plank lines */}
        {[0, 1, 2, 3, 4].map(i => {
          const t_val = 0.15 + i * 0.18;
          const x1 = 195 - t_val * 160;
          const y1 = 165 + t_val * 90;
          const x2 = 195 + (1 - t_val) * 160;
          const y2 = 165 + (1 - t_val) * 90;
          return <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={OFFICE_THEMES[officeStyle].floorLine} strokeWidth={0.8} opacity={0.4} />;
        })}

        {/* Ceiling edge / trim */}
        <Line x1="35" y1="145" x2="195" y2="55" stroke={t.ceilingGlow} strokeWidth="1.5" opacity="0.6" />
        <Line x1="195" y1="55" x2="355" y2="145" stroke={t.ceilingGlow} strokeWidth="1.5" opacity="0.6" />

        {/* Baseboard trim */}
        <Line x1="35" y1="255" x2="195" y2="165" stroke={t.trim} strokeWidth="2" opacity="0.5" />
        <Line x1="195" y1="165" x2="355" y2="255" stroke={t.trim} strokeWidth="2" opacity="0.5" />

        {/* ─── TASK BOARD (left wall) ─── */}
        <G>
          <Path d="M 80 170 L 144 153 L 144 180 L 80 197 Z" fill={t.boardBg} />
          <Path d="M 83 173 L 141 157 L 141 177 L 83 193 Z" fill={t.boardSurface} />
          {/* Task lines */}
          <Line x1="89" y1="164" x2="137" y2="152" stroke={t.boardText} strokeWidth="1.5" opacity="0.7" />
          <Line x1="89" y1="170" x2="137" y2="158" stroke={t.boardText} strokeWidth="1.5" opacity="0.7" />
          <Line x1="89" y1="176" x2="120" y2="167" stroke={t.boardText} strokeWidth="1.5" opacity="0.4" />
          {/* Status dots */}
          <Circle cx={87} cy={164} r={2.5} fill="#4CAF50" />
          <Circle cx={87} cy={170} r={2.5} fill="#FF9800" />
          <Circle cx={87} cy={176} r={2.5} fill="#F44336" />
        </G>

        {/* ─── WINDOW (right wall) ─── */}
        <G>
          <Path d="M 252 96 L 318 112 L 318 153 L 252 137 Z" fill={t.windowFrame} />
          <Path d="M 256 100 L 315 115 L 315 149 L 256 134 Z" fill={t.windowGlass} />
          {/* Window panes */}
          <Line x1="286" y1="100" x2="286" y2="149" stroke={t.windowFrame} strokeWidth="2" />
          <Line x1="256" y1="124" x2="315" y2="131" stroke={t.windowFrame} strokeWidth="2" />
          {/* Window glow */}
          <Path d="M 256 100 L 315 115 L 315 149 L 256 134 Z" fill={t.windowGlow} opacity="0.12" />
        </G>

        {/* ─── SAFE (back-left floor area) ─── */}
        <G>
          <Ellipse cx={100} cy={248} rx={22} ry={8} fill="#000" opacity="0.18" />
          {/* Left face */}
          <Path d="M 76 222 L 88 238 L 88 258 L 76 242 Z" fill={t.safeLeft} />
          {/* Top */}
          <Path d="M 76 222 L 112 210 L 122 222 L 88 234 Z" fill={t.safeTop} />
          {/* Front */}
          <Path d="M 88 234 L 122 222 L 122 248 L 88 258 Z" fill={t.safeFront} />
          {/* Handle */}
          <Circle cx={105} cy={234} r={5} fill={t.safeHandle} opacity="0.9" />
          <Circle cx={105} cy={234} r={2.5} fill={t.safeHandleInner} />
        </G>

        {/* ─── CHAIR ─── */}
        <G>
          <Ellipse cx={183} cy={222} rx={18} ry={7} fill="#000" opacity="0.12" />
          {/* Chair back */}
          <Path d="M 167 202 L 196 192 L 196 182 L 167 192 Z" fill={t.chairBack} />
          {/* Chair seat */}
          <Path d="M 160 212 L 190 202 L 200 213 L 170 223 Z" fill={t.chairTop} />
        </G>

        {/* ─── DESK ─── */}
        <G>
          <Ellipse cx={190} cy={270} rx={48} ry={14} fill="#000" opacity="0.2" />
          {/* Left face */}
          <Path d="M 142 243 L 174 263 L 174 283 L 142 263 Z" fill={t.deskLeft} />
          {/* Top */}
          <Path d="M 142 243 L 207 220 L 237 242 L 174 263 Z" fill={t.deskTop} />
          {/* Front face */}
          <Path d="M 174 263 L 237 242 L 237 262 L 174 283 Z" fill={t.deskFront} />
          {/* Desk accent strip */}
          <Line x1="142" y1="243" x2="207" y2="220" stroke={t.ceilingGlow} strokeWidth="0.8" opacity="0.2" />

          {/* ── Folder on desk ── */}
          <Path d="M 154 242 L 183 232 L 192 240 L 163 250 Z" fill={t.folder} />
          <Path d="M 154 242 L 162 237 L 172 237 L 164 242 Z" fill={t.folderTab} />

          {/* ── Monitor ── */}
          <Path d="M 188 232 L 213 223 L 218 231 L 193 240 Z" fill={t.monitorScreen} />
          <Path d="M 195 241 L 208 237 L 209 244 L 196 248 Z" fill={t.deskTop} />
          {/* Screen glow */}
          <Path d="M 188 232 L 213 223 L 218 231 L 193 240 Z" fill={t.monitorGlow} opacity="0.3" />
        </G>

        {/* ─── PLANT (right-back) ─── */}
        <G>
          <Ellipse cx={290} cy={245} rx={14} ry={5} fill="#000" opacity="0.14" />
          {/* Pot */}
          <Path d="M 278 232 L 300 224 L 300 245 L 278 253 Z" fill={t.plantPot} />
          {/* Leaves */}
          <Ellipse cx={289} cy={220} rx={10} ry={13} fill={t.plantLeaf} />
          <Ellipse cx={280} cy={218} rx={7} ry={10} fill={t.plantLeaf2} />
          <Ellipse cx={298} cy={217} rx={7} ry={10} fill={t.plantLeaf2} />
          <Ellipse cx={289} cy={213} rx={6} ry={8} fill={t.plantLeafTop} />
        </G>
      </Svg>

      {/* ─── Tap zones (absolute positioned over SVG) ─── */}
      {(['board', 'safe', 'desk'] as const).map(obj => {
        const z = TAP_ZONES[obj];
        const isHighlighted = hint?.obj === obj;
        return (
          <TouchableOpacity
            key={obj}
            onPress={() => handleTap(obj)}
            style={{
              position: 'absolute',
              left: z.x * SCALE,
              top: z.y * SCALE,
              width: z.w * SCALE,
              height: z.h * SCALE,
            }}
            activeOpacity={0.7}
          >
            {isHighlighted && (
              <Animated.View style={[styles.tapGlow, hintStyle, { borderRadius: 8 }]} />
            )}
          </TouchableOpacity>
        );
      })}

      {/* ─── Folder tap zone (on desk) ─── */}
      <TouchableOpacity
        onPress={() => handleTap('folder')}
        style={{
          position: 'absolute',
          left: TAP_ZONES.folder.x * SCALE,
          top: TAP_ZONES.folder.y * SCALE,
          width: TAP_ZONES.folder.w * SCALE,
          height: TAP_ZONES.folder.h * SCALE,
        }}
        activeOpacity={0.7}
      />

      {/* ─── Animated avatar in room ─── */}
      <Animated.View style={[styles.avatarContainer, avatarStyle]}>
        <View style={[styles.avatarHead, { backgroundColor: '#E8C8A0' }]} />
        <View style={[styles.avatarBody, { backgroundColor: avatar.color }]} />
      </Animated.View>

      {/* ─── Tutorial hint bubble ─── */}
      {hint && (
        <Animated.View
          style={[
            styles.hintBubble,
            hintStyle,
            { left: hint.dx * SCALE - 44, top: hint.dy * SCALE - 48 },
          ]}
        >
          <Text style={styles.hintText}>{hint.text}</Text>
          <View style={styles.hintArrow} />
        </Animated.View>
      )}

      {/* ─── Hire button (appears after tutorial) ─── */}
      {tutorialStep >= 4 && employeeCount === 0 && (
        <Animated.View style={[styles.hirePrompt, { bottom: 8 }]}>
          <TouchableOpacity onPress={() => handleTap('hire')} style={styles.hireBtn} activeOpacity={0.85}>
            <Text style={styles.hireBtnText}>+ Hire First Employee</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tapGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#C67C12',
    opacity: 0.18,
  },
  avatarContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  avatarHead: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginBottom: -2,
  },
  avatarBody: {
    width: 11,
    height: 14,
    borderRadius: 3,
  },
  hintBubble: {
    position: 'absolute',
    backgroundColor: '#C67C12',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
    alignItems: 'center',
    minWidth: 88,
  },
  hintText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    lineHeight: 15,
  },
  hintArrow: {
    position: 'absolute',
    bottom: -7,
    left: '50%',
    marginLeft: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#C67C12',
  },
  hirePrompt: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hireBtn: {
    backgroundColor: '#C67C12',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 28,
    shadowColor: '#C67C12',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  hireBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
});
