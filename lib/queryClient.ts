import { QueryClient, focusManager } from '@tanstack/react-query';
import { AppState, Platform, type AppStateStatus } from 'react-native';

/**
 * Cliente global de React Query.
 * - Los datos de comidas/ofertas cambian poco: 30 s de frescura evita
 *   peticiones repetidas al cambiar de pestaña.
 * - No reintentamos errores de permisos (RLS) porque volver a preguntar
 *   no los va a resolver.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 30 * 60_000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        const message = error instanceof Error ? error.message.toLowerCase() : '';
        if (
          message.includes('row-level security') ||
          message.includes('permission denied') ||
          message.includes('jwt') ||
          message.includes('invalid api key')
        ) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * React Native no dispara `focus`/`visibilitychange` como el navegador.
 * Conectamos el ciclo de vida de la app para que React Query sepa cuándo
 * volver a pedir datos al recuperar el foco.
 */
export function setupQueryFocusManager() {
  const onChange = (status: AppStateStatus) => {
    if (Platform.OS !== 'web') {
      focusManager.setFocused(status === 'active');
    }
  };

  const subscription = AppState.addEventListener('change', onChange);
  return () => subscription.remove();
}
