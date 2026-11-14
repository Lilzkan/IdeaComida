import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link2, Sparkles, Star, Trash2, User } from 'lucide-react-native';

import MealCalendar from '@/components/MealCalendar';
import StarRating from '@/components/StarRating';
import BouncyPressable from '@/components/ui/BouncyPressable';
import Screen from '@/components/ui/Screen';
import Text from '@/components/ui/Text';
import { COLORS } from '@/constants/colors';
import { BRANDS_BY_ID, type Meal } from '@/constants/brands';
import { FONTS, RADIUS, SHADOWS } from '@/constants/theme';
import { useDeleteMeal, useMeals } from '@/hooks/useMeals';
import { useRefresh } from '@/hooks/useRefresh';
import { getErrorMessage } from '@/lib/errors';
import { formatMealTime, timeAgo } from '@/lib/format';
import { findRecentRepeats } from '@/lib/meals';
import { useStore } from '@/store/useStore';

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function Historial() {
  const router = useRouter();
  const profile = useStore((state) => state.profile);

  const { data: meals = [], isLoading, refetch } = useMeals(profile?.couple_id);
  const { refreshing, onRefresh } = useRefresh(refetch);
  const deleteMeal = useDeleteMeal(profile?.couple_id);

  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    let ratingSum = 0;
    let ratingCount = 0;

    for (const meal of meals) {
      counts[meal.brand_id] = (counts[meal.brand_id] ?? 0) + 1;
      if (meal.rating && meal.rating > 0) {
        ratingSum += meal.rating;
        ratingCount += 1;
      }
    }

    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return {
      total: meals.length,
      distinctBrands: Object.keys(counts).length,
      topBrand: top ? BRANDS_BY_ID[top[0]] : null,
      topCount: top?.[1] ?? 0,
      avgRating: ratingCount > 0 ? ratingSum / ratingCount : 0,
    };
  }, [meals]);

  const repeats = useMemo(() => findRecentRepeats(meals, 7).slice(0, 3), [meals]);

  const dayMeals = useMemo(
    () =>
      meals
        .filter((meal) => isSameDay(new Date(meal.eaten_at), selectedDate))
        .sort((a, b) => new Date(b.eaten_at).getTime() - new Date(a.eaten_at).getTime()),
    [meals, selectedDate]
  );

  const dayLabel = capitalize(format(selectedDate, "EEEE d 'de' MMMM", { locale: es }));

  const confirmDelete = (meal: Meal) => {
    const brand = BRANDS_BY_ID[meal.brand_id];
    Alert.alert(
      'Eliminar antojo',
      `¿Seguro que quieren borrar ${meal.item ?? brand?.name ?? 'esta comida'} del historial?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteMeal.mutate(meal.id, {
              onError: (error) => {
                Alert.alert('No se pudo eliminar', getErrorMessage(error));
              },
            });
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Abriendo el álbum de antojos…</Text>
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
          <Text style={styles.kicker}>Nuestro álbum</Text>
          <Text style={styles.headerTitle}>Calendario de antojos</Text>
          <Text style={styles.headerSub}>Cada comida es un recuerdo 🍓</Text>
        </View>
        <Text style={styles.headerEmoji}>📅</Text>
      </View>

      {!profile?.couple_id ? (
        <BouncyPressable
          onPress={() => router.push('/pareja')}
          haptic
          accessibilityRole="button"
          accessibilityLabel="Vincular pareja"
          style={[styles.coupleBanner, SHADOWS.soft]}
        >
          <View style={styles.bannerIcon}>
            <Link2 size={19} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Vincula a tu pareja</Text>
            <Text style={styles.bannerText}>
              El calendario se comparte automáticamente cuando ambos están en la misma pareja.
            </Text>
          </View>
        </BouncyPressable>
      ) : (
        <>
          <MealCalendar meals={meals} selectedDate={selectedDate} onSelectDate={setSelectedDate} />

          {repeats.length > 0 && (
            <View style={[styles.repeatBanner, SHADOWS.soft]}>
              <Text style={styles.repeatEmoji}>🙈</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.repeatTitle}>Se les antojó repetir</Text>
                <Text style={styles.repeatText}>
                  {repeats
                    .map((repeat) => {
                      const brand = BRANDS_BY_ID[repeat.brandId];
                      return `${brand?.name ?? 'Una marca'} (hace ${repeat.days} ${
                        repeat.days === 1 ? 'día' : 'días'
                      })`;
                    })
                    .join(' · ')}
                </Text>
                <Text style={styles.repeatHint}>Sin juicio, a veces antoja lo mismo 💗</Text>
              </View>
            </View>
          )}

          <View style={styles.statRow}>
            <View style={[styles.statBox, { backgroundColor: COLORS.surface }]}>
              <Text style={styles.statEmoji}>🍽️</Text>
              <Text style={[styles.statNumber, { color: COLORS.primary }]}>{stats.total}</Text>
              <Text style={styles.statLabel}>comidas</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: COLORS.mint }]}>
              <Text style={styles.statEmoji}>🏷️</Text>
              <Text style={[styles.statNumber, { color: '#3F7A57' }]}>{stats.distinctBrands}</Text>
              <Text style={styles.statLabel}>marcas</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: COLORS.butter }]}>
              <Text style={styles.statEmoji}>⭐</Text>
              <View style={styles.statValueRow}>
                <Text style={[styles.statNumber, { color: '#A8792B' }]}>
                  {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'}
                </Text>
                {stats.avgRating > 0 && (
                  <Star size={12} color={COLORS.accent} fill={COLORS.accent} />
                )}
              </View>
              <Text style={styles.statLabel}>promedio</Text>
            </View>
          </View>

          {stats.topBrand && (
            <View style={styles.favoriteRow}>
              <Sparkles size={14} color={COLORS.warning} />
              <Text style={styles.favoriteText}>
                Su favorita es{' '}
                <Text style={styles.favoriteName}>
                  {stats.topBrand.emoji} {stats.topBrand.name}
                </Text>{' '}
                ({stats.topCount} {stats.topCount === 1 ? 'vez' : 'veces'})
              </Text>
            </View>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{dayLabel}</Text>
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>
                {dayMeals.length} {dayMeals.length === 1 ? 'antojito' : 'antojitos'}
              </Text>
            </View>
          </View>

          {dayMeals.length === 0 ? (
            <View style={[styles.emptyState, SHADOWS.soft]}>
              <Text style={styles.emptyEmoji}>🍪</Text>
              <Text style={styles.emptyText}>
                Ese día no registraron nada. Toca otro día del calendario para revivir el antojo.
              </Text>
            </View>
          ) : (
            <View style={styles.mealList}>
              {dayMeals.map((item) => {
                const brand = BRANDS_BY_ID[item.brand_id];
                return (
                  <View key={item.id} style={[styles.card, SHADOWS.soft]}>
                    <View style={styles.mealRow}>
                      <View
                        style={[
                          styles.mealSticker,
                          { backgroundColor: `${brand?.color ?? COLORS.primary}22` },
                        ]}
                      >
                        <Text style={styles.mealEmoji}>{brand?.treat ?? '🍔'}</Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.brandName}>{brand?.name ?? 'Marca'}</Text>
                        <Text style={styles.meta}>
                          {formatMealTime(item.eaten_at)} · {timeAgo(item.eaten_at)}
                        </Text>
                        {item.item && <Text style={styles.itemText}>{item.item}</Text>}
                        {item.rating != null && item.rating > 0 && (
                          <View style={styles.ratingRow}>
                            <StarRating value={item.rating} size={13} readOnly />
                            <Text style={styles.ratingText}>{item.rating}/5</Text>
                          </View>
                        )}
                        {item.added_by && (
                          <View style={styles.addedByBadge}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <User
                                size={12}
                                color={item.added_by === 'Ignacio' ? '#1E3A8A' : '#881337'}
                              />
                              <Text style={styles.addedByText}>{item.added_by}</Text>
                            </View>
                          </View>
                        )}
                      </View>

                      <BouncyPressable
                        onPress={() => confirmDelete(item)}
                        haptic
                        scaleTo={0.85}
                        hitSlop={10}
                        accessibilityRole="button"
                        accessibilityLabel="Eliminar comida"
                        style={styles.deleteButton}
                      >
                        <Trash2 size={17} color={COLORS.danger} />
                      </BouncyPressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </>
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
  kicker: {
    fontFamily: FONTS.semibold,
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 0.4,
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 24, color: COLORS.textPrimary, marginTop: 2 },
  headerSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3 },
  headerEmoji: { fontSize: 30 },
  coupleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 6,
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
  repeatBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 14,
    padding: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: `${COLORS.warning}55`,
    backgroundColor: COLORS.surfaceWarm,
  },
  repeatEmoji: { fontSize: 26 },
  repeatTitle: { fontFamily: FONTS.bold, fontSize: 13.5, color: COLORS.textPrimary },
  repeatText: { fontSize: 11.5, color: COLORS.textSecondary, marginTop: 2, lineHeight: 17 },
  repeatHint: { fontSize: 10.5, color: COLORS.textSecondary, marginTop: 3, fontFamily: FONTS.semibold },
  statRow: { flexDirection: 'row', marginHorizontal: 20, marginTop: 16, gap: 10 },
  statBox: {
    flex: 1,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statEmoji: { fontSize: 16, marginBottom: 2 },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statNumber: { fontFamily: FONTS.bold, fontSize: 20 },
  statLabel: { fontSize: 10.5, color: COLORS.textSecondary, marginTop: 1, textAlign: 'center' },
  favoriteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 24,
    marginTop: 12,
  },
  favoriteText: { fontSize: 11.5, color: COLORS.textSecondary, flex: 1 },
  favoriteName: { fontFamily: FONTS.semibold, color: COLORS.textPrimary },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 10,
    gap: 10,
  },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 17, color: COLORS.textPrimary, flex: 1 },
  countPill: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  countPillText: { fontSize: 10.5, color: COLORS.textSecondary, fontFamily: FONTS.semibold },
  mealList: { paddingHorizontal: 20, gap: 10 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mealRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mealSticker: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealEmoji: { fontSize: 24 },
  brandName: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textPrimary },
  meta: { fontSize: 10.5, color: COLORS.textSecondary, marginTop: 1 },
  itemText: {
    fontSize: 12,
    color: COLORS.primary,
    fontFamily: FONTS.semibold,
    marginTop: 2,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  ratingText: { fontSize: 10, color: COLORS.textSecondary, fontFamily: FONTS.bold },
  addedByBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 6,
  },
  addedByText: {
    fontSize: 10,
    fontFamily: FONTS.semibold,
    color: COLORS.textSecondary,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${COLORS.danger}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyEmoji: { fontSize: 32 },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 19,
  },
});
