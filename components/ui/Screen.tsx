import type { ReactElement, ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type RefreshControlProps,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import DecorBackground from './DecorBackground';
import { COLORS } from '@/constants/colors';

type ScreenProps = {
  children: ReactNode;
  /** Envuelve el contenido en un ScrollView vertical. */
  scroll?: boolean;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  refreshControl?: ReactElement<RefreshControlProps>;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
  /** Elementos flotantes (FAB, banners) fuera del scroll. */
  overlay?: ReactNode;
};

/**
 * Contenedor base de todas las pantallas: área segura, fondo crema con
 * decoración y scroll opcional.
 */
export default function Screen({
  children,
  scroll = false,
  edges = ['top'],
  style,
  contentContainerStyle,
  refreshControl,
  keyboardShouldPersistTaps,
  overlay,
}: ScreenProps) {
  return (
    <SafeAreaView style={[styles.safe, style]} edges={edges}>
      <DecorBackground />

      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          contentContainerStyle={contentContainerStyle}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={styles.fill}>{children}</View>
      )}

      {overlay}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  fill: { flex: 1 },
});
