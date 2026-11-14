import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Clock, Plus, Sparkles, Star } from 'lucide-react-native';

import GiftDealCard from '@/components/GiftDealCard';
import StarRating from '@/components/StarRating';
import BouncyPressable from '@/components/ui/BouncyPressable';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import Text from '@/components/ui/Text';
import { COLORS } from '@/constants/colors';
import { BRANDS_BY_ID, type Brand } from '@/constants/brands';
import { FONTS, RADIUS, SHADOWS } from '@/constants/theme';
import { useAddMeal, useMeals } from '@/hooks/useMeals';
import { getErrorMessage } from '@/lib/errors';
import { formatMealDate, formatMealTime, timeAgo } from '@/lib/format';
import { useStore } from '@/store/useStore';

export default function BrandScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useStore((state) => state.profile);
  const savedDeals = useStore((state) => state.savedDeals);
  const toggleSavedDeal = useStore((state) => state.toggleSavedDeal);
  const brand: Brand | undefined = id ? BRANDS_BY_ID[id] : undefined;

  const { data: meals = [], isLoading } = useMeals(profile?.couple_id, brand?.id);
  const addMeal = useAddMeal(profile?.couple_id);

  const [modalVisible, setModalVisible] = useState(false);
  const [pendingItem, setPendingItem] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const avgRating = useMemo(() => {
    const rated = meals.filter((meal) => meal.rating != null && meal.rating > 0);
    if (rated.length === 0) return 0;
    return rated.reduce((sum, meal) => sum + (meal.rating ?? 0), 0) / rated.length;
  }, [meals]);

  /** Repetición reciente: dos visitas a la misma marca con menos de 7 días. */
  const recentRepeat = useMemo(() => {
    const sorted = [...meals].sort(
      (a, b) => new Date(a.eaten_at).getTime() - new Date(b.eaten_at).getTime()
    );
    if (sorted.length < 2) return null;
    const latest = sorted[sorted.length - 1]!;
    const previous = sorted[sorted.length - 2]!;
    const days = Math.round(
      (new Date(latest.eaten_at).getTime() - new Date(previous.eaten_at).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return days <= 7 ? { days: Math.max(days, 0), latest } : null;
  }, [meals]);

  const openModal = (item: string | null) => {
    if (!profile?.couple_id) {
      Alert.alert(
        'Primero vincula a tu pareja',
        'Necesitas una pareja para guardar comidas compartidas.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Vincular', onPress: () => router.push('/pareja') },
        ]
      );
      return;
    }

    setPendingItem(item);
    setSelectedRating(0);
    setError(null);
    setModalVisible(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalVisible(false);
    setPendingItem(null);
    setSelectedRating(0);
    setError(null);
  };

  const saveMeal = async () => {
    if (!brand || !profile?.couple_id || saving) return;

    setSaving(true);
    setError(null);

    try {
      await addMeal.mutateAsync({
        couple_id: profile.couple_id,
        brand_id: brand.id,
        item: pendingItem,
        rating: selectedRating > 0 ? selectedRating : null,
        eaten_at: new Date().toISOString(),
        added_by: profile?.name ?? null,
      });

      setModalVisible(false);
      setPendingItem(null);
      setSelectedRating(0);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo guardar la comida.'));
    } finally {
      setSaving(false);
    }
  };

  const copyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode((current) => (current === code ? null : current)), 1800);
  };

  if (!brand) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={{ fontSize: 44 }}>🤔</Text>
          <Text style={styles.notFoundTitle}>Marca no encontrada</Text>
          <Text style={styles.notFoundText}>Ese antojito no está en el menú.</Text>
          <Button
            label="Volver al inicio"
            onPress={() => router.replace('/')}
            fullWidth={false}
            style={{ marginTop: 8 }}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      contentContainerStyle={{ paddingBottom: 120 }}
      overlay={
        <BouncyPressable
          onPress={() => openModal(null)}
          haptic
          accessibilityRole="button"
          accessibilityLabel="Registrar una comida"
          style={[styles.fab, SHADOWS.button]}
        >
          <Plus size={26} color={COLORS.textOnPrimary} />
        </BouncyPressable>
      }
    >
      <View style={styles.header}>
        <BouncyPressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          haptic
          accessibilityRole="button"
          accessibilityLabel="Volver"
          style={styles.backButton}
        >
          <ArrowLeft size={18} color={COLORS.primary} />
        </BouncyPressable>
        <Text style={styles.headerTitle}>Antojito</Text>
        <View style={{ width: 38 }} />
      </View>

      <LinearGradient
        colors={[`${brand.color}33`, COLORS.surface, COLORS.surfaceAlt]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, SHADOWS.card]}
      >
        <View style={[styles.heroEmoji, { backgroundColor: `${COLORS.white}B0` }]}>
          <Text style={{ fontSize: 52 }}>{brand.emoji}</Text>
        </View>

        <View style={styles.heroPill}>
          <Text style={styles.heroPillText}>{brand.treat} antojo favorito</Text>
        </View>

        <Text style={styles.brandName}>{brand.name}</Text>

        {avgRating > 0 ? (
          <View style={styles.heroRating}>
            <StarRating value={avgRating} size={15} readOnly />
            <Text style={styles.avgRatingText}>
              {avgRating.toFixed(1)} · {meals.filter((m) => (m.rating ?? 0) > 0).length} opiniones
            </Text>
          </View>
        ) : (
          <Text style={styles.noRating}>Aún sin calificaciones</Text>
        )}
      </LinearGradient>

      {recentRepeat && (
        <View style={[styles.repeatBanner, SHADOWS.soft]}>
          <Text style={styles.repeatEmoji}>🙈</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.repeatTitle}>Ya comieron aquí hace poquito</Text>
            <Text style={styles.repeatText}>
              {recentRepeat.days === 0
                ? 'Fue hoy mismo, ¡pero se vale repetir!'
                : `La última vez fue hace ${recentRepeat.days} ${
                    recentRepeat.days === 1 ? 'día' : 'días'
                  }.`}{' '}
              ¿Seguro quieren otra vez {brand.treat}?
            </Text>
          </View>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>¿Qué les apeteció?</Text>
          <Text style={styles.sectionSub}>Toca un platillo para registrarlo y calificarlo.</Text>
        </View>
        <Sparkles size={16} color={COLORS.warning} />
      </View>

      <View style={styles.itemsList}>
        {brand.items.map((item) => (
          <BouncyPressable
            key={item}
            onPress={() => openModal(item)}
            haptic
            accessibilityRole="button"
            accessibilityLabel={`Registrar ${item}`}
            style={[styles.itemCard, SHADOWS.soft]}
          >
            <Text style={styles.itemText}>{item}</Text>
            <View style={styles.itemAdd}>
              <Plus size={15} color={COLORS.textOnPrimary} />
            </View>
          </BouncyPressable>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>Cupones de {brand.name}</Text>
          <Text style={styles.sectionSub}>Guarda el corazón y muéstralo en caja.</Text>
        </View>
      </View>

      {brand.defaultDeals.length === 0 ? (
        <View style={[styles.emptyInline, SHADOWS.soft]}>
          <Text style={styles.emptyEmoji}>🎟️</Text>
          <Text style={styles.emptyInlineText}>No hay cupones cargados para esta marca.</Text>
        </View>
      ) : (
        <View style={styles.dealsList}>
          {brand.defaultDeals.map((deal) => {
            const dealId = `${brand.id}-${deal.title}`;
            return (
              <GiftDealCard
                key={deal.title}
                id={dealId}
                brand={brand}
                title={deal.title}
                description={deal.description}
                code={deal.code}
                saved={savedDeals.includes(dealId)}
                copied={deal.code != null && copiedCode === deal.code}
                onToggleSave={toggleSavedDeal}
                onCopy={copyCode}
              />
            );
          })}
        </View>
      )}

      <View style={styles.sectionHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>Historial con {brand.name}</Text>
          <Text style={styles.sectionSub}>
            {meals.length === 0
              ? 'Todavía no hay antojos registrados.'
              : `${meals.length} ${meals.length === 1 ? 'visita' : 'visitas'} juntos`}
          </Text>
        </View>
        <Text style={{ fontSize: 18 }}>🧾</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 16 }} />
      ) : meals.length === 0 ? (
        <View style={[styles.emptyInline, SHADOWS.soft]}>
          <Text style={styles.emptyEmoji}>🍽️</Text>
          <Text style={styles.emptyInlineText}>
            ¡Anímense a probar algo y aparecerá aquí!
          </Text>
        </View>
      ) : (
        <View style={styles.historyList}>
          {meals.map((meal) => (
            <View key={meal.id} style={[styles.historyCard, SHADOWS.soft]}>
              <View style={styles.historyLeft}>
                <View style={styles.historyIcon}>
                  <Clock size={15} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyDate}>
                    {formatMealDate(meal.eaten_at)} · {formatMealTime(meal.eaten_at)}
                  </Text>
                  <Text style={styles.historyItem}>
                    {meal.item ?? 'Sin platillo especificado'}
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                {meal.rating != null && meal.rating > 0 ? (
                  <View style={styles.ratingRow}>
                    <Star size={12} color={COLORS.accent} fill={COLORS.accent} />
                    <Text style={styles.ratingText}>{meal.rating}/5</Text>
                  </View>
                ) : (
                  <Text style={styles.noRatingSmall}>sin calificar</Text>
                )}
                <Text style={styles.ago}>{timeAgo(meal.eaten_at)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
          <View style={[styles.modalCard, SHADOWS.card]}>
            <View style={styles.modalHeader}>
              <Text style={{ fontSize: 26 }}>{brand.treat}</Text>
              <Text style={styles.modalTitle}>¿Qué comieron?</Text>
            </View>
            <Text style={styles.modalSub}>
              {pendingItem ? `Califica ${pendingItem}` : `Elige un platillo de ${brand.name}`}
            </Text>

            <ScrollView
              style={{ maxHeight: 190 }}
              contentContainerStyle={styles.modalItems}
              showsVerticalScrollIndicator={false}
            >
              <Pressable
                onPress={() => setPendingItem(null)}
                style={[styles.modalChip, pendingItem === null && styles.modalChipActive]}
              >
                <Text
                  style={[
                    styles.modalChipText,
                    pendingItem === null && styles.modalChipTextActive,
                  ]}
                >
                  Solo la marca
                </Text>
              </Pressable>
              {brand.items.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setPendingItem(item)}
                  style={[styles.modalChip, pendingItem === item && styles.modalChipActive]}
                >
                  <Text
                    style={[
                      styles.modalChipText,
                      pendingItem === item && styles.modalChipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.modalStarsLabel}>Calificación (opcional)</Text>
            <StarRating
              value={selectedRating}
              onChange={(value) => setSelectedRating(value === selectedRating ? 0 : value)}
              size={32}
              color={COLORS.accent}
              disabledColor={COLORS.border}
              showText
            />

            {error && <Text style={styles.modalError}>{error}</Text>}

            <View style={styles.modalBtnRow}>
              <Button
                label="Cancelar"
                variant="ghost"
                onPress={closeModal}
                fullWidth={false}
                style={{ flex: 1 }}
              />
              <Button
                label="Guardar"
                onPress={saveMeal}
                loading={saving}
                fullWidth={false}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  notFoundTitle: { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.textPrimary },
  notFoundText: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textPrimary },
  hero: {
    marginHorizontal: 20,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroEmoji: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  heroPill: {
    backgroundColor: `${COLORS.white}B8`,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 6,
  },
  heroPillText: {
    fontFamily: FONTS.semibold,
    fontSize: 10.5,
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
  },
  brandName: { fontFamily: FONTS.bold, fontSize: 26, color: COLORS.textPrimary },
  heroRating: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  avgRatingText: { fontSize: 11.5, color: COLORS.textSecondary },
  noRating: { fontSize: 11.5, color: COLORS.textSecondary, marginTop: 6 },
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 17, color: COLORS.textPrimary },
  sectionSub: { fontSize: 11.5, color: COLORS.textSecondary, marginTop: 2, lineHeight: 17 },
  itemsList: { paddingHorizontal: 20, gap: 9 },
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemText: { fontSize: 14, color: COLORS.textPrimary, flex: 1, paddingRight: 10 },
  itemAdd: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealsList: { paddingHorizontal: 20 },
  emptyInline: {
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  emptyEmoji: { fontSize: 28 },
  emptyInlineText: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  historyList: { paddingHorizontal: 20, gap: 9 },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1 },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyDate: { fontSize: 10.5, color: COLORS.textSecondary },
  historyItem: { fontSize: 13.5, fontFamily: FONTS.semibold, color: COLORS.textPrimary, marginTop: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 10.5, fontFamily: FONTS.bold, color: COLORS.textSecondary },
  noRatingSmall: { fontSize: 10, color: COLORS.textSecondary },
  ago: { fontSize: 10, color: COLORS.textSecondary },
  fab: {
    position: 'absolute',
    bottom: 26,
    right: 22,
    backgroundColor: COLORS.primary,
    borderRadius: 29,
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(74,53,49,0.38)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 20,
    width: '100%',
    maxWidth: 430,
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  modalTitle: { fontFamily: FONTS.bold, fontSize: 19, color: COLORS.textPrimary },
  modalSub: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  modalItems: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 4 },
  modalChip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
  },
  modalChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  modalChipText: { fontSize: 12, color: COLORS.textPrimary, fontFamily: FONTS.regular },
  modalChipTextActive: { color: COLORS.textOnPrimary, fontFamily: FONTS.semibold },
  modalStarsLabel: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginTop: 18,
    marginBottom: 8,
    fontFamily: FONTS.semibold,
  },
  modalError: { color: COLORS.danger, fontSize: 12, marginTop: 10 },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
});
