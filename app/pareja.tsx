import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Share,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { ArrowLeft, Check, Copy, Heart, KeyRound, LogOut, Share2, Sparkles, Users } from 'lucide-react-native';

import BouncyPressable from '@/components/ui/BouncyPressable';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import Text from '@/components/ui/Text';
import { COLORS } from '@/constants/colors';
import { FONTS, RADIUS, SHADOWS } from '@/constants/theme';
import { coupleKeys, useCouple } from '@/hooks/useCouple';
import { useStore } from '@/store/useStore';

export default function ParejaScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile, createCouple, joinCouple, leaveCouple } = useStore();

  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [coupleName, setCoupleName] = useState('');
  const [inviteInput, setInviteInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: couple = null, isLoading: coupleLoading } = useCouple(profile?.couple_id);

  const handleCreate = async () => {
    setError(null);
    setSubmitting(true);
    const result = await createCouple(coupleName);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setCoupleName('');
  };

  const handleJoin = async () => {
    if (inviteInput.trim().length < 4) {
      setError('Escribe el código de invitación completo.');
      return;
    }

    setError(null);
    setSubmitting(true);
    const result = await joinCouple(inviteInput);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setInviteInput('');
  };

  const copyCode = async () => {
    if (!couple) return;
    await Clipboard.setStringAsync(couple.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const shareCode = async () => {
    if (!couple) return;

    const message = `Únete a mi pareja en IdeaComida con el código ${couple.invite_code} 💑🍔`;

    // En web no siempre existe Share; copiamos el mensaje como respaldo.
    if (Platform.OS === 'web') {
      await Clipboard.setStringAsync(message);
      Alert.alert('Copiado', 'El mensaje de invitación se copió al portapapeles.');
      return;
    }

    await Share.share({ message });
  };

  const confirmLeave = () => {
    Alert.alert(
      'Salir de la pareja',
      'El historial compartido dejará de mostrarse en tu cuenta. Podrás volver a unirte con el código.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            const result = await leaveCouple();
            if (result.error) {
              Alert.alert('No se pudo salir', result.error);
              return;
            }
            // Al salir ya no tenemos acceso a las comidas compartidas:
            // limpiamos su caché para no mostrar datos de la pareja anterior.
            if (profile?.couple_id) {
              queryClient.removeQueries({ queryKey: coupleKeys.detail(profile.couple_id) });
            }
            queryClient.removeQueries({ queryKey: ['meals'] });
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen scroll keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 32 }}>
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
          <Text style={styles.headerTitle}>Pareja</Text>
          <View style={{ width: 38 }} />
        </View>

        {coupleLoading ? (
          <View style={styles.loadingBox}>
            <Text style={{ fontSize: 30 }}>💞</Text>
            <Text style={styles.loadingText}>Buscando a su media naranja…</Text>
          </View>
        ) : profile?.couple_id ? (
          <>
            <View style={[styles.heroCard, SHADOWS.card]}>
              <View style={styles.heroHeart}>
                <Heart size={34} color={COLORS.primary} fill={COLORS.primarySoft} />
              </View>
              <Text style={styles.heroTitle}>
                {couple?.name?.trim() ? couple.name : 'Nuestra pareja'}
              </Text>
              <Text style={styles.heroSub}>
                Compartan este código con tu pareja para que se una.
              </Text>

              <View style={styles.codeBox}>
                <Text style={styles.codeText}>{couple?.invite_code ?? '••••••'}</Text>
              </View>

              <View style={styles.codeActions}>
                <BouncyPressable onPress={copyCode} haptic style={styles.codeButton}>
                  {copied ? (
                    <Check size={16} color={COLORS.primary} />
                  ) : (
                    <Copy size={16} color={COLORS.primary} />
                  )}
                  <Text style={styles.codeButtonText}>{copied ? 'Copiado' : 'Copiar'}</Text>
                </BouncyPressable>

                <BouncyPressable onPress={shareCode} haptic style={styles.codeButton}>
                  <Share2 size={16} color={COLORS.primary} />
                  <Text style={styles.codeButtonText}>Compartir</Text>
                </BouncyPressable>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Users size={18} color={COLORS.primary} />
              <Text style={styles.infoText}>
                Todo lo que registren (comidas, calificaciones y ofertas usadas) se comparte
                automáticamente con tu pareja. 💗
              </Text>
            </View>

            <Button
              label="Salir de la pareja"
              variant="ghost"
              icon={<LogOut size={16} color={COLORS.danger} />}
              onPress={confirmLeave}
              style={styles.leaveButton}
            />
          </>
        ) : (
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroHeart}>
                <Heart size={32} color={COLORS.primary} fill={COLORS.primarySoft} />
              </View>
              <Text style={styles.heroTitle}>Compartan los antojos</Text>
              <Text style={styles.heroSub}>
                Creen su espacio o únanse con un código. Es súper fácil.
              </Text>
            </View>

            <View style={styles.tabs}>
              <BouncyPressable
                onPress={() => setMode('create')}
                haptic
                accessibilityRole="button"
                accessibilityState={{ selected: mode === 'create' }}
                style={[styles.tab, mode === 'create' && styles.tabActive]}
              >
                <Heart
                  size={15}
                  color={mode === 'create' ? COLORS.textOnPrimary : COLORS.textSecondary}
                />
                <Text style={[styles.tabText, mode === 'create' && styles.tabTextActive]}>
                  Crear pareja
                </Text>
              </BouncyPressable>

              <BouncyPressable
                onPress={() => setMode('join')}
                haptic
                accessibilityRole="button"
                accessibilityState={{ selected: mode === 'join' }}
                style={[styles.tab, mode === 'join' && styles.tabActive]}
              >
                <KeyRound
                  size={15}
                  color={mode === 'join' ? COLORS.textOnPrimary : COLORS.textSecondary}
                />
                <Text style={[styles.tabText, mode === 'join' && styles.tabTextActive]}>
                  Unirme
                </Text>
              </BouncyPressable>
            </View>

            <View style={[styles.formCard, SHADOWS.soft]}>
              {mode === 'create' ? (
                <>
                  <Text style={styles.formTitle}>Crea su espacio compartido</Text>
                  <Text style={styles.formSub}>
                    Les generaremos un código para que tu pareja se una.
                  </Text>
                  <Text style={styles.label}>Nombre de la pareja (opcional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. Los hambrientos"
                    placeholderTextColor={COLORS.textSecondary}
                    value={coupleName}
                    onChangeText={setCoupleName}
                    maxLength={60}
                  />
                  <Button
                    label="Crear pareja"
                    onPress={handleCreate}
                    loading={submitting}
                    icon={<Sparkles size={17} color={COLORS.textOnPrimary} />}
                    style={{ marginTop: 18 }}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.formTitle}>Únete con un código</Text>
                  <Text style={styles.formSub}>
                    Pídele a tu pareja el código de 6 caracteres que aparece en su perfil.
                  </Text>
                  <Text style={styles.label}>Código de invitación</Text>
                  <TextInput
                    style={[styles.input, styles.codeInput]}
                    placeholder="ABC123"
                    placeholderTextColor={COLORS.textSecondary}
                    value={inviteInput}
                    onChangeText={(value) => setInviteInput(value.toUpperCase())}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={8}
                  />
                  <Button
                    label="Unirme a la pareja"
                    onPress={handleJoin}
                    loading={submitting}
                    icon={<Heart size={17} color={COLORS.textOnPrimary} />}
                    style={{ marginTop: 18 }}
                  />
                </>
              )}

              {error && (
                <View style={styles.errorRow}>
                  <Text style={styles.errorEmoji}>😢</Text>
                  <Text style={styles.error}>{error}</Text>
                </View>
              )}
            </View>

            <View style={styles.infoCard}>
              <Users size={18} color={COLORS.primary} />
              <Text style={styles.infoText}>
                Solo una persona necesita crear la pareja. La otra se une con el código y ambas
                verán el mismo historial.
              </Text>
            </View>
          </>
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  headerTitle: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textPrimary },
  loadingBox: { alignItems: 'center', marginTop: 60, gap: 10 },
  loadingText: { fontSize: 12, color: COLORS.textSecondary },
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    ...SHADOWS.card,
  },
  heroHeart: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primarySoft,
  },
  heroTitle: { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.textPrimary, marginTop: 10 },
  heroSub: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
  codeBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    paddingHorizontal: 26,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  codeText: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    letterSpacing: 7,
    color: COLORS.primary,
  },
  codeActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  codeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  codeButtonText: { fontSize: 12.5, fontFamily: FONTS.semibold, color: COLORS.primary },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.pill,
    padding: 5,
    gap: 5,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
  },
  tabActive: { backgroundColor: COLORS.primary, ...SHADOWS.soft },
  tabText: { fontSize: 12.5, fontFamily: FONTS.semibold, color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.textOnPrimary },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 18,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formTitle: { fontFamily: FONTS.bold, fontSize: 17, color: COLORS.textPrimary },
  formSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, lineHeight: 18 },
  label: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 6,
    fontFamily: FONTS.semibold,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
    fontFamily: FONTS.regular,
  },
  codeInput: {
    fontFamily: FONTS.bold,
    fontSize: 19,
    letterSpacing: 5,
    textAlign: 'center',
  },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  errorEmoji: { fontSize: 14 },
  error: { color: COLORS.danger, fontSize: 12, flex: 1 },
  infoCard: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoText: { flex: 1, fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
  leaveButton: { marginHorizontal: 20, marginTop: 20 },
});
