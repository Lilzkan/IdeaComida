import { StyleSheet, Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/theme';

type Weight = TextStyle['fontWeight'];

/**
 * Infiere la familia redondeada a partir del `fontWeight` que ya usaban las
 * pantallas, así la migración no obliga a reescribir cada estilo.
 */
function fontFamilyFor(weight: Weight): string {
  switch (weight) {
    case '900':
    case '800':
    case '700':
    case 'bold':
      return FONTS.bold;
    case '600':
    case '500':
      return FONTS.semibold;
    default:
      return FONTS.regular;
  }
}

export default function Text({ style, ...rest }: TextProps) {
  const flattened = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  const fontFamily = flattened.fontFamily ?? fontFamilyFor(flattened.fontWeight);

  // Quitamos fontWeight: con fuentes personalizadas puede provocar negritas
  // sintéticas o fallbacks del sistema en Android.
  const { fontWeight: _fontWeight, ...cleanStyle } = flattened;

  return <RNText {...rest} style={[styles.base, cleanStyle, { fontFamily }]} />;
}

const styles = StyleSheet.create({
  base: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.regular,
  },
});
