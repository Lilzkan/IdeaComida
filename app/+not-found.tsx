import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import Screen from '@/components/ui/Screen';
import Text from '@/components/ui/Text';
import { COLORS } from '@/constants/colors';
import { FONTS, RADIUS, SHADOWS } from '@/constants/theme';

export default function NotFound() {
  return (
    <Screen contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.content}>
        <View style={styles.bubble}>
          <Text style={styles.emoji}>🍔</Text>
        </View>
        <Text style={styles.title}>Pantalla no encontrada</Text>
        <Text style={styles.text}>
          Parece que este plato no está en el menú. ¿Volvemos a lo seguro?
        </Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Volver al inicio</Text>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  bubble: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primarySoft,
    marginBottom: 16,
    ...SHADOWS.soft,
  },
  emoji: { fontSize: 50 },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  text: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  link: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: RADIUS.pill,
    ...SHADOWS.button,
  },
  linkText: {
    color: COLORS.textOnPrimary,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
});
