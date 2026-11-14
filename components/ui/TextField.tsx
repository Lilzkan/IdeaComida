import { useState, type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import Text from './Text';
import { COLORS } from '@/constants/colors';
import { FONTS, RADIUS } from '@/constants/theme';

type TextFieldProps = TextInputProps & {
  label: string;
  icon: ReactNode;
  /** Elemento a la derecha (por ejemplo, mostrar/ocultar contraseña). */
  right?: ReactNode;
  /** Borde coral cuando el campo tiene el foco. */
  highlightOnFocus?: boolean;
};

/** Campo de texto redondeado con etiqueta e icono, estilo cute. */
export default function TextField({
  label,
  icon,
  right,
  highlightOnFocus = true,
  onFocus,
  onBlur,
  style,
  ...rest
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {focused ? <Text style={styles.labelEmoji}>💗</Text> : null}
      </View>

      <View style={[styles.field, focused && highlightOnFocus && styles.fieldFocused]}>
        <View style={styles.icon}>{icon}</View>
        <TextInput
          {...rest}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[styles.input, style]}
          placeholderTextColor={COLORS.textSecondary}
        />
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  label: {
    fontFamily: FONTS.semibold,
    fontSize: 11.5,
    color: COLORS.textSecondary,
    letterSpacing: 0.2,
  },
  labelEmoji: { fontSize: 10 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    paddingHorizontal: 13,
  },
  fieldFocused: { borderColor: COLORS.primary },
  icon: { width: 22, alignItems: 'flex-start' },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    paddingVertical: 13,
    paddingHorizontal: 4,
    fontFamily: FONTS.regular,
    fontSize: 14.5,
  },
  right: { paddingLeft: 6 },
});
