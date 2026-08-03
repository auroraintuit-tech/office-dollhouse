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
    bg: '#E8F0F8',
    leftWall: '#D2E2F0',
    rightWall: '#DEEAF6',
    floor: '#EFF4F9',
    floorLine: '#C9D8E6',
    trim: '#7FA8C9',
    ceilingGlow: '#3B82F6',
    boardBg: '#B8CEE2',
    boardSurface: '#FFFFFF',
    boardText: '#3B82F6',
    windowFrame: '#A8C2DA',
    windowGlass: '#BFE0F5',
    windowGlow: '#FFD980',
    safeTop: '#C2D2E2',
    safeFront: '#A9BDD1',
    safeLeft: '#93A9BF',
    safeHandle: '#3B82F6',
    safeHandleInner: '#1E5CC0',
    chairBack: '#8FB0CE',
    chairTop: '#A5C2DC',
    deskTop: '#F7FAFD',
    deskFront: '#D6E2ED',
    deskLeft: '#BFCEDC',
    folder: '#5B9BD5',
    folderTab: '#3B82F6',
    monitorScreen: '#1E293B',
    monitorGlow: '#60A5FA',
    plantPot: '#C8D8E4',
    plantLeaf: '#3E9B63',
    plantLeaf2: '#2F8551',
    plantLeafTop: '#54B478',
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
    bg: '#F7F0E1',
    leftWall: '#EBDFC6',
    rightWall: '#F2E8D2',
    floor: '#DDBE90',
    floorLine: '#C9A878',
    trim: '#B08850',
    ceilingGlow: '#E2B04A',
    boardBg: '#8A6844',
    boardSurface: '#FDF8EC',
    boardText: '#6B4E2E',
    windowFrame: '#A9885E',
    windowGlass: '#CBE6F2',
    windowGlow: '#FFD980',
    safeTop: '#7E6242',
    safeFront: '#6A5138',
    safeLeft: '#57422D',
    safeHandle: '#E2B04A',
    safeHandleInner: '#B08850',
    chairBack: '#9C6B3E',
    chairTop: '#B58353',
    deskTop: '#C89A64',
    deskFront: '#A97E4E',
    deskLeft: '#8F6940',
    folder: '#C0392B',
    folderTab: '#D35445',
    monitorScreen: '#22303C',
    monitorGlow: '#7FB8D8',
    plantPot: '#B0713F',
    plantLeaf: '#4C8A3E',
    plantLeaf2: '#3D7531',
    plantLeafTop: '#61A251',
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
    bg: '#F4EEE6',
    leftWall: '#E4D5C4',
    rightWall: '#EEE2D2',
    floor: '#DCC5A4',
    floorLine: '#C7AE8C',
    trim: '#C4693B',
    ceilingGlow: '#E07840',
    boardBg: '#4A4A48',
    boardSurface: '#FAFAF4',
    boardText: '#3A3A38',
    windowFrame: '#5A5A56',
    windowGlass: '#C6E2EE',
    windowGlow: '#FFCF70',
    safeTop: '#6E6E6A',
    safeFront: '#5B5B57',
    safeLeft: '#484844',
    safeHandle: '#E07840',
    safeHandleInner: '#B05528',
    chairBack: '#8A6A4A',
    chairTop: '#A5825E',
    deskTop: '#D2A878',
    deskFront: '#B58C5E',
    deskLeft: '#997248',
    folder: '#E07840',
    folderTab: '#C4693B',
    monitorScreen: '#26323E',
    monitorGlow: '#68A8C8',
    plantPot: '#A65A32',
    plantLeaf: '#4E8C40',
    plantLeaf2: '#3F7833',
    plantLeafTop: '#63A455',
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
