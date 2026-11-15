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
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Clock, Plus, Star } from 'lucide-react-native';

import StarRating from '@/components/StarRating';
import BouncyPressable from '@/components/ui/BouncyPressable';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import Text from '@/components/ui/Text';
import { COLORS } from '@/constants/colors';
import { BRANDS_BY_ID, type Brand } from '@/constants/brands';
import { FONTS, RADIUS, SHADOWS } from '@/constants/theme';
import { useAddMeal, useMeals } from '@/hooks/useMeals';
import { formatMealDate, formatMealTime, timeAgo } from '@/lib/format';
import { getErrorMessage } from '@/lib/errors';
import { useStore } from '@/store/useStore';

export default function BrandScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useStore((state) => state.profile);
  const brand: Brand | undefined = id ? BRANDS_BY_ID[id] : undefined;

  const { data: meals = [], isLoading } = useMeals(profile?.couple_id, brand?.id);
  const addMeal = useAddMeal(profile?.couple_id);

  const [modalVisible, setModalVisible] = useState(false);
  const [pendingItem, setPendingItem] = useState<string | null>(null);
  const [pendingPrice, setPendingPrice] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calificación Promedio Histórica de la Marca
  const avgRating = useMemo(() => {
    const rated = meals.filter((meal) => meal.rating != null && meal.rating > 0);
    if (rated.length === 0) return 0;
    return rated.reduce((sum, meal) => sum + (meal.rating ?? 0), 0) / rated.length;
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
    setPendingPrice('');
    setSelectedRating(0);
    setError(null);
    setModalVisible(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalVisible(false);
    setPendingItem(null);
    setPendingPrice('');
    setSelectedRating(0);
    setError(null);
  };

  const saveMeal = async () => {
    if (!brand || !profile?.couple_id || saving) return;

    setSaving(true);
    setError(null);

    const numericPrice = pendingPrice.trim() ? parseInt(pendingPrice.replace(/\D/g, ''), 10) : null;

    try {
      await addMeal.mutateAsync({
        couple_id: profile.couple_id,
        brand_id: brand.id,
        item: pendingItem?.trim() || null,
        price: numericPrice && !isNaN(numericPrice) ? numericPrice : null,
        rating: selectedRating > 0 ? selectedRating : null,
        eaten_at: new Date().toISOString(),
        added_by: profile?.name ?? null,
      });

      setModalVisible(false);
      setPendingItem(null);
      setPendingPrice('');
      setSelectedRating(0);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo guardar la comida.'));
    } finally {
      setSaving(false);
    }
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
          <Text style={{ fontSize: 18 }}>←</Text>
        </BouncyPressable>
        <Text style={styles.headerTitle}>{brand.name}</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={[styles.heroCard, SHADOWS.card]}>
        <View style={[styles.heroBubble, { backgroundColor: `${brand.color}2A` }]}>
          <Text style={styles.heroEmoji}>{brand.emoji}</Text>
        </View>
        <Text style={styles.brandTitle}>{brand.name}</Text>

        <View style={styles.ratingBadge}>
          {avgRating > 0 ? (
            <>
              <Star size={14} color={COLORS.accent} fill={COLORS.accent} />
              <Text style={styles.ratingValueText}>{avgRating.toFixed(1)}/5</Text>
              <Text style={styles.ratingCountText}>({meals.length} visitas)</Text>
            </>
          ) : (
            <Text style={styles.ratingCountText}>Sin calificaciones de todos los tiempos</Text>
          )}
        </View>
      </View>

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
                  {meal.price != null && meal.price > 0 && (
                    <Text style={styles.historyPrice}>
                      ${meal.price.toLocaleString('es-CL')} CLP
                    </Text>
                  )}
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

      {/* Modal para registrar comida */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
          <View style={[styles.modalCard, SHADOWS.card]}>
            <View style={styles.modalHeader}>
              <Text style={{ fontSize: 26 }}>{brand.treat}</Text>
              <Text style={styles.modalTitle}>Registrar antojo en {brand.name}</Text>
            </View>

            <ScrollView contentContainerStyle={{ gap: 10 }}>
              <Text style={styles.label}>Nombre o plato (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Combo Whopper o dejar en blanco"
                placeholderTextColor={COLORS.textSecondary}
                value={pendingItem ?? ''}
                onChangeText={setPendingItem}
              />

              <Text style={styles.label}>Costo / Gasto en CLP (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. 6990"
                keyboardType="numeric"
                placeholderTextColor={COLORS.textSecondary}
                value={pendingPrice}
                onChangeText={setPendingPrice}
              />

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
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary },
  notFoundText: { fontSize: 12.5, color: COLORS.textSecondary },
  header: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
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
  headerTitle: { fontFamily: FONTS.bold, fontSize: 17, color: COLORS.textPrimary },
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  heroBubble: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  heroEmoji: { fontSize: 44 },
  brandTitle: { fontFamily: FONTS.bold, fontSize: 24, color: COLORS.textPrimary },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ratingValueText: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.textPrimary },
  ratingCountText: { fontSize: 11, color: COLORS.textSecondary },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 17, color: COLORS.textPrimary },
  sectionSub: { fontSize: 11.5, color: COLORS.textSecondary, marginTop: 2 },
  emptyInline: {
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 22,
    alignItems: 'center',
    gap: 6,
  },
  emptyEmoji: { fontSize: 28 },
  emptyInlineText: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center' },
  historyList: { paddingHorizontal: 20, gap: 10 },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  historyIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyDate: { fontSize: 10.5, color: COLORS.textSecondary, fontFamily: FONTS.semibold },
  historyItem: { fontFamily: FONTS.bold, fontSize: 13.5, color: COLORS.textPrimary, marginTop: 1 },
  historyPrice: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.primary, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 11, color: COLORS.textPrimary, fontFamily: FONTS.bold },
  noRatingSmall: { fontSize: 10, color: COLORS.textSecondary },
  ago: { fontSize: 10, color: COLORS.textSecondary },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
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
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  modalTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary },
  modalSub: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 14 },
  label: { fontSize: 12, fontFamily: FONTS.semibold, color: COLORS.textSecondary, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
    fontFamily: FONTS.regular,
  },
  modalStarsLabel: {
    fontFamily: FONTS.semibold,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  modalError: { color: COLORS.danger, fontSize: 12, marginTop: 8 },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
});
