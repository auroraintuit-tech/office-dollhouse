/**
 * OfficeOS game color palette — warm, inviting, casual-game aesthetic
 */

const colors = {
  light: {
    text: '#1E120A',
    tint: '#C67C12',
    background: '#EDE3D0',
    foreground: '#1E120A',
    card: '#F5EDD8',
    cardForeground: '#1E120A',
    primary: '#C67C12',
    primaryForeground: '#FFFFFF',
    secondary: '#6B4226',
    secondaryForeground: '#FFFFFF',
    muted: '#DDD0B8',
    mutedForeground: '#8C7050',
    accent: '#3D8B66',
    accentForeground: '#FFFFFF',
    destructive: '#C43020',
    destructiveForeground: '#FFFFFF',
    border: '#CEB898',
    input: '#DDD0B8',

    // Game-specific tokens
    gold: '#F0A500',
    goldDark: '#B8780A',
    success: '#2ECC71',
    onboardingBg1: '#1A0D06',
    onboardingBg2: '#3A1A08',
    gameToolbar: '#2C1810',
  },
  radius: 16,
} as const;

// -----------------------------------------------------------------------
// Per-style office themes for IsometricRoom and ExteriorScene
// -----------------------------------------------------------------------

export type OfficeStyleTheme = {
  // Room structure
  bg: string;
  leftWall: string;
  rightWall: string;
  floor: string;
  floorLine: string;
  trim: string;
  ceilingGlow: string;
  // Task board
  boardBg: string;
  boardSurface: string;
  boardText: string;
  // Window
  windowFrame: string;
  windowGlass: string;
  windowGlow: string;
  // Safe
  safeTop: string;
  safeFront: string;
  safeLeft: string;
  safeHandle: string;
  safeHandleInner: string;
  // Chair
  chairBack: string;
  chairTop: string;
  // Desk
  deskTop: string;
  deskFront: string;
  deskLeft: string;
  // Objects
  folder: string;
  folderTab: string;
  monitorScreen: string;
  monitorGlow: string;
  // Plant
  plantPot: string;
  plantLeaf: string;
  plantLeaf2: string;
  plantLeafTop: string;
  // Exterior building
  extBuildingBody: string;
  extBuildingAccent: string;
  extWindowGlow: string;
  extDoor: string;
  extDoorTrim: string;
  extSky1: string;
  extSky2: string;
  extGround: string;
  extGroundLine: string;
};

export const OFFICE_THEMES: Record<'hitech' | 'classic' | 'loft', OfficeStyleTheme> = {
  hitech: {
    bg: '#070C18',
    leftWall: '#0A1020',
    rightWall: '#0C1325',
    floor: '#0F1830',
    floorLine: '#162240',
    trim: '#1A3560',
    ceilingGlow: '#00AAFF',
    boardBg: '#0A2040',
    boardSurface: '#041530',
    boardText: '#00CCFF',
    windowFrame: '#162840',
    windowGlass: '#0A1F60',
    windowGlow: '#0080FF',
    safeTop: '#1A2235',
    safeFront: '#0E1828',
    safeLeft: '#080F1A',
    safeHandle: '#00AAFF',
    safeHandleInner: '#004A90',
    chairBack: '#162840',
    chairTop: '#1A3055',
    deskTop: '#152040',
    deskFront: '#0C1830',
    deskLeft: '#081225',
    folder: '#162D5A',
    folderTab: '#1E3D70',
    monitorScreen: '#0050E8',
    monitorGlow: '#0080FF',
    plantPot: '#18183A',
    plantLeaf: '#083828',
    plantLeaf2: '#063020',
    plantLeafTop: '#0A4A30',
    extBuildingBody: '#0C1525',
    extBuildingAccent: '#002244',
    extWindowGlow: '#0070FF',
    extDoor: '#0A1830',
    extDoorTrim: '#00AAFF',
    extSky1: '#020810',
    extSky2: '#0A1830',
    extGround: '#0C1825',
    extGroundLine: '#162840',
  },
  classic: {
    bg: '#1A0E08',
    leftWall: '#2C1A0E',
    rightWall: '#321E10',
    floor: '#3C2818',
    floorLine: '#4A3525',
    trim: '#C4A040',
    ceilingGlow: '#C4A040',
    boardBg: '#2A1A08',
    boardSurface: '#1A0F06',
    boardText: '#EFE8C0',
    windowFrame: '#4A3020',
    windowGlass: '#2A5055',
    windowGlow: '#80C0A0',
    safeTop: '#2C1A0A',
    safeFront: '#1E1008',
    safeLeft: '#170C06',
    safeHandle: '#C4A040',
    safeHandleInner: '#8A6820',
    chairBack: '#4A2A15',
    chairTop: '#5C3A22',
    deskTop: '#6A4228',
    deskFront: '#522A15',
    deskLeft: '#3D2010',
    folder: '#8A6030',
    folderTab: '#A07840',
    monitorScreen: '#2A4030',
    monitorGlow: '#608060',
    plantPot: '#5A3A20',
    plantLeaf: '#1C3C18',
    plantLeaf2: '#163010',
    plantLeafTop: '#224820',
    extBuildingBody: '#C8B890',
    extBuildingAccent: '#A89070',
    extWindowGlow: '#F0D070',
    extDoor: '#5A3A20',
    extDoorTrim: '#C4A040',
    extSky1: '#1A1028',
    extSky2: '#2C1A3A',
    extGround: '#5A4A30',
    extGroundLine: '#4A3A20',
  },
  loft: {
    bg: '#181818',
    leftWall: '#282828',
    rightWall: '#2E2E2E',
    floor: '#C0B098',
    floorLine: '#AE9E88',
    trim: '#2A2A2A',
    ceilingGlow: '#D47340',
    boardBg: '#1A1A1A',
    boardSurface: '#F0F0E8',
    boardText: '#2A2A2A',
    windowFrame: '#3A3A3A',
    windowGlass: '#506878',
    windowGlow: '#88AAC0',
    safeTop: '#2A2A2A',
    safeFront: '#1E1E1E',
    safeLeft: '#161616',
    safeHandle: '#D4734050',
    safeHandleInner: '#888888',
    chairBack: '#4A3A28',
    chairTop: '#5C4A32',
    deskTop: '#C09870',
    deskFront: '#A07C55',
    deskLeft: '#886845',
    folder: '#D8B88A',
    folderTab: '#C8A87A',
    monitorScreen: '#2A3A5A',
    monitorGlow: '#4888AA',
    plantPot: '#6A3A20',
    plantLeaf: '#2C4C22',
    plantLeaf2: '#20401A',
    plantLeafTop: '#345828',
    extBuildingBody: '#7A5040',
    extBuildingAccent: '#5A3830',
    extWindowGlow: '#F09040',
    extDoor: '#3A2A20',
    extDoorTrim: '#D47340',
    extSky1: '#0E1218',
    extSky2: '#1A2028',
    extGround: '#3A3020',
    extGroundLine: '#2A2018',
  },
};

// Avatar definitions
export const AVATARS = [
  { id: 'ceo' as const, label: 'CEO', color: '#1A3A6A', accent: '#4A8FCC', icon: 'briefcase' },
  { id: 'strategist' as const, label: 'Strategist', color: '#3A1A5A', accent: '#9A50CC', icon: 'telescope' },
  { id: 'techie' as const, label: 'Tech Wizard', color: '#0A3A3A', accent: '#20AAAA', icon: 'laptop' },
  { id: 'creative' as const, label: 'Creative', color: '#5A2A0A', accent: '#E8742A', icon: 'color-palette' },
  { id: 'diplomat' as const, label: 'Diplomat', color: '#2A3A2A', accent: '#60A860', icon: 'globe' },
  { id: 'innovator' as const, label: 'Innovator', color: '#4A3A0A', accent: '#E0A820', icon: 'bulb' },
] as const;

export type AvatarId = typeof AVATARS[number]['id'];

export default colors;
