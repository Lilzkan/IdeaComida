import { useRef, type ReactNode } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type BouncyPressableProps = Omit<PressableProps, 'style'> & {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Cuánto se encoge al presionar (0.9–1). */
  scaleTo?: number;
  /** Vibración corta al tocar. */
  haptic?: boolean;
};

/**
 * Pressable con animación de rebote y feedback táctil.
 * Todas las tarjetas y botones de la app lo usan para sentirse "suaves".
 */
export default function BouncyPressable({
  children,
  style,
  scaleTo = 0.96,
  haptic = false,
  disabled,
  onPressIn,
  onPressOut,
  onPress,
  ...rest
}: BouncyPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      friction: 6,
      tension: 220,
    }).start();
  };

  const handlePressIn = (event: GestureResponderEvent) => {
    animateTo(scaleTo);
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    animateTo(1);
    onPressOut?.(event);
  };

  const handlePress = (event: GestureResponderEvent) => {
    if (haptic && Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }
    onPress?.(event);
  };

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[style, { transform: [{ scale }], opacity: disabled ? 0.55 : 1 }]}
    >
      {children}
    </AnimatedPressable>
  );
}
