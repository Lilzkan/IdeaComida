import { useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, X } from 'lucide-react-native';

import BouncyPressable from './ui/BouncyPressable';
import Text from './ui/Text';
import { COLORS } from '@/constants/colors';
import { FONTS, RADIUS, SHADOWS } from '@/constants/theme';
import type { Brand } from '@/constants/brands';

type BrandSwipeDeckProps = {
  brands: Brand[];
  onChoose: (brand: Brand) => void;
  onSkip?: (brand: Brand) => void;
};

const SWIPE_THRESHOLD = 110;

/**
 * Mazo de tarjetas de marcas. Desliza a la derecha para elegir o a la
 * izquierda para pasar; también funcionan los botones de abajo.
 */
export default function BrandSwipeDeck({ brands, onChoose, onSkip }: BrandSwipeDeckProps) {
  const [order, setOrder] = useState(() => brands.map((brand) => brand.id));
  const position = useRef(new Animated.ValueXY()).current;
  const animating = useRef(false);

  const byId = useMemo(() => new Map(brands.map((brand) => [brand.id, brand])), [brands]);
  const topBrand = byId.get(order[0] ?? '') ?? brands[0] ?? null;

  const topBrandRef = useRef<Brand | null>(topBrand);
  topBrandRef.current = topBrand;

  const fling = (direction: 1 | -1) => {
    if (animating.current || !topBrandRef.current) return;
    animating.current = true;

    Animated.timing(position, {
      toValue: { x: direction * 460, y: 32 },
      duration: 260,
      useNativeDriver: false,
    }).start(() => {
      const brand = topBrandRef.current;
      position.setValue({ x: 0, y: 0 });
      animating.current = false;
      if (!brand) return;

      if (direction === 1) {
        onChoose(brand);
      } else {
        setOrder((prev) => [...prev.slice(1), prev[0]]);
        onSkip?.(brand);
      }
    });
  };

  const springBack = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
      friction: 6,
      tension: 140,
    }).start();
  };

  const releaseRef = useRef<(dx: number) => void>(() => undefined);
  releaseRef.current = (dx) => {
    if (dx > SWIPE_THRESHOLD) fling(1);
    else if (dx < -SWIPE_THRESHOLD) fling(-1);
    else springBack();
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) =>
          Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_event, gesture) => releaseRef.current(gesture.dx),
        onPanResponderTerminate: () => springBack(),
      }),
    [position]
  );

  const rotate = position.x.interpolate({
    inputRange: [-320, 0, 320],
    outputRange: ['-16deg', '0deg', '16deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  if (!topBrand) {
    return (
      <View style={styles.empty}>
        <Text style={{ fontSize: 34 }}>🍽️</Text>
        <Text style={styles.emptyText}>No hay marcas para mostrar.</Text>
      </View>
    );
  }

  const visible = order.slice(0, 3);

  return (
    <View style={styles.container}>
      <View style={styles.deck}>
        {visible.map((id, index) => {
          const brand = byId.get(id);
          if (!brand) return null;

          const isTop = index === 0;

          return (
            <Animated.View
              key={id}
              pointerEvents={isTop ? 'auto' : 'none'}
              {...(isTop ? panResponder.panHandlers : {})}
              style={[
                styles.card,
                SHADOWS.card,
                {
                  top: index * 11,
                  zIndex: 30 - index,
                  opacity: 1 - index * 0.12,
                  transform: isTop
                    ? [
                        { translateX: position.x },
                        { translateY: position.y },
                        { rotate },
                      ]
                    : [{ scale: 1 - index * 0.045 }],
                },
              ]}
            >
              <LinearGradient
                colors={[`${brand.color}30`, COLORS.surface, COLORS.surfaceAlt]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardInner}
              >
                <View style={styles.cardBadge}>
                  <Text style={styles.cardBadgeText}>{brand.treat} antojo</Text>
                </View>

                <Text style={styles.cardEmoji}>{brand.emoji}</Text>
                <Text style={styles.cardName}>{brand.name}</Text>
                <Text style={styles.cardItems} numberOfLines={2}>
                  {brand.items.slice(0, 3).join(' · ')}
                </Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.cardHint}>Desliza para elegir</Text>
                  <Text style={{ fontSize: 16 }}>💗</Text>
                </View>

                {isTop && (
                  <>
                    <Animated.View style={[styles.stamp, styles.stampLike, { opacity: likeOpacity }]}>
                      <Text style={styles.stampLikeText}>¡SÍ!</Text>
                    </Animated.View>
                    <Animated.View style={[styles.stamp, styles.stampNope, { opacity: nopeOpacity }]}>
                      <Text style={styles.stampNopeText}>PASO</Text>
                    </Animated.View>
                  </>
                )}
              </LinearGradient>
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.actions}>
        <BouncyPressable
          onPress={() => fling(-1)}
          haptic
          accessibilityRole="button"
          accessibilityLabel="Pasar esta marca"
          style={[styles.actionButton, styles.skipButton]}
        >
          <X size={26} color={COLORS.textSecondary} />
        </BouncyPressable>

        <BouncyPressable
          onPress={() => fling(1)}
          haptic
          accessibilityRole="button"
          accessibilityLabel={`Elegir ${topBrand.name}`}
          style={[styles.actionButton, styles.chooseButton]}
        >
          <Heart size={26} color={COLORS.textOnPrimary} fill={COLORS.textOnPrimary} />
        </BouncyPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingHorizontal: 20 },
  deck: { width: '100%', height: 382 },
  card: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 352,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
  },
  cardInner: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: `${COLORS.white}B8`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
  },
  cardBadgeText: {
    fontFamily: FONTS.semibold,
    fontSize: 11,
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
  },
  cardEmoji: { fontSize: 74, marginBottom: 8 },
  cardName: {
    fontFamily: FONTS.bold,
    fontSize: 26,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  cardItems: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  cardFooter: {
    position: 'absolute',
    bottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardHint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: FONTS.semibold,
  },
  stamp: {
    position: 'absolute',
    top: 42,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 3,
    transform: [{ rotate: '-10deg' }],
  },
  stampLike: {
    left: 22,
    borderColor: COLORS.success,
    backgroundColor: `${COLORS.success}22`,
  },
  stampLikeText: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.success,
    letterSpacing: 1,
  },
  stampNope: {
    right: 22,
    borderColor: COLORS.danger,
    backgroundColor: `${COLORS.danger}20`,
    transform: [{ rotate: '10deg' }],
  },
  stampNopeText: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.danger,
    letterSpacing: 1,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 22, marginTop: 4 },
  actionButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  chooseButton: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.button,
  },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 40 },
  emptyText: { color: COLORS.textSecondary, fontSize: 14 },
});
