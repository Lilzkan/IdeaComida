import { useMemo, useState, type ReactNode } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Heart, LogOut, Pencil, Settings, User, Users } from 'lucide-react-native';

import BouncyPressable from '@/components/ui/BouncyPressable';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import Text from '@/components/ui/Text';
import { COLORS } from '@/constants/colors';
import { FONTS, RADIUS, SHADOWS } from '@/constants/theme';
import { firstZodError, nameSchema } from '@/lib/validation';
import { useStore } from '@/store/useStore';

type MenuItemProps = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
};

function MenuItem({ icon, title, subtitle, onPress }: MenuItemProps) {
  return (
    <BouncyPressable
      onPress={onPress}
      haptic
      accessibilityRole="button"
      style={[styles.menuItem, SHADOWS.soft]}
    >
      <View style={styles.menuIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.menuText}>{title}</Text>
        <Text style={styles.menuSub}>{subtitle}</Text>
      </View>
      <ChevronRight size={16} color={COLORS.textSecondary} />
    </BouncyPressable>
  );
}

export default function Perfil() {
  const router = useRouter();
  const { profile, signOut, updateName } = useStore();

  const [editVisible, setEditVisible] = useState(false);
  const [nameDraft, setNameDraft] = useState(profile?.name ?? '');
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const initial = useMemo(() => {
    const name = profile?.name?.trim();
    return name ? name.charAt(0).toUpperCase() : '💗';
  }, [profile?.name]);

  const openEdit = () => {
    setNameDraft(profile?.name ?? '');
    setEditError(null);
    setEditVisible(true);
  };

  const handleSaveName = async () => {
    const parsed = nameSchema.safeParse(nameDraft);
    if (!parsed.success) {
      setEditError(firstZodError(parsed.error));
      return;
    }

    setSaving(true);
    const result = await updateName(parsed.data);
    setSaving(false);

    if (result.error) {
      setEditError(result.error);
      return;
    }
    setEditVisible(false);
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: () => {
          void signOut();
        },
      },
    ]);
  };

  return (
    <Screen scroll contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>Su rinconcito</Text>
          <Text style={styles.headerTitle}>Perfil</Text>
        </View>
        <Text style={styles.headerEmoji}>🌷</Text>
      </View>

      <View style={[styles.profileCard, SHADOWS.card]}>
        <View style={[styles.avatarRing, { borderColor: COLORS.primarySoft }]}>
          <View style={[styles.avatar, { backgroundColor: COLORS.surfaceWarm }]}>
            <User size={36} color={COLORS.primary} />
          </View>
        </View>

        <Text style={styles.nameText}>{profile?.name ?? 'Usuario'}</Text>
        <Text style={styles.emailText}>{profile?.email ?? 'Cuenta conectada'}</Text>

        <View style={styles.tagRow}>
          <View style={styles.coupleTag}>
            {profile?.couple_id ? (
              <Heart size={13} color={COLORS.primary} fill={COLORS.primary} />
            ) : (
              <Users size={13} color={COLORS.textSecondary} />
            )}
            <Text style={styles.coupleTagText}>
              {profile?.couple_id ? 'En pareja' : 'Sin pareja vinculada'}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Su cuenta</Text>

      <MenuItem
        icon={<Heart size={18} color={COLORS.primary} />}
        title="Pareja"
        subtitle={
          profile?.couple_id ? 'Ver código de invitación y gestionar' : 'Crea o únete a una pareja'
        }
        onPress={() => router.push('/pareja')}
      />

      <MenuItem
        icon={<Pencil size={18} color={COLORS.primary} />}
        title="Editar perfil"
        subtitle="Cambia tu nombre de usuario"
        onPress={openEdit}
      />

      <MenuItem
        icon={<Settings size={18} color={COLORS.primary} />}
        title="Ajustes"
        subtitle="Notificaciones y preferencias"
        onPress={() =>
          Alert.alert('Ajustes', 'Las preferencias llegarán en una próxima versión. 💗')
        }
      />

      <Button
        label="Cerrar sesión"
        variant="danger"
        icon={<LogOut size={18} color={COLORS.textOnPrimary} />}
        onPress={handleLogout}
        style={styles.logoutButton}
      />

      <Text style={styles.footer}>IdeaComida · decidir mejor, juntos 💗</Text>

      <Modal
        visible={editVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setEditVisible(false)} />
          <View style={[styles.modalCard, SHADOWS.card]}>
            <Text style={{ fontSize: 30, alignSelf: 'center' }}>✏️</Text>
            <Text style={styles.modalTitle}>Editar nombre</Text>
            <Text style={styles.modalSub}>¿Cómo quieres que te llamemos?</Text>

            <TextInput
              style={styles.modalInput}
              value={nameDraft}
              onChangeText={setNameDraft}
              placeholder="Tu nombre"
              placeholderTextColor={COLORS.textSecondary}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
            />

            {editError && <Text style={styles.modalError}>{editError}</Text>}

            <View style={styles.modalBtnRow}>
              <Button
                label="Cancelar"
                variant="ghost"
                onPress={() => setEditVisible(false)}
                fullWidth={false}
                style={{ flex: 1 }}
              />
              <Button
                label="Guardar"
                onPress={handleSaveName}
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
  headerEmoji: { fontSize: 30 },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarRing: {
    padding: 4,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primarySoft,
    marginBottom: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: COLORS.textOnPrimary, fontFamily: FONTS.bold, fontSize: 30 },
  nameText: { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.textPrimary },
  emailText: { fontSize: 12.5, color: COLORS.textSecondary, marginTop: 2 },
  tagRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' },
  coupleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.white,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  coupleTagText: { color: COLORS.textPrimary, fontSize: 11, fontFamily: FONTS.semibold },
  sectionLabel: {
    fontFamily: FONTS.semibold,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginHorizontal: 22,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  menuItem: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: { fontFamily: FONTS.bold, fontSize: 14.5, color: COLORS.textPrimary },
  menuSub: { fontSize: 11.5, color: COLORS.textSecondary, marginTop: 2 },
  logoutButton: { marginHorizontal: 20, marginTop: 12 },
  footer: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 10.5,
    marginTop: 22,
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(74,53,49,0.38)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 19,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: 6,
  },
  modalSub: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 15,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
    fontFamily: FONTS.regular,
  },
  modalError: { color: COLORS.danger, fontSize: 12, marginTop: 8 },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
});
