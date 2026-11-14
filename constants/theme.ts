import type { TextStyle, ViewStyle } from 'react-native';

/** Familias cargadas en `app/_layout.tsx`. */
export const FONTS = {
  regular: 'Nunito_400Regular',
  medium: 'Nunito_600SemiBold',
  semibold: 'Quicksand_600SemiBold',
  bold: 'Quicksand_700Bold',
} as const;

export const RADIUS = {
  sm: 14,
  md: 20,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

export const SHADOWS: Record<'soft' | 'card' | 'button', ViewStyle> = {
  soft: {
    shadowColor: '#4A3531',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  card: {
    shadowColor: '#4A3531',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 4,
  },
  button: {
    shadowColor: '#FF8FA3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 6,
  },
};

export const TYPE = {
  display: { fontFamily: FONTS.bold, fontSize: 30, color: '#4A3531' } as TextStyle,
  title: { fontFamily: FONTS.bold, fontSize: 22, color: '#4A3531' } as TextStyle,
  subtitle: { fontFamily: FONTS.semibold, fontSize: 17, color: '#4A3531' } as TextStyle,
  body: { fontFamily: FONTS.regular, fontSize: 14, color: '#4A3531' } as TextStyle,
  caption: { fontFamily: FONTS.regular, fontSize: 12, color: '#8A6F68' } as TextStyle,
  label: { fontFamily: FONTS.medium, fontSize: 13, color: '#8A6F68' } as TextStyle,
} as const;
