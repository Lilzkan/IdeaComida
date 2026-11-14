import { useCallback, useState } from 'react';

/**
 * Estado de "pull to refresh" manual. Evita que el spinner aparezca cuando
 * React Query revalida en segundo plano (por ejemplo, por un evento Realtime).
 */
export function useRefresh(refetch: () => Promise<unknown>) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return { refreshing, onRefresh };
}
