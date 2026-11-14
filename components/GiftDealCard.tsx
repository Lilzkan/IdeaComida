import { Image, Linking, Platform, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Copy, ExternalLink, Heart, Ticket } from 'lucide-react-native';

import BouncyPressable from './ui/BouncyPressable';
import Text from './ui/Text';
import { COLORS } from '@/constants/colors';
import { FONTS, RADIUS, SHADOWS } from '@/constants/theme';
import type { Brand } from '@/constants/brands';
import { formatMealDate } from '@/lib/format';

type GiftDealCardProps = {
  id: string;
  brand: Brand;
  title: string;
  description: string;
  code?: string | null;
  price?: string | null;
  imageUrl?: string | null;
  validUntil?: string | null;
  saved?: boolean;
  copied?: boolean;
  onToggleSave?: (id: string) => void;
  onCopy?: (code: string) => void;
};

export default function GiftDealCard({
  id,
  brand,
  title,
  description,
  code,
  price,
  imageUrl,
  validUntil,
  saved = false,
  copied = false,
  onToggleSave,
  onCopy,
}: GiftDealCardProps) {
  const handleOpenApp = async () => {
    if (Platform.OS === 'android' && brand.packageName) {
      const intentUrl = `intent://#Intent;package=${brand.packageName};end`;
      try {
        const canOpen = await Linking.canOpenURL(intentUrl);
        if (canOpen) {
          await Linking.openURL(intentUrl);
          return;
        }
      } catch {
        // Fallback
      }
    }

    if (brand.appUrl) {
      try {
        await Linking.openURL(brand.appUrl);
      } catch {
        // Fallback
      }
    }
  };

  return (
    <View style={[styles.card, SHADOWS.card]}>
      <LinearGradient
        colors={[`${brand.color}2A`, COLORS.surface, COLORS.surfaceAlt]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Imagen del plato / combo */}
      {imageUrl ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.foodImage} resizeMode="cover" />
          {price && (
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>{price}</Text>
            </View>
          )}
        </View>
      ) : null}

      <View style={styles.row}>
        <View style={styles.stub}>
          <View style={[styles.emojiBubble, { backgroundColor: `${brand.color}24` }]}>
            <Text style={styles.emoji}>{brand.treat}</Text>
          </View>
          <Text style={styles.brandName} numberOfLines={2}>
            {brand.name}
          </Text>
          <Text style={styles.stubHint}>cupón</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            <BouncyPressable
              onPress={() => onToggleSave?.(id)}
              haptic
              scaleTo={0.85}
              accessibilityRole="button"
              accessibilityLabel={saved ? 'Quitar de guardados' : 'Guardar cupón'}
              style={styles.saveButton}
            >
              <Heart
                size={17}
                color={saved ? COLORS.primary : COLORS.textSecondary}
                fill={saved ? COLORS.primary : 'transparent'}
              />
            </BouncyPressable>
          </View>

          <Text style={styles.description}>{description}</Text>

          <View style={styles.footer}>
            {code ? (
              <BouncyPressable
                onPress={() => onCopy?.(code)}
                haptic
                accessibilityRole="button"
                accessibilityLabel={`Copiar código ${code}`}
                style={styles.codePill}
              >
                {copied ? (
                  <Check size={13} color={COLORS.success} />
                ) : (
                  <Ticket size={13} color={COLORS.primary} />
                )}
                <Text style={styles.code}>{copied ? '¡Copiado!' : code}</Text>
                <Copy size={12} color={COLORS.textSecondary} />
              </BouncyPressable>
            ) : (
              <View />
            )}

            {brand.appUrl && (
              <BouncyPressable
                onPress={handleOpenApp}
                haptic
                accessibilityRole="button"
                accessibilityLabel={`Abrir app de ${brand.name}`}
                style={styles.openAppButton}
              >
                <Text style={styles.openAppText}>Abrir App</Text>
                <ExternalLink size={12} color={COLORS.primary} />
              </BouncyPressable>
            )}
          </View>

          {validUntil ? (
            <Text style={styles.validUntil}>Válido hasta {formatMealDate(validUntil)}</Text>
          ) : null}
        </View>
      </View>

      <View style={[styles.notch, styles.notchTop]} />
      <View style={[styles.notch, styles.notchBottom]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.surfaceWarm,
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  priceBadge: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    ...SHADOWS.soft,
  },
  priceText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.textOnPrimary,
  },
  row: { flexDirection: 'row' },
  stub: {
    width: 92,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emojiBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 27 },
  brandName: {
    fontFamily: FONTS.semibold,
    fontSize: 11,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  stubHint: {
    fontSize: 9,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  divider: {
    width: 1,
    borderLeftWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    marginVertical: 14,
  },
  body: { flex: 1, paddingVertical: 14, paddingHorizontal: 14, gap: 5 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  title: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  saveButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.white}CC`,
  },
  description: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
  footer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: `${COLORS.white}D9`,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  code: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  openAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  openAppText: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
  },
  validUntil: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  notch: {
    position: 'absolute',
    left: 84,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  notchTop: { top: -8 },
  notchBottom: { bottom: -8 },
});
