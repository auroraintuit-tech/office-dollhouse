import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat,
  withSequence, withDelay,
} from 'react-native-reanimated';
import Svg, { G, Polygon, Path, Rect, Circle, Line, Ellipse, Defs, LinearGradient as SvgLinearGradient, RadialGradient as SvgRadialGradient, Stop } from 'react-native-svg';
import { OFFICE_THEMES } from '@/constants/colors';
import { OfficeStyle, Employee } from '@/contexts/GameContext';
import { AvatarId } from '@/constants/colors';
import { OfficeEmployee, Director, useReducedMotion } from '@/components/OfficeCharacters';

const { width: SW } = Dimensions.get('window');

interface Props {
  officeStyle: OfficeStyle;
  avatarId: AvatarId;
  photoUri?: string | null;
  tutorialStep: number;
  employees: Employee[];
  height: number; // available px height — room scales to fill
  onObjectTap: (obj: 'board' | 'safe' | 'desk' | 'folder' | 'hire') => void;
  onEmployeeTap: (employee: Employee) => void;
}

// SVG design space
const VW = 390;
const VH = 360;

// Tap zone positions in SVG coords
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

// Workstation slots — desk center + employee stand point (SVG coords)
const WORK_SLOTS = [
  { desk: { x: 272, y: 244 }, char: { x: 294, y: 230 } },
  { desk: { x: 118, y: 282 }, char: { x: 94,  y: 270 } },
  { desk: { x: 238, y: 294 }, char: { x: 262, y: 282 } },
  { desk: { x: 310, y: 268 }, char: { x: 330, y: 254 } },
  { desk: { x: 162, y: 314 }, char: { x: 140, y: 304 } },
  { desk: { x: 216, y: 326 }, char: { x: 196, y: 318 } },
];

function WorkDesk({ cx, cy, t }: { cx: number; cy: number; t: any }) {
  return (
    <G>
      <Ellipse cx={cx} cy={cy + 20} rx={26} ry={8} fill="#000" opacity="0.12" />
      {/* Desk top diamond */}
      <Polygon points={`${cx - 22},${cy} ${cx},${cy - 11} ${cx + 22},${cy} ${cx},${cy + 11}`} fill={t.deskTop} />
      {/* Front-left face */}
      <Polygon points={`${cx - 22},${cy} ${cx},${cy + 11} ${cx},${cy + 22} ${cx - 22},${cy + 11}`} fill={t.deskLeft} />
      {/* Front-right face */}
      <Polygon points={`${cx + 22},${cy} ${cx},${cy + 11} ${cx},${cy + 22} ${cx + 22},${cy + 11}`} fill={t.deskFront} />
      {/* Top edge highlight */}
      <Polygon points={`${cx - 22},${cy} ${cx},${cy - 11} ${cx + 22},${cy}`} fill="none" stroke="#FFF" strokeWidth="0.8" opacity="0.4" />
      {/* Monitor */}
      <Rect x={cx - 7} y={cy - 22} width={14} height={10} rx={1.5} fill={t.monitorScreen} />
      <Rect x={cx - 6} y={cy - 21} width={12} height={8} rx={1} fill={t.monitorGlow} opacity="0.55" />
      <Rect x={cx - 1.5} y={cy - 12} width={3} height={4} fill={t.deskLeft} />
      {/* Papers */}
      <Polygon points={`${cx + 6},${cy + 1} ${cx + 14},${cy - 3} ${cx + 18},${cy} ${cx + 10},${cy + 4}`} fill="#FFFFFF" opacity="0.9" />
    </G>
  );
}

export default function IsometricRoom({
  officeStyle, avatarId, photoUri, tutorialStep, employees, height, onObjectTap, onEmployeeTap,
}: Props) {
  const t = OFFICE_THEMES[officeStyle];
  const reducedMotion = useReducedMotion();

  // Scale room to fill available space (no horizontal scroll)
  const scale = Math.min(SW / VW, height / VH);
  const roomW = VW * scale;
  const roomH = VH * scale;
  const offX = (SW - roomW) / 2;

  const stage = employees.length === 0 ? 0 : employees.length === 1 ? 1 : employees.length <= 3 ? 2 : 3;

  // Spawn animation only for employees that appear AFTER this scene mounted
  // (avoids replaying the animation on remount / tab switches).
  const seenIds = React.useRef<Set<string> | null>(null);
  if (seenIds.current === null) {
    seenIds.current = new Set(employees.map(e => e.id));
  }
  const newIds = employees.filter(e => !seenIds.current!.has(e.id)).map(e => e.id);
  useEffect(() => {
    newIds.forEach(id => seenIds.current!.add(id));
  });

  // Tutorial hint pulse
  const hintPulse = useSharedValue(1);
  useEffect(() => {
    if (tutorialStep >= 1 && tutorialStep <= 3 && !reducedMotion) {
      hintPulse.value = withRepeat(
        withSequence(withTiming(1.1, { duration: 600 }), withTiming(1, { duration: 600 })),
        -1, false,
      );
    }
  }, [tutorialStep, reducedMotion]);
  const hintStyle = useAnimatedStyle(() => ({ transform: [{ scale: hintPulse.value }] }));
  const hint = TUTORIAL_HINTS[tutorialStep];

  const sx = (v: number) => v * scale + offX;
  const sy = (v: number) => v * scale;

  return (
    <View style={{ width: SW, height: roomH, position: 'relative' }}>
      <Svg width={SW} height={roomH} viewBox={`${-offX / scale} 0 ${SW / scale} ${VH}`}>
        <Defs>
          <SvgLinearGradient id="ambientLeft" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={t.leftWall} stopOpacity="1" />
            <Stop offset="1" stopColor={t.leftWall} stopOpacity="0.75" />
          </SvgLinearGradient>
          <SvgLinearGradient id="ambientRight" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={t.rightWall} stopOpacity="0.75" />
            <Stop offset="1" stopColor={t.rightWall} stopOpacity="1" />
          </SvgLinearGradient>
          <SvgLinearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={t.floor} stopOpacity="1" />
            <Stop offset="1" stopColor={t.floor} stopOpacity="0.9" />
          </SvgLinearGradient>
          <SvgRadialGradient id="lightPool" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={t.windowGlow} stopOpacity="0.25" />
            <Stop offset="1" stopColor={t.windowGlow} stopOpacity="0" />
          </SvgRadialGradient>
          <SvgLinearGradient id="lightShaft" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={t.windowGlow} stopOpacity="0.3" />
            <Stop offset="1" stopColor={t.windowGlow} stopOpacity="0" />
          </SvgLinearGradient>
          <SvgLinearGradient id="wallShade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000000" stopOpacity="0.08" />
            <Stop offset="0.5" stopColor="#000000" stopOpacity="0" />
          </SvgLinearGradient>
          <SvgLinearGradient id="rugGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={t.trim} stopOpacity="0.28" />
            <Stop offset="1" stopColor={t.trim} stopOpacity="0.14" />
          </SvgLinearGradient>
        </Defs>

        {/* Backdrop */}
        <Rect x={-offX / scale} y={0} width={SW / scale} height={VH} fill={t.bg} />

        {/* Left wall */}
        <Polygon points="195,165 35,255 35,145 195,55" fill="url(#ambientLeft)" />
        <Line x1="75" y1="145" x2="155" y2="82" stroke={t.trim} strokeWidth="0.5" opacity="0.3" />
        <Line x1="115" y1="145" x2="175" y2="96" stroke={t.trim} strokeWidth="0.5" opacity="0.3" />

        {/* Right wall */}
        <Polygon points="195,165 355,255 355,145 195,55" fill="url(#ambientRight)" />
        <Line x1="315" y1="145" x2="235" y2="82" stroke={t.trim} strokeWidth="0.5" opacity="0.3" />
        <Line x1="275" y1="145" x2="215" y2="96" stroke={t.trim} strokeWidth="0.5" opacity="0.3" />

        {/* Wall shading near ceiling */}
        <Polygon points="195,165 35,255 35,145 195,55" fill="url(#wallShade)" />
        <Polygon points="195,165 355,255 355,145 195,55" fill="url(#wallShade)" />
        <Line x1="195" y1="55" x2="195" y2="165" stroke="#000" strokeWidth="2.5" opacity="0.08" />

        {/* Floor */}
        <Polygon points="195,165 355,255 195,345 35,255" fill="url(#floorGrad)" />
        {[0, 1, 2, 3, 4].map(i => {
          const u = 0.15 + i * 0.18;
          return <Line key={i}
            x1={195 - u * 160} y1={165 + u * 90}
            x2={195 + (1 - u) * 160} y2={165 + (1 - u) * 90}
            stroke={t.floorLine} strokeWidth={0.8} opacity={0.5} />;
        })}

        {/* Light pool + window shaft */}
        <Ellipse cx={195} cy={255} rx={135} ry={75} fill="url(#lightPool)" />
        <Polygon points="256,134 315,149 300,240 230,215" fill="url(#lightShaft)" />

        {/* Rug */}
        <Polygon points="190,205 300,268 195,325 88,262" fill="url(#rugGrad)" />
        <Polygon points="190,213 288,268 195,317 100,262" fill="none" stroke={t.trim} strokeWidth="1" opacity="0.3" />

        {/* Ceiling + baseboard trim */}
        <Line x1="35" y1="145" x2="195" y2="55" stroke={t.trim} strokeWidth="1.5" opacity="0.5" />
        <Line x1="195" y1="55" x2="355" y2="145" stroke={t.trim} strokeWidth="1.5" opacity="0.5" />
        <Line x1="35" y1="255" x2="195" y2="165" stroke={t.trim} strokeWidth="2" opacity="0.45" />
        <Line x1="195" y1="165" x2="355" y2="255" stroke={t.trim} strokeWidth="2" opacity="0.45" />

        {/* Wall art (left wall) */}
        <G>
          <Path d="M 96 128 L 130 116 L 130 138 L 96 150 Z" fill={t.trim} opacity="0.55" />
          <Path d="M 99 131 L 127 121 L 127 135 L 99 145 Z" fill={t.windowGlow} opacity="0.4" />
        </G>

        {/* Wall clock (right wall) */}
        <G>
          <Ellipse cx={228} cy={105} rx={9} ry={10} fill={t.boardBg} />
          <Ellipse cx={228} cy={105} rx={7} ry={8} fill={t.boardSurface} />
          <Line x1="228" y1="105" x2="228" y2="100" stroke={t.boardText} strokeWidth="1.2" />
          <Line x1="228" y1="105" x2="232" y2="106" stroke={t.boardText} strokeWidth="1" />
        </G>

        {/* TASK BOARD (left wall) */}
        <G>
          <Path d="M 78 168 L 146 151 L 146 182 L 78 199 Z" fill="#000" opacity="0.12" />
          <Path d="M 80 170 L 144 153 L 144 180 L 80 197 Z" fill={t.boardBg} />
          <Path d="M 83 173 L 141 157 L 141 177 L 83 193 Z" fill={t.boardSurface} />
          <Line x1="89" y1="164" x2="137" y2="152" stroke={t.boardText} strokeWidth="1.5" opacity="0.7" />
          <Line x1="89" y1="170" x2="137" y2="158" stroke={t.boardText} strokeWidth="1.5" opacity="0.7" />
          <Line x1="89" y1="176" x2="120" y2="167" stroke={t.boardText} strokeWidth="1.5" opacity="0.4" />
          <Circle cx={87} cy={164} r={2.5} fill="#4CAF50" />
          <Circle cx={87} cy={170} r={2.5} fill="#FF9800" />
          <Circle cx={87} cy={176} r={2.5} fill="#F44336" />
        </G>

        {/* WINDOW (right wall) */}
        <G>
          <Path d="M 252 96 L 318 112 L 318 153 L 252 137 Z" fill={t.windowFrame} />
          <Path d="M 256 100 L 315 115 L 315 149 L 256 134 Z" fill={t.windowGlass} />
          <Line x1="286" y1="100" x2="286" y2="149" stroke={t.windowFrame} strokeWidth="2" />
          <Line x1="256" y1="124" x2="315" y2="131" stroke={t.windowFrame} strokeWidth="2" />
          {/* Sun rays visible through glass */}
          <Circle cx={300} cy={112} r={6} fill={t.windowGlow} opacity="0.8" />
          <Path d="M 256 100 L 315 115 L 315 149 L 256 134 Z" fill={t.windowGlow} opacity="0.1" />
        </G>

        {/* SAFE */}
        <G>
          <Ellipse cx={100} cy={248} rx={22} ry={8} fill="#000" opacity="0.14" />
          <Path d="M 76 222 L 88 238 L 88 258 L 76 242 Z" fill={t.safeLeft} />
          <Path d="M 76 222 L 112 210 L 122 222 L 88 234 Z" fill={t.safeTop} />
          <Path d="M 88 234 L 122 222 L 122 248 L 88 258 Z" fill={t.safeFront} />
          <Path d="M 88 234 L 122 222" stroke="#FFF" strokeWidth="0.8" opacity="0.35" />
          <Path d="M 93 236 L 117 227 L 117 245 L 93 254 Z" fill="none" stroke="#000" strokeWidth="0.7" opacity="0.25" />
          <Circle cx={105} cy={234} r={5} fill={t.safeHandle} opacity="0.95" />
          <Circle cx={105} cy={234} r={2.5} fill={t.safeHandleInner} />
        </G>

        {/* DIRECTOR'S CHAIR */}
        <G>
          <Ellipse cx={183} cy={222} rx={18} ry={7} fill="#000" opacity="0.1" />
          <Path d="M 167 202 L 196 192 L 196 182 L 167 192 Z" fill={t.chairBack} />
          <Path d="M 160 212 L 190 202 L 200 213 L 170 223 Z" fill={t.chairTop} />
        </G>

        {/* DIRECTOR'S DESK */}
        <G>
          <Ellipse cx={190} cy={270} rx={48} ry={14} fill="#000" opacity="0.15" />
          <Path d="M 142 243 L 174 263 L 174 283 L 142 263 Z" fill={t.deskLeft} />
          <Path d="M 142 243 L 207 220 L 237 242 L 174 263 Z" fill={t.deskTop} />
          <Path d="M 174 263 L 237 242 L 237 262 L 174 283 Z" fill={t.deskFront} />
          <Path d="M 142 243 L 207 220 L 237 242" fill="none" stroke="#FFF" strokeWidth="1" opacity="0.4" />
          <Path d="M 180 266 L 210 256" stroke="#000" strokeWidth="0.7" opacity="0.2" />
          <Path d="M 180 273 L 210 263" stroke="#000" strokeWidth="0.7" opacity="0.2" />
          {/* Folder */}
          <Path d="M 154 242 L 183 232 L 192 240 L 163 250 Z" fill={t.folder} />
          <Path d="M 154 242 L 162 237 L 172 237 L 164 242 Z" fill={t.folderTab} />
          {/* Monitor */}
          <Path d="M 188 232 L 213 223 L 218 231 L 193 240 Z" fill={t.monitorScreen} />
          <Path d="M 195 241 L 208 237 L 209 244 L 196 248 Z" fill={t.deskTop} />
          <Path d="M 188 232 L 213 223 L 218 231 L 193 240 Z" fill={t.monitorGlow} opacity="0.35" />
        </G>

        {/* PLANT */}
        <G>
          <Ellipse cx={290} cy={245} rx={14} ry={5} fill="#000" opacity="0.1" />
          <Path d="M 278 232 L 300 224 L 300 245 L 278 253 Z" fill={t.plantPot} />
          <Ellipse cx={289} cy={220} rx={10} ry={13} fill={t.plantLeaf} />
          <Ellipse cx={280} cy={218} rx={7} ry={10} fill={t.plantLeaf2} />
          <Ellipse cx={298} cy={217} rx={7} ry={10} fill={t.plantLeaf2} />
          <Ellipse cx={289} cy={213} rx={6} ry={8} fill={t.plantLeafTop} />
        </G>

        {/* ─── Growth stage: extra decor for bigger teams ─── */}
        {stage >= 2 && (
          <G>
            {/* Second plant, left side */}
            <Ellipse cx={70} cy={278} rx={11} ry={4} fill="#000" opacity="0.1" />
            <Path d="M 61 268 L 79 262 L 79 278 L 61 284 Z" fill={t.plantPot} />
            <Ellipse cx={70} cy={257} rx={8} ry={10} fill={t.plantLeaf} />
            <Ellipse cx={64} cy={255} rx={5} ry={7} fill={t.plantLeaf2} />
            <Ellipse cx={76} cy={254} rx={5} ry={7} fill={t.plantLeafTop} />
          </G>
        )}
        {stage >= 3 && (
          <G>
            {/* Annex zone divider (right side) — glass partition */}
            <Polygon points="300,222 355,255 355,180 300,150" fill={t.windowGlass} opacity="0.3" />
            <Line x1="300" y1="150" x2="300" y2="222" stroke={t.trim} strokeWidth="2" opacity="0.6" />
            <Line x1="300" y1="222" x2="355" y2="255" stroke={t.trim} strokeWidth="2" opacity="0.6" />
            {/* Annex rug */}
            <Polygon points="300,262 348,290 310,314 262,286" fill={t.trim} opacity="0.15" />
          </G>
        )}

        {/* Workstations for hired employees */}
        {employees.map((emp, i) => {
          const slot = WORK_SLOTS[i % WORK_SLOTS.length];
          return <WorkDesk key={emp.id} cx={slot.desk.x} cy={slot.desk.y} t={t} />;
        })}
      </Svg>

      {/* Tap zones */}
      {(['board', 'safe', 'desk'] as const).map(obj => {
        const z = TAP_ZONES[obj];
        const isHighlighted = hint?.obj === obj;
        return (
          <TouchableOpacity
            key={obj}
            onPress={() => onObjectTap(obj)}
            accessibilityRole="button"
            accessibilityLabel={obj === 'board' ? 'Task board' : obj === 'safe' ? 'Company safe' : 'Director desk'}
            style={{
              position: 'absolute',
              left: sx(z.x), top: sy(z.y),
              width: z.w * scale, height: z.h * scale,
              minWidth: 44, minHeight: 44,
            }}
            activeOpacity={0.7}
          >
            {isHighlighted && (
              <Animated.View style={[styles.tapGlow, hintStyle, { borderRadius: 8 }]} />
            )}
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity
        onPress={() => onObjectTap('folder')}
        accessibilityRole="button"
        accessibilityLabel="Documents folder"
        style={{
          position: 'absolute',
          left: sx(TAP_ZONES.folder.x), top: sy(TAP_ZONES.folder.y),
          width: TAP_ZONES.folder.w * scale, height: Math.max(44, TAP_ZONES.folder.h * scale),
        }}
        activeOpacity={0.7}
      />

      {/* Director character (standing near desk) */}
      <Director
        avatarId={avatarId}
        photoUri={photoUri}
        x={sx(178) - 14}
        y={sy(258) - 52}
        scale={0.95}
        reducedMotion={reducedMotion}
      />

      {/* Hired employees at their workstations */}
      {employees.map((emp, i) => {
        const slot = WORK_SLOTS[i % WORK_SLOTS.length];
        return (
          <OfficeEmployee
            key={emp.id}
            employee={emp}
            x={sx(slot.char.x) - 22}
            y={sy(slot.char.y) - 46}
            justHired={newIds.includes(emp.id)}
            reducedMotion={reducedMotion}
            onPress={() => onEmployeeTap(emp)}
          />
        );
      })}

      {/* Tutorial hint bubble */}
      {hint && (
        <Animated.View
          style={[
            styles.hintBubble,
            hintStyle,
            { left: sx(hint.dx) - 44, top: sy(hint.dy) - 48 },
          ]}
        >
          <Text style={styles.hintText}>{hint.text}</Text>
          <View style={styles.hintArrow} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tapGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#C67C12',
    opacity: 0.2,
  },
  hintBubble: {
    position: 'absolute',
    backgroundColor: '#C67C12',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
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
});
