import { useState } from 'react';
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';

import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import Text from '@/components/ui/Text';
import TextField from '@/components/ui/TextField';
import { COLORS } from '@/constants/colors';
import { FONTS, RADIUS, SHADOWS } from '@/constants/theme';
import { firstZodError, loginSchema } from '@/lib/validation';
import { useStore } from '@/store/useStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signIn = useStore((state) => state.signIn);

  const handleSignIn = async () => {
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(firstZodError(parsed.error));
      return;
    }

    setError(null);
    setLoading(true);
    const result = await signIn(parsed.data.email, parsed.data.password);
    setLoading(false);
    if (result.error) setError(result.error);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen scroll keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <View style={styles.brand}>
          <View style={styles.logoBubble}>
            <Text style={styles.logoEmoji}>🍔</Text>
          </View>
          <Text style={styles.logo}>IdeaComida</Text>
          <Text style={styles.tagline}>¿Qué comemos hoy, en pareja? 💗</Text>
        </View>

        <View style={[styles.card, SHADOWS.card]}>
          <Text style={styles.cardTitle}>Iniciar sesión</Text>
          <Text style={styles.cardSub}>Entra con tu correo y contraseña.</Text>

          <View style={styles.form}>
            <TextField
              label="Correo electrónico"
              icon={<Mail size={19} color={COLORS.textSecondary} />}
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
            />

            <TextField
              label="Contraseña"
              icon={<Lock size={19} color={COLORS.textSecondary} />}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleSignIn}
              right={
                <Pressable
                  onPress={() => setShowPassword((value) => !value)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <EyeOff size={19} color={COLORS.textSecondary} />
                  ) : (
                    <Eye size={19} color={COLORS.textSecondary} />
                  )}
                </Pressable>
              }
            />

            {error && (
              <View style={styles.errorRow}>
                <AlertCircle size={15} color={COLORS.danger} />
                <Text style={styles.error}>{error}</Text>
              </View>
            )}

            <Button
              label="Entrar"
              onPress={handleSignIn}
              loading={loading}
              icon={<ArrowRight size={18} color={COLORS.textOnPrimary} />}
              style={{ marginTop: 6 }}
            />
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>¿No tienes cuenta?</Text>
            <Link href="/register">
              <Text style={styles.footerLink}>Regístrate</Text>
            </Link>
          </View>
        </View>

        <Text style={styles.note}>
          Conéctate con tu pareja mediante código de invitación. 🍓
        </Text>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 24,
  },
  brand: { alignItems: 'center', marginBottom: 22 },
  logoBubble: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primarySoft,
    marginBottom: 12,
    ...SHADOWS.soft,
  },
  logoEmoji: { fontSize: 42 },
  logo: { fontFamily: FONTS.bold, fontSize: 30, color: COLORS.primary, letterSpacing: 0.4 },
  tagline: { fontSize: 12.5, color: COLORS.textSecondary, marginTop: 5 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.textPrimary },
  cardSub: { fontSize: 12.5, color: COLORS.textSecondary, marginTop: 3 },
  form: { gap: 14, marginTop: 18 },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: `${COLORS.danger}12`,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: RADIUS.sm,
  },
  error: { color: COLORS.danger, fontSize: 12, flex: 1 },
  footerRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  footerText: { color: COLORS.textSecondary, fontSize: 13 },
  footerLink: { color: COLORS.primary, fontFamily: FONTS.bold, fontSize: 13 },
  note: {
    color: COLORS.textSecondary,
    fontSize: 11.5,
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 17,
    paddingHorizontal: 12,
  },
});
