import { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text as RNText, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Nunito_400Regular, Nunito_600SemiBold } from '@expo-google-fonts/nunito';
import { Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';

import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import DecorBackground from '@/components/ui/DecorBackground';
import { COLORS } from '@/constants/colors';
import { FONTS, RADIUS } from '@/constants/theme';
import { useMealsRealtime } from '@/hooks/useMeals';
import { queryClient, setupQueryFocusManager } from '@/lib/queryClient';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { useStore } from '@/store/useStore';

function Splash() {
  return (
    <View style={styles.splash}>
      <DecorBackground />
      <View style={styles.splashContent}>
        <View style={styles.splashBubble}>
          <RNText style={{ fontSize: 52 }}>🍔</RNText>
        </View>
        <RNText style={styles.splashLogo}>IdeaComida</RNText>
        <RNText style={styles.splashSub}>decidir qué comer, juntos 💗</RNText>
        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 22 }} />
      </View>
    </View>
  );
}

function RootNavigator() {
  const { profile, initialized, fetchProfile, setProfile } = useStore();
  const segments = useSegments();
  const router = useRouter();

  // Realtime: comidas de la pareja.
  useMealsRealtime(profile?.couple_id);

  // Firebase restaura la sesión de forma asíncrona: hay que esperar a
  // onAuthStateChanged (leer auth.currentUser al arrancar da null y cerraba la sesión).
  useEffect(() => {
    if (!isFirebaseConfigured) {
      void fetchProfile();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Los perfiles de modo local no tienen usuario de Firebase: no se borran.
        if (useStore.getState().profile?.couple_id !== 'local-couple') setProfile(null);
        useStore.setState({ initialized: true, isLoading: false });
        return;
      }
      void fetchProfile();
    });

    return () => unsubscribe();
  }, [fetchProfile, setProfile]);

  // Guard de navegación: decide si el usuario puede ver las pantallas privadas.
  useEffect(() => {
    if (!initialized) return;

    const firstSegment = segments[0];
    const isAuthScreen = firstSegment === 'login' || firstSegment === 'register';

    if (!profile && !isAuthScreen) {
      router.replace('/login');
    } else if (profile && isAuthScreen) {
      router.replace('/');
    }
  }, [initialized, profile, segments, router]);

  if (!initialized) return <Splash />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="marca/[id]" />
      <Stack.Screen name="pareja" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  // Mantiene React Query sincronizado con el ciclo de vida de la app.
  useEffect(() => setupQueryFocusManager(), []);

  if (!fontsLoaded && !fontError) return <Splash />;

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashContent: { alignItems: 'center', paddingHorizontal: 32 },
  splashBubble: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primarySoft,
    marginBottom: 16,
  },
  splashLogo: {
    fontSize: 34,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 0.4,
  },
  splashSub: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  configContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  configContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 22,
  },
  configCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  configTitle: {
    fontFamily: FONTS.bold,
    fontSize: 21,
    color: COLORS.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  configText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  codeBox: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    padding: 14,
    marginBottom: 16,
    gap: 6,
    alignSelf: 'stretch',
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: COLORS.textPrimary,
  },
});
