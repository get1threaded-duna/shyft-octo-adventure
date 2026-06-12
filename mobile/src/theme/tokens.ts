import { StyleSheet } from 'react-native';

export const colors = {
  background: '#000000',
  surface1: '#111111',
  surface2: '#1c1c1e',
  surface3: '#2c2c2e',
  primary: '#0052FF',
  primaryMuted: 'rgba(0,82,255,0.15)',
  textPrimary: '#FFFFFF',
  textSecondary: '#8A8A8A',
  textTertiary: '#3D3D3D',
  positive: '#05B169',
  positiveMuted: 'rgba(5,177,105,0.15)',
  negative: '#F42E2E',
  negativeMuted: 'rgba(244,46,46,0.15)',
  warning: '#F0B429',
  warningMuted: 'rgba(240,180,41,0.15)',
  divider: '#2c2c2e',
  overlay: 'rgba(0,0,0,0.7)',
  tabBarBg: '#111111',
  tabBarBorder: '#2c2c2e',
} as const;

export const typography = {
  heroBalance: { fontSize: 44, fontWeight: '700' as const, letterSpacing: -1.5, color: colors.textPrimary },
  screenTitle: { fontSize: 20, fontWeight: '700' as const, color: colors.textPrimary },
  sectionHeader: { fontSize: 16, fontWeight: '600' as const, color: colors.textPrimary },
  assetName: { fontSize: 16, fontWeight: '600' as const, color: colors.textPrimary },
  assetTicker: { fontSize: 14, fontWeight: '400' as const, color: colors.textSecondary },
  price: { fontSize: 16, fontWeight: '600' as const, color: colors.textPrimary },
  priceChange: { fontSize: 14, fontWeight: '500' as const },
  body: { fontSize: 14, fontWeight: '400' as const, color: colors.textPrimary },
  caption: { fontSize: 12, fontWeight: '400' as const, color: colors.textSecondary },
  tabLabel: { fontSize: 10, fontWeight: '500' as const },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  screen: 16,
  card: 16,
  sectionGap: 24,
  assetRowHeight: 72,
} as const;

export const radii = {
  sm: 8,
  card: 12,
  button: 12,
  pill: 100,
  bottomSheet: 20,
  input: 12,
  avatar: 100,
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomSheet: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 16,
  },
} as const;

export const tokens = { colors, typography, spacing, radii, shadows };
export default tokens;
