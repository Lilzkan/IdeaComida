import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Gift, Heart, Plus, Sparkles, X } from 'lucide-react-native';

import GiftDealCard from '@/components/GiftDealCard';
import BouncyPressable from '@/components/ui/BouncyPressable';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import Text from '@/components/ui/Text';
import { COLORS } from '@/constants/colors';
import { BRANDS, BRANDS_BY_ID, type Brand } from '@/constants/brands';
import { FONTS, RADIUS, SHADOWS } from '@/constants/theme';
import { useAddDeal, useDeals } from '@/hooks/useDeals';
import { useRefresh } from '@/hooks/useRefresh';
import { daysUntil } from '@/lib/format';
import { useStore } from '@/store/useStore';

type DisplayDeal = {
  id: string;
  brand_id: string;
  title: string;
  description: string;
  code?: string;
  price?: string;
  imageUrl?: string;
  validUntil?: string | null;
};

type Filter = 'all' | 'saved' | string;

function localDeals(): DisplayDeal[] {
  return BRANDS.flatMap((brand) =>
    brand.defaultDeals.map((deal) => ({
      id: `${brand.id}-${deal.title}`,
      brand_id: brand.id,
      title: deal.title,
      description: deal.description,
      code: deal.code,
      price: deal.price,
      imageUrl: deal.imageUrl,
      validUntil: null,
    }))
  );
}

export default function Ofertas() {
  const [filter, setFilter] = useState<Filter>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const savedDeals = useStore((state) => state.savedDeals);
  const toggleSavedDeal = useStore((state) => state.toggleSavedDeal);

  const { data: remoteDeals = [], isLoading, refetch } = useDeals();
  const { refreshing, onRefresh } = useRefresh(refetch);
  const addDealMutation = useAddDeal();

  // Estado para modal de agregar cupón
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand>(BRANDS[0]!);
  const [titleDraft, setTitleDraft] = useState('');
  const [priceDraft, setPriceDraft] = useState('');
  const [codeDraft, setCodeDraft] = useState('');
  const [descDraft, setDescDraft] = useState('');
  const [imageDraft, setImageDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const deals = useMemo(() => {
    const valid = remoteDeals
      .filter((deal) => !deal.valid_until || daysUntil(deal.valid_until) >= 0)
      .map<DisplayDeal>((deal) => ({
        id: deal.id,
        brand_id: deal.brand_id,
        title: deal.title,
        description: deal.description,
        code: deal.code ?? undefined,
        price: deal.price ?? undefined,
        imageUrl: deal.imageUrl ?? undefined,
        validUntil: deal.valid_until,
      }));

    return valid.length > 0 ? valid : localDeals();
  }, [remoteDeals]);

  const filtered = useMemo(() => {
    if (filter === 'saved') return deals.filter((deal) => savedDeals.includes(deal.id));
    if (filter === 'all') return deals;
    return deals.filter((deal) => deal.brand_id === filter);
  }, [deals, filter, savedDeals]);

  const brandsWithDeals = useMemo(() => {
    const ids = new Set(deals.map((deal) => deal.brand_id));
    return BRANDS.filter((brand) => ids.has(brand.id));
  }, [deals]);

  const savedCount = useMemo(
    () => deals.filter((deal) => savedDeals.includes(deal.id)).length,
    [deals, savedDeals]
  );

  const copyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode((current) => (current === code ? null : current)), 1800);
  };

  const handleSaveCustomDeal = async () => {
    if (!titleDraft.trim()) {
      Alert.alert('Falta título', 'Escribe el título de la oferta o cupón.');
      return;
    }

    setSaving(true);
    try {
      await addDealMutation.mutateAsync({
        brand_id: selectedBrand.id,
        title: titleDraft.trim(),
        description: descDraft.trim() || 'Cupón disponible en la app oficial.',
        code: codeDraft.trim().toUpperCase() || null,
        price: priceDraft.trim() || null,
        imageUrl: imageDraft.trim() || selectedBrand.defaultDeals[0]?.imageUrl || null,
        valid_until: null,
      });

      setAddModalVisible(false);
      setTitleDraft('');
      setPriceDraft('');
      setCodeDraft('');
      setDescDraft('');
      setImageDraft('');
      Alert.alert('¡Cupón agregado!', 'El nuevo cupón se sincronizó para ambos teléfonos. 🎁');
    } catch {
      Alert.alert('Error', 'No se pudo guardar el cupón.');
    } finally {
      setSaving(false);
    }
  };

  const sectionLabel =
    filter === 'all'
      ? 'Todos los cupones'
      : filter === 'saved'
        ? 'Sus cupones guardados'
        : BRANDS_BY_ID[filter]?.name ?? 'Cupones';

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
      contentContainerStyle={{ paddingBottom: 100 }}
      overlay={
        <BouncyPressable
          onPress={() => setAddModalVisible(true)}
          haptic
          accessibilityRole="button"
          accessibilityLabel="Añadir nuevo cupón"
          style={[styles.fab, SHADOWS.button]}
        >
          <Plus size={26} color={COLORS.textOnPrimary} />
        </BouncyPressable>
      }
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>Regalitos</Text>
          <Text style={styles.headerTitle}>Cupones y ofertas</Text>
          <Text style={styles.headerSub}>Guarda los mejores y úsalos en caja 🎁</Text>
        </View>
        <View style={styles.headerBubble}>
          <Gift size={24} color={COLORS.primary} />
        </View>
      </View>

      <View style={[styles.summaryCard, SHADOWS.soft]}>
        <View style={styles.summaryEmojiWrap}>
          <Text style={styles.summaryEmoji}>🎟️</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.summaryTitle}>
            Tienen {savedCount} cupón{savedCount === 1 ? '' : 'es'} guardado{savedCount === 1 ? '' : 's'}
          </Text>
          <Text style={styles.summaryText}>
            Toca el corazón para guardarlos o el botón + para agregar uno nuevo.
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <BouncyPressable
          onPress={() => setFilter('all')}
          haptic
          accessibilityRole="button"
          accessibilityState={{ selected: filter === 'all' }}
          style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
        >
          <Sparkles size={13} color={filter === 'all' ? COLORS.textOnPrimary : COLORS.primary} />
          <Text style={[styles.filterChipText, filter === 'all' && styles.filterChipTextActive]}>
            Todas
          </Text>
        </BouncyPressable>

        <BouncyPressable
          onPress={() => setFilter('saved')}
          haptic
          accessibilityRole="button"
          accessibilityState={{ selected: filter === 'saved' }}
          style={[styles.filterChip, filter === 'saved' && styles.filterChipActive]}
        >
          <Heart
            size={13}
            color={filter === 'saved' ? COLORS.textOnPrimary : COLORS.primary}
            fill={filter === 'saved' ? COLORS.textOnPrimary : 'transparent'}
          />
          <Text style={[styles.filterChipText, filter === 'saved' && styles.filterChipTextActive]}>
            Guardados{savedCount > 0 ? ` (${savedCount})` : ''}
          </Text>
        </BouncyPressable>

        {brandsWithDeals.map((brand) => {
          const active = filter === brand.id;
          return (
            <BouncyPressable
              key={brand.id}
              onPress={() => setFilter(brand.id)}
              haptic
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text style={{ fontSize: 13 }}>{brand.emoji}</Text>
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {brand.name}
              </Text>
            </BouncyPressable>
          );
        })}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{sectionLabel}</Text>
        <Text style={styles.sectionCount}>{filtered.length}</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.loadingText}>Buscando ofertitas…</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={[styles.emptyState, SHADOWS.soft]}>
          <Text style={styles.emptyEmoji}>{filter === 'saved' ? '🤍' : '🎟️'}</Text>
          <Text style={styles.emptyText}>
            {filter === 'saved'
              ? 'Todavía no guardan cupones. Toca el corazón de uno que les guste.'
              : 'No hay cupones disponibles para esta marca por ahora.'}
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {filtered.map((item) => {
            const brand = BRANDS_BY_ID[item.brand_id];
            if (!brand) return null;

            return (
              <GiftDealCard
                key={item.id}
                id={item.id}
                brand={brand}
                title={item.title}
                description={item.description}
                code={item.code}
                price={item.price}
                imageUrl={item.imageUrl}
                validUntil={item.validUntil}
                saved={savedDeals.includes(item.id)}
                copied={item.code != null && copiedCode === item.code}
                onToggleSave={toggleSavedDeal}
                onCopy={copyCode}
              />
            );
          })}
        </View>
      )}

      {/* Modal para añadir nuevo cupón */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setAddModalVisible(false)} />
          <View style={[styles.modalCard, SHADOWS.card]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Añadir nuevo cupón 🎟️</Text>
              <BouncyPressable onPress={() => setAddModalVisible(false)} hitSlop={10}>
                <X size={20} color={COLORS.textSecondary} />
              </BouncyPressable>
            </View>

            <ScrollView contentContainerStyle={{ gap: 12 }}>
              <Text style={styles.label}>Selecciona la marca</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {BRANDS.map((brand) => {
                  const isSelected = selectedBrand.id === brand.id;
                  return (
                    <BouncyPressable
                      key={brand.id}
                      onPress={() => setSelectedBrand(brand)}
                      style={[styles.brandChip, isSelected && styles.brandChipSelected]}
                    >
                      <Text style={{ fontSize: 13 }}>{brand.emoji}</Text>
                      <Text style={[styles.brandChipText, isSelected && styles.brandChipTextSelected]}>
                        {brand.name}
                      </Text>
                    </BouncyPressable>
                  );
                })}
              </ScrollView>

              <Text style={styles.label}>Título de la oferta *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Combo 2x1 en Big Mac"
                placeholderTextColor={COLORS.textSecondary}
                value={titleDraft}
                onChangeText={setTitleDraft}
              />

              <Text style={styles.label}>Precio en CLP (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. $4.990"
                placeholderTextColor={COLORS.textSecondary}
                value={priceDraft}
                onChangeText={setPriceDraft}
              />

              <Text style={styles.label}>Código del cupón (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. MC2X1CL"
                placeholderTextColor={COLORS.textSecondary}
                value={codeDraft}
                onChangeText={setCodeDraft}
                autoCapitalize="characters"
              />

              <Text style={styles.label}>Descripción o detalle</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Válido en tótem o caja en todos los locales de Chile."
                placeholderTextColor={COLORS.textSecondary}
                value={descDraft}
                onChangeText={setDescDraft}
              />

              <Button
                label="Guardar cupón"
                onPress={handleSaveCustomDeal}
                loading={saving}
                style={{ marginTop: 12 }}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  headerBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    padding: 14,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryEmojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryEmoji: { fontSize: 22 },
  summaryTitle: { fontFamily: FONTS.bold, fontSize: 13.5, color: COLORS.textPrimary },
  summaryText: { fontSize: 11.5, color: COLORS.textSecondary, marginTop: 2, lineHeight: 17 },
  filterRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 14,
    height: 36,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { color: COLORS.textSecondary, fontSize: 12, fontFamily: FONTS.semibold },
  filterChipTextActive: { color: COLORS.textOnPrimary },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 10,
  },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 17, color: COLORS.textPrimary, flex: 1 },
  sectionCount: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.primary,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 9,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  list: { paddingHorizontal: 20 },
  loadingBox: { alignItems: 'center', marginTop: 36, gap: 10 },
  loadingText: { fontSize: 12, color: COLORS.textSecondary },
  emptyState: {
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 26,
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
    maxWidth: 420,
    maxHeight: '85%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary },
  label: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  brandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  brandChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  brandChipText: { fontSize: 12, fontFamily: FONTS.semibold, color: COLORS.textPrimary },
  brandChipTextSelected: { color: COLORS.textOnPrimary },
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
});
