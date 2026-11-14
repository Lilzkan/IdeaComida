import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Heart, Layers, Link2, Sparkles } from 'lucide-react-native';

import BrandSwipeDeck from '@/components/BrandSwipeDeck';
import BrandWheel from '@/components/BrandWheel';
import StarRating from '@/components/StarRating';
import BouncyPressable from '@/components/ui/BouncyPressable';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import Text from '@/components/ui/Text';
import { COLORS } from '@/constants/colors';
import { BRANDS, type Brand, type Meal } from '@/constants/brands';
import { FONTS, RADIUS, SHADOWS } from '@/constants/theme';
import { useMeals } from '@/hooks/useMeals';
import { useRefresh } from '@/hooks/useRefresh';
import { daysSince, timeAgo } from '@/lib/format';
import { useStore } from '@/store/useStore';

type BrandStats = {
  count: number;
  avgRating: number;
  lastEaten: string;
};

const COOLDOWN_DAYS = 3;

function buildStats(meals: Meal[]): Record<string, BrandStats> {
  const accumulator: Record<
    string,
    { count: number; ratingSum: number; ratingCount: number; lastEaten: string }
  > = {};

  for (const meal of meals) {
    const current = (accumulator[meal.brand_id] ??= {
      count: 0,
      ratingSum: 0,
      ratingCount: 0,
      lastEaten: meal.eaten_at,
    });

    current.count += 1;
    if (meal.rating && meal.rating > 0) {
      current.ratingSum += meal.rating;
      current.ratingCount += 1;
    }
    if (new Date(meal.eaten_at).getTime() > new Date(current.lastEaten).getTime()) {
      current.lastEaten = meal.eaten_at;
    }
  }

  const stats: Record<string, BrandStats> = {};
  for (const [brandId, value] of Object.entries(accumulator)) {
    stats[brandId] = {
      count: value.count,
      avgRating: value.ratingCount > 0 ? value.ratingSum / value.ratingCount : 0,
      lastEaten: value.lastEaten,
    };
  }
  return stats;
}

type ModeButtonProps = {
  active: boolean;
  label: string;
  icon: ReactNode;
  onPress: () => void;
};

function ModeButton({ active, label, icon, onPress }: ModeButtonProps) {
  return (
    <BouncyPressable
      onPress={onPress}
      haptic
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.modeButton, active && styles.modeButtonActive]}
    >
      {icon}
      <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>{label}</Text>
    </BouncyPressable>
  );
}

export default function Home() {
  const router = useRouter();
  const profile = useStore((state) => state.profile);

  const [mode, setMode] = useState<'wheel' | 'cards'>('wheel');
  const [suggested, setSuggested] = useState<Brand | null>(null);

  const { data: meals = [], isLoading, refetch } = useMeals(profile?.couple_id);
  const { refreshing, onRefresh } = useRefresh(refetch);
  const brandStats = useMemo(() => buildStats(meals), [meals]);

  const greetingName = useMemo(() => {
    const name = profile?.name?.trim();
    return name ? name.split(' ')[0] : 'pareja';
  }, [profile?.name]);

  const initial = useMemo(() => {
    const name = profile?.name?.trim();
    return name ? name.charAt(0).toUpperCase() : '💗';
  }, [profile?.name]);

  /** Elección ponderada: evita repetir marcas recientes y premia las mejor calificadas. */
  const pickWeighted = useCallback((): Brand => {
    const weighted = BRANDS.map((brand) => {
      const stats = brandStats[brand.id];
      const days = stats ? daysSince(stats.lastEaten) : 999;
      const inCooldown = days < COOLDOWN_DAYS;
      const weight = inCooldown
        ? 0
        : 1 + (stats?.avgRating ?? 0) + Math.min(days, 30) / 10;
      return { brand, weight };
    });

    const candidates = weighted.filter((entry) => entry.weight > 0);
    const pool = candidates.length > 0 ? candidates : BRANDS.map((brand) => ({ brand, weight: 1 }));
    const total = pool.reduce((sum, entry) => sum + entry.weight, 0);
    let random = Math.random() * total;
    let chosen = pool[0]!.brand;

    for (const entry of pool) {
      random -= entry.weight;
      if (random <= 0) {
        chosen = entry.brand;
        break;
      }
    }
    return chosen;
  }, [brandStats]);

  const suggestionReason = useMemo(() => {
    if (!suggested) return '';
    const stats = brandStats[suggested.id];
    if (!stats) return 'Todavía no lo han probado juntos. ¡Primera vez!';
    const days = Math.round(daysSince(stats.lastEaten));
    if (days <= 1) return 'La última vez fue hoy mismo. Sin juicio 💗';
    return `La última vez fue hace ${days} días.`;
  }, [suggested, brandStats]);

  const goToBrand = (brand: Brand) => {
    router.push({ pathname: '/marca/[id]', params: { id: brand.id } });
  };

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Preparando antojitos…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void onRefresh()}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hello}>Hola, {greetingName} 💗</Text>
          <Text style={styles.headerTitle}>¿Qué comemos hoy?</Text>
          <Text style={styles.headerSub}>Cero peleas, muchos antojos.</Text>
        </View>
        <BouncyPressable
          onPress={() => router.push('/perfil')}
          haptic
          accessibilityRole="button"
          accessibilityLabel="Ir a mi perfil"
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{initial}</Text>
        </BouncyPressable>
      </View>

      {!profile?.couple_id && (
        <BouncyPressable
          onPress={() => router.push('/pareja')}
          haptic
          accessibilityRole="button"
          accessibilityLabel="Vincular pareja"
          style={styles.coupleBanner}
        >
          <View style={styles.bannerIcon}>
            <Link2 size={19} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Vincula a tu pareja</Text>
            <Text style={styles.bannerText}>
              Creen un código y compartan el historial de comidas.
            </Text>
          </View>
          <ChevronRight size={18} color={COLORS.primary} />
        </BouncyPressable>
      )}

      <View style={styles.modeSwitch}>
        <ModeButton
          active={mode === 'wheel'}
          label="Ruleta"
          icon={<Sparkles size={16} color={mode === 'wheel' ? COLORS.primary : COLORS.textSecondary} />}
          onPress={() => setMode('wheel')}
        />
        <ModeButton
          active={mode === 'cards'}
          label="Cartas"
          icon={<Layers size={16} color={mode === 'cards' ? COLORS.primary : COLORS.textSecondary} />}
          onPress={() => setMode('cards')}
        />
      </View>

      {mode === 'wheel' ? (
        <>
          <BrandWheel brands={BRANDS} pick={pickWeighted} onResult={setSuggested} />

          {suggested && (
            <View style={[styles.resultCard, SHADOWS.card]}>
              <View style={styles.resultTop}>
                <View
                  style={[styles.resultEmoji, { backgroundColor: `${suggested.color}24` }]}
                >
                  <Text style={{ fontSize: 42 }}>{suggested.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultKicker}>¡Hoy toca!</Text>
                  <Text style={styles.resultName}>{suggested.name}</Text>
                  <Text style={styles.resultReason}>
                    {suggested.items[0]} suena delicioso. {suggestionReason}
                  </Text>
                </View>
              </View>

              <View style={styles.resultActions}>
                <Button
                  label="Ver menú"
                  onPress={() => goToBrand(suggested)}
                  fullWidth={false}
                  style={{ flex: 1 }}
                />
                <Button
                  label="Otra idea"
                  variant="soft"
                  onPress={() => setSuggested(null)}
                  fullWidth={false}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          )}
        </>
      ) : (
        <>
          <BrandSwipeDeck brands={BRANDS} onChoose={goToBrand} />
          <Text style={styles.deckHint}>
            Desliza a la derecha para elegir o a la izquierda para pasar 💫
          </Text>
        </>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Todos los antojos</Text>
        <Text style={styles.sectionEmoji}>🍟</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalContent}
      >
        {BRANDS.map((brand) => {
          const stats = brandStats[brand.id];
          return (
            <BouncyPressable
              key={brand.id}
              onPress={() => goToBrand(brand)}
              haptic
              accessibilityRole="button"
              accessibilityLabel={`Ver ${brand.name}`}
              style={[styles.brandCard, { backgroundColor: `${brand.color}1C` }]}
            >
              <View style={[styles.brandEmojiBubble, { backgroundColor: `${brand.color}26` }]}>
                <Text style={styles.brandEmoji}>{brand.emoji}</Text>
              </View>
              <Text style={styles.brandName} numberOfLines={1}>
                {brand.name}
              </Text>
              <Text style={styles.brandTreat} numberOfLines={1}>
                {brand.treat} {brand.items[0]}
              </Text>
              {stats && stats.avgRating > 0 ? (
                <View style={styles.ratingRow}>
                  <StarRating value={stats.avgRating} size={11} readOnly />
                  <Text style={styles.ratingValue}>{stats.avgRating.toFixed(1)}</Text>
                </View>
              ) : (
                <Text style={styles.ratingEmpty}>sin probar</Text>
              )}
            </BouncyPressable>
          );
        })}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Últimos antojos</Text>
        {meals.length > 0 && (
          <BouncyPressable onPress={() => router.push('/historial')} haptic scaleTo={0.94}>
            <Text style={styles.linkText}>Ver todo</Text>
          </BouncyPressable>
        )}
      </View>

      {meals.length === 0 ? (
        <View style={[styles.emptyState, SHADOWS.soft]}>
          <Heart size={26} color={COLORS.primary} />
          <Text style={styles.emptyText}>
            Aún no tienen comidas registradas. ¡Empiecen eligiendo una marca!
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalContent}
        >
          {meals.slice(0, 8).map((meal, index) => {
            const brand = BRANDS.find((item) => item.id === meal.brand_id);
            if (!brand) return null;

            return (
              <BouncyPressable
                key={`${meal.eaten_at}-${index}`}
                onPress={() => goToBrand(brand)}
                haptic
                accessibilityRole="button"
                accessibilityLabel={`Ver ${brand.name}`}
                style={[styles.mealCard, { borderLeftColor: brand.color }]}
              >
                <Text style={styles.mealEmoji}>{brand.treat}</Text>
                <Text style={styles.mealBrand} numberOfLines={1}>
                  {brand.name}
                </Text>
                {meal.item && (
                  <Text style={styles.mealItem} numberOfLines={1}>
                    {meal.item}
                  </Text>
                )}
                <Text style={styles.mealMeta}>{timeAgo(meal.eaten_at)}</Text>
                {meal.rating != null && meal.rating > 0 && (
                  <StarRating value={meal.rating} size={11} readOnly />
                )}
              </BouncyPressable>
            );
          })}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: COLORS.textSecondary, fontSize: 13 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hello: { fontFamily: FONTS.semibold, fontSize: 12, color: COLORS.primary, letterSpacing: 0.4 },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 25, color: COLORS.textPrimary, marginTop: 2 },
  headerSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.soft,
  },
  avatarText: { color: COLORS.textOnPrimary, fontFamily: FONTS.bold, fontSize: 20 },
  coupleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  bannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textPrimary },
  bannerText: { fontSize: 11.5, color: COLORS.textSecondary, marginTop: 2, lineHeight: 17 },
  modeSwitch: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 18,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.pill,
    padding: 5,
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: RADIUS.pill,
  },
  modeButtonActive: { backgroundColor: COLORS.white, ...SHADOWS.soft },
  modeLabel: { fontFamily: FONTS.semibold, fontSize: 12.5, color: COLORS.textSecondary },
  modeLabelActive: { color: COLORS.primary },
  resultCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  resultTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  resultEmoji: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultKicker: {
    fontSize: 10,
    letterSpacing: 1.2,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
  },
  resultName: { fontFamily: FONTS.bold, fontSize: 21, color: COLORS.textPrimary, marginTop: 1 },
  resultReason: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3, lineHeight: 18 },
  resultActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  deckHint: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 10,
  },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary },
  sectionEmoji: { fontSize: 18 },
  linkText: { fontFamily: FONTS.semibold, fontSize: 12, color: COLORS.primary },
  horizontalContent: { paddingHorizontal: 20, gap: 10, paddingRight: 24 },
  brandCard: {
    width: 136,
    borderRadius: RADIUS.md,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  brandEmojiBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  brandEmoji: { fontSize: 27 },
  brandName: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  brandTreat: {
    fontSize: 10.5,
    color: COLORS.textSecondary,
    marginTop: 3,
    textAlign: 'center',
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6 },
  ratingValue: { fontSize: 10, color: COLORS.textSecondary, fontFamily: FONTS.bold },
  ratingEmpty: { fontSize: 9.5, color: COLORS.textSecondary, marginTop: 6 },
  mealCard: {
    width: 148,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    gap: 3,
  },
  mealEmoji: { fontSize: 27, marginBottom: 2 },
  mealBrand: { fontFamily: FONTS.bold, fontSize: 13.5, color: COLORS.textPrimary },
  mealItem: { fontSize: 11, color: COLORS.primary, fontFamily: FONTS.semibold },
  mealMeta: { fontSize: 10.5, color: COLORS.textSecondary, marginTop: 2, marginBottom: 2 },
  emptyState: {
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 19 },
});
