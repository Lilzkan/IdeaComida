import { useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Heart, Sparkles } from 'lucide-react-native';

import Button from './ui/Button';
import Text from './ui/Text';
import { COLORS } from '@/constants/colors';
import { FONTS, SHADOWS } from '@/constants/theme';
import type { Brand } from '@/constants/brands';

const SEGMENT_COLORS = [
  COLORS.peach,
  COLORS.butter,
  COLORS.sky,
  COLORS.mint,
  COLORS.lilac,
  COLORS.primarySoft,
  COLORS.surfaceWarm,
  COLORS.surfaceAlt,
];

type BrandWheelProps = {
  brands: Brand[];
  /** Permite elegir con la misma lógica ponderada de la app. */
  pick?: () => Brand;
  onResult: (brand: Brand) => void;
  size?: number;
};

/**
 * Ruleta pastel con 8 marcas. Gira, aterriza en la marca elegida y devuelve
 * el resultado con una animación suave.
 */
export default function BrandWheel({ brands, pick, onResult, size }: BrandWheelProps) {
  const { width } = useWindowDimensions();
  const wheelSize = Math.min(size ?? 286, width - 64);
  const center = wheelSize / 2;
  const radius = center - 8;
  const segmentAngle = brands.length > 0 ? 360 / brands.length : 360;

  const angle = useRef(new Animated.Value(0)).current;
  const totalRotation = useRef(0);
  const [spinning, setSpinning] = useState(false);

  const rotation = angle.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'extend',
  });

  const pointAt = (degrees: number) => {
    const radians = (degrees * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(radians),
      y: center + radius * Math.sin(radians),
    };
  };

  const wedgePath = (index: number) => {
    const start = index * segmentAngle - 90;
    const end = (index + 1) * segmentAngle - 90;
    const p1 = pointAt(start);
    const p2 = pointAt(end);
    const largeArc = segmentAngle > 180 ? 1 : 0;
    return `M ${center} ${center} L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} Z`;
  };

  const spin = () => {
    if (spinning || brands.length === 0) return;

    const chosen = pick ? pick() : brands[Math.floor(Math.random() * brands.length)];
    const index = Math.max(
      0,
      brands.findIndex((brand) => brand.id === chosen.id)
    );

    const chosenCenter = index * segmentAngle + segmentAngle / 2;
    const current = totalRotation.current;
    const currentMod = ((current % 360) + 360) % 360;
    const targetMod = (360 - (chosenCenter % 360)) % 360;
    const delta = (targetMod - currentMod + 360) % 360;
    const jitter = (Math.random() - 0.5) * segmentAngle * 0.3;
    const target = current + 360 * 5 + delta + jitter;

    totalRotation.current = target;
    setSpinning(true);

    Animated.timing(angle, {
      toValue: target,
      duration: 2300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setSpinning(false);
      onResult(chosen);
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.wheelWrap, { width: wheelSize, height: wheelSize }]}>
        <Animated.View
          style={[
            styles.ring,
            SHADOWS.card,
            {
              width: wheelSize,
              height: wheelSize,
              borderRadius: wheelSize / 2,
              transform: [{ rotate: rotation }],
            },
          ]}
        >
          <Svg width={wheelSize} height={wheelSize}>
            <Circle cx={center} cy={center} r={radius + 6} fill={COLORS.white} />
            {brands.map((brand, index) => (
              <Path
                key={brand.id}
                d={wedgePath(index)}
                fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]}
                stroke={COLORS.white}
                strokeWidth={2}
              />
            ))}
            <Circle cx={center} cy={center} r={radius * 0.42} fill={COLORS.white} />
          </Svg>

          {brands.map((brand, index) => {
            const mid = index * segmentAngle + segmentAngle / 2 - 90;
            const radians = (mid * Math.PI) / 180;
            const distance = radius * 0.68;
            const x = center + distance * Math.cos(radians);
            const y = center + distance * Math.sin(radians);

            return (
              <View
                key={brand.id}
                pointerEvents="none"
                style={[styles.emojiSlot, { left: x - 18, top: y - 18 }]}
              >
                <Text style={styles.emoji}>{brand.emoji}</Text>
              </View>
            );
          })}
        </Animated.View>

        <View
          pointerEvents="none"
          style={[styles.hub, { left: center - 39, top: center - 39 }]}
        >
          <Heart size={22} color={COLORS.primary} fill={COLORS.primary} />
          <Text style={styles.hubText}>{spinning ? '...' : 'amor'}</Text>
        </View>

        <View pointerEvents="none" style={[styles.pointer, { left: center - 12 }]} />
      </View>

      <Button
        label={spinning ? 'Girando…' : '¡Girar la ruleta!'}
        onPress={spin}
        loading={spinning}
        icon={<Sparkles size={18} color={COLORS.textOnPrimary} />}
        style={styles.spinButton}
      />
      <Text style={styles.hint}>
        {spinning ? 'Que el destino decida por ustedes 💫' : 'Una marca al azar, cero peleas 💗'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingHorizontal: 20 },
  wheelWrap: { alignItems: 'center', justifyContent: 'center' },
  ring: {
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  emojiSlot: {
    position: 'absolute',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 23 },
  hub: {
    position: 'absolute',
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: COLORS.white,
    borderWidth: 3,
    borderColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    ...SHADOWS.soft,
  },
  hubText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.primary,
    letterSpacing: 0.4,
  },
  pointer: {
    position: 'absolute',
    top: -9,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 22,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.primary,
  },
  spinButton: { marginTop: 26, width: '100%' },
  hint: {
    marginTop: 10,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
